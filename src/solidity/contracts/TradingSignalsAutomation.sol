// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "./SharedTypes.sol";

interface ITradingSignalsCore {
    function processSignalWithPrice(
        uint256 signalId,
        uint256 currentPrice,
        uint8 processType
    ) external returns (bool processed);
    
    function getSignal(uint256 signalId) external view returns (SharedTypes.TradingSignal memory);
    function isAssetSupported(string memory assetName) external view returns (bool);
    function assetToPolygonSymbol(string memory assetName) external view returns (string memory);
}

contract TradingSignalsAutomation is FunctionsClient, ConfirmedOwner, AutomationCompatibleInterface {
    using FunctionsRequest for FunctionsRequest.Request;

    // Configuration
    bytes32 private donId;
    uint64 private subscriptionId;
    uint32 public gasLimit = 300000;
    bytes public secretsUrl;
    string public priceSource;
    
    // Core contract reference
    address public coreContract;
    
    // Batch processing storage
    mapping(string => uint256[]) private signalsByAsset;           // assetName => signalIds[]
    mapping(string => uint256) private lastPriceUpdate;            // assetName => timestamp  
    mapping(string => uint256) private lastKnownPrices;            // assetName => last price
    mapping(string => uint256) private priceChangeThreshold;       // assetName => deviation in basis points
    mapping(bytes32 => string) private requestIdToAsset;          // requestId => assetName (for batch requests)
    mapping(string => bytes32) private assetToRequestId;           // assetName => requestId (prevent duplicate requests)
    mapping(string => uint8) private assetRequestReason;           // assetName => reason (0=monitoring, 1=expired_check)
    
    // Asset management
    string[] private monitoredAssets;
    mapping(string => bool) private isMonitoredAsset;
    
    // Timing configuration
    uint256 public priceCheckInterval = 300;                      // 5 minutes between regular checks
    uint256 public maxAssetsPerUpkeep = 5;                        // Max assets to check per upkeep
    
    // Events
    event AssetPriceRequested(string indexed assetName, string polygonSymbol, bytes32 requestId, uint256 signalCount);
    event AssetPriceReceived(string indexed assetName, uint256 price, uint256 timestamp, uint256 signalsProcessed);
    event AssetPriceRequestFailed(string indexed assetName, string reason);
    event SignalRegistered(uint256 indexed signalId, string indexed assetName);
    event SignalRemoved(uint256 indexed signalId, string indexed assetName);
    event CoreContractUpdated(address indexed oldContract, address indexed newContract);
    
    // Errors
    error Unauthorized();
    error InvalidInput();
    error NotFound();
    error InvalidAddress();
    
    modifier onlyCore() {
        if (msg.sender != coreContract && msg.sender != owner()) revert Unauthorized();
        _;
    }
    
    constructor(
        address router,
        bytes32 _donId,
        uint64 _subscriptionId,
        bytes memory _secretsUrl,
        address _coreContract
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        donId = _donId;
        subscriptionId = _subscriptionId;
        secretsUrl = _secretsUrl;
        coreContract = _coreContract;
    }
    
    // Signal registration (called by core contract)
    function registerSignalForMonitoring(
        uint256 signalId,
        string memory assetName,
        uint32 tolerancePercent
    ) external onlyCore {
        // Add signal to asset monitoring
        signalsByAsset[assetName].push(signalId);
        
        // Add to monitored assets if not already there
        if (!isMonitoredAsset[assetName]) {
            monitoredAssets.push(assetName);
            isMonitoredAsset[assetName] = true;
        }
        
        // Update price threshold based on signal tolerance
        _updatePriceThreshold(assetName, tolerancePercent);
        
        // Initialize price tracking if first signal for this asset
        if (lastKnownPrices[assetName] == 0) {
            _requestInitialPrice(assetName);
        }
        
        emit SignalRegistered(signalId, assetName);
    }
    
    function removeSignalFromMonitoring(uint256 signalId, string memory assetName) external onlyCore {
        uint256[] storage signalIds = signalsByAsset[assetName];
        
        for (uint256 i = 0; i < signalIds.length; i++) {
            if (signalIds[i] == signalId) {
                signalIds[i] = signalIds[signalIds.length - 1];
                signalIds.pop();
                break;
            }
        }
        
        // Remove from monitored assets if no more signals
        if (signalIds.length == 0) {
            _removeFromMonitoredAssets(assetName);
        }
        
        emit SignalRemoved(signalId, assetName);
    }
    
    function _removeFromMonitoredAssets(string memory assetName) internal {
        for (uint256 i = 0; i < monitoredAssets.length; i++) {
            if (keccak256(bytes(monitoredAssets[i])) == keccak256(bytes(assetName))) {
                monitoredAssets[i] = monitoredAssets[monitoredAssets.length - 1];
                monitoredAssets.pop();
                isMonitoredAsset[assetName] = false;
                break;
            }
        }
    }
    
    // Chainlink Automation
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        string[] memory assetsToCheck = new string[](maxAssetsPerUpkeep);
        uint8[] memory reasons = new uint8[](maxAssetsPerUpkeep); // 0=interval, 1=expired_signals
        uint256 assetCount = 0;
        
        // Check each monitored asset
        for (uint256 i = 0; i < monitoredAssets.length && assetCount < maxAssetsPerUpkeep; i++) {
            string memory assetName = monitoredAssets[i];
            uint256[] memory signalIds = signalsByAsset[assetName];
            
            if (signalIds.length == 0) continue;
            
            // Skip if we already have a pending request for this asset
            if (assetToRequestId[assetName] != bytes32(0)) continue;
            
            // Count active signals and check for expired ones
            uint256 activeCount = 0;
            uint256 expiredCount = 0;
            
            for (uint256 j = 0; j < signalIds.length; j++) {
                SharedTypes.TradingSignal memory signal = ITradingSignalsCore(coreContract).getSignal(signalIds[j]);
                if (signal.isValid && signal.status == 0) {
                    activeCount++;
                    if (block.timestamp >= signal.expiryTime) {
                        expiredCount++;
                    }
                }
            }
            
            if (activeCount == 0) continue;
            
            // Determine if we should check this asset
            bool shouldCheck = false;
            uint8 reason = 0;
            
            // Priority 1: Expired signals need immediate price check
            if (expiredCount > 0) {
                shouldCheck = true;
                reason = 1; // expired_check
            }
            // Priority 2: Regular interval for auto-close monitoring
            else if (block.timestamp >= lastPriceUpdate[assetName] + priceCheckInterval) {
                shouldCheck = true;
                reason = 0; // interval_check
            }
            
            if (shouldCheck) {
                assetsToCheck[assetCount] = assetName;
                reasons[assetCount] = reason;
                assetCount++;
            }
        }
        
        if (assetCount > 0) {
            upkeepNeeded = true;
            performData = abi.encode(assetsToCheck, reasons, assetCount);
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        (string[] memory assetsToCheck, uint8[] memory reasons, uint256 assetCount) = 
            abi.decode(performData, (string[], uint8[], uint256));
        
        for (uint256 i = 0; i < assetCount; i++) {
            string memory assetName = assetsToCheck[i];
            uint8 reason = reasons[i];
            
            // Request price for this asset
            _requestPriceForAsset(assetName, reason);
        }
    }
    
    // Batch price request
    function _requestPriceForAsset(string memory assetName, uint8 reason) internal returns (bytes32 requestId) {
        // Check if we already have a pending request for this asset
        if (assetToRequestId[assetName] != bytes32(0)) {
            return bytes32(0); // Request already pending
        }
        
        // Get polygon symbol from core contract
        string memory polygonSymbol;
        try ITradingSignalsCore(coreContract).assetToPolygonSymbol(assetName) returns (string memory symbol) {
            polygonSymbol = symbol;
        } catch {
            return bytes32(0);
        }
        
        if (bytes(polygonSymbol).length == 0) return bytes32(0);
        
        // Use same edge function as core contract
        string memory source = bytes(priceSource).length != 0 ? priceSource : "const s=args[0],k=secrets.supaBaseKey,x=secrets.xApiKey;if(!s)throw Error('Symbol required');if(!x)throw Error('Missing xApiKey');try{const r=await Functions.makeHttpRequest({url:'https://mjalvgosvkxviwaphqxh.supabase.co/functions/v1/fetch-price',method:'POST',headers:{Authorization:`Bearer ${k}`,'Content-Type':'application/json','xApiKey':x},data:{symbol:s}});if(r.error)throw Error(r.error.message);if(!r.data)throw Error('No data');if(r.data.success!==1)throw Error(r.data.error||'Unknown error');const p=r.data.encodedPrice;if(!p||p<=0)throw Error(`Invalid: ${p}`);return Functions.encodeUint256(p)}catch(e){throw Error(`Failed: ${e.message}`)}";
        
        string[] memory args = new string[](1);
        args[0] = polygonSymbol;
        
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.setArgs(args);
        req.addSecretsReference(secretsUrl);
        
        requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donId);
        
        if (requestId != bytes32(0)) {
            // Track the batch request
            requestIdToAsset[requestId] = assetName;
            assetToRequestId[assetName] = requestId;
            assetRequestReason[assetName] = reason;
            lastPriceUpdate[assetName] = block.timestamp;
            
            uint256 signalCount = signalsByAsset[assetName].length;
            emit AssetPriceRequested(assetName, polygonSymbol, requestId, signalCount);
        }
        
        return requestId;
    }
    
    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        // Handle batch asset price request
        string memory assetName = requestIdToAsset[requestId];
        if (bytes(assetName).length > 0) {
            _handleAssetPriceResponse(requestId, response, err, assetName);
            return;
        }
    }
    
    function _handleAssetPriceResponse(bytes32 requestId, bytes memory response, bytes memory err, string memory assetName) internal {
        // Clean up tracking
        delete requestIdToAsset[requestId];
        delete assetToRequestId[assetName];
        
        if (err.length > 0) {
            emit AssetPriceRequestFailed(assetName, string(err));
            delete assetRequestReason[assetName];
            return;
        }
        
        // Decode price
        uint256 currentPrice;
        try this.decodePrice(response) returns (uint256 decodedPrice) {
            currentPrice = decodedPrice;
        } catch {
            emit AssetPriceRequestFailed(assetName, "Failed to decode price");
            delete assetRequestReason[assetName];
            return;
        }
        
        // Update price tracking
        uint256 oldPrice = lastKnownPrices[assetName];
        lastKnownPrices[assetName] = currentPrice;
        lastPriceUpdate[assetName] = block.timestamp;
        
        // Process all signals for this asset
        uint8 reason = assetRequestReason[assetName];
        uint256 signalsProcessed = _processAllSignalsForAsset(assetName, currentPrice, oldPrice, reason);
        
        emit AssetPriceReceived(assetName, currentPrice, block.timestamp, signalsProcessed);
        
        // Clean up
        delete assetRequestReason[assetName];
    }
    
    function _processAllSignalsForAsset(string memory assetName, uint256 currentPrice, uint256 oldPrice, uint8 reason) internal returns (uint256 processed) {
        uint256[] storage signalIds = signalsByAsset[assetName];
        processed = 0;
        
        // Check if price moved significantly
        bool significantMove = oldPrice > 0 && _hasSignificantPriceChange(oldPrice, currentPrice, assetName);
        
        // Process signals (reverse loop to handle array modifications)
        for (uint256 i = signalIds.length; i > 0; i--) {
            uint256 signalId = signalIds[i - 1];
            
            // Get signal info from core contract
            SharedTypes.TradingSignal memory signal = ITradingSignalsCore(coreContract).getSignal(signalId);
            
            // Skip inactive signals and remove from monitoring
            if (!signal.isValid || signal.status != 0) {
                signalIds[i - 1] = signalIds[signalIds.length - 1];
                signalIds.pop();
                continue;
            }
            
            bool shouldRemove = false;
            
            // Priority processing for expired signals
            if (reason == 1 && block.timestamp >= signal.expiryTime) {
                try ITradingSignalsCore(coreContract).processSignalWithPrice(signalId, currentPrice, 1) returns (bool processed_) {
                    if (processed_) {
                        shouldRemove = true;
                        processed++;
                    }
                } catch {}
            }
            // Auto-close processing for significant price moves or regular checks
            else if (signal.autoClose && (significantMove || reason == 0)) {
                try ITradingSignalsCore(coreContract).processSignalWithPrice(signalId, currentPrice, 0) returns (bool processed_) {
                    if (processed_) {
                        shouldRemove = true;
                        processed++;
                    }
                } catch {}
            }
            
            // Remove processed signals from monitoring
            if (shouldRemove) {
                signalIds[i - 1] = signalIds[signalIds.length - 1];
                signalIds.pop();
            }
        }
        
        // Remove asset from monitoring if no more signals
        if (signalIds.length == 0) {
            _removeFromMonitoredAssets(assetName);
        }
        
        return processed;
    }
    
    function _hasSignificantPriceChange(uint256 oldPrice, uint256 newPrice, string memory assetName) internal view returns (bool) {
        if (oldPrice == 0) return false;
        
        uint256 threshold = priceChangeThreshold[assetName];
        if (threshold == 0) threshold = 100; // Default 1%
        
        uint256 difference = oldPrice > newPrice ? oldPrice - newPrice : newPrice - oldPrice;
        uint256 deviation = (difference * 10000) / oldPrice; // basis points
        
        return deviation >= threshold;
    }
    
    function _updatePriceThreshold(string memory assetName, uint32 signalTolerance) internal {
        uint256 signalThreshold = signalTolerance * 100; // Convert to basis points
        uint256 currentThreshold = priceChangeThreshold[assetName];
        
        // Set to half of minimum tolerance for early detection
        uint256 newThreshold = signalThreshold / 2;
        
        if (currentThreshold == 0 || newThreshold < currentThreshold) {
            priceChangeThreshold[assetName] = newThreshold;
        }
    }
    
    function _requestInitialPrice(string memory assetName) internal {
        _requestPriceForAsset(assetName, 0);
    }
    
    function decodePrice(bytes memory response) external pure returns (uint256) {
        if (response.length < 32) revert InvalidInput();
        return abi.decode(response, (uint256));
    }
    
    // View functions
    function getSignalsForAsset(string memory assetName) external view returns (uint256[] memory) {
        return signalsByAsset[assetName];
    }
    
    function getAssetMonitoringInfo(string memory assetName) external view returns (
        uint256[] memory signalIds,
        uint256 lastPrice,
        uint256 lastUpdate,
        uint256 threshold,
        bool hasPendingRequest
    ) {
        signalIds = signalsByAsset[assetName];
        lastPrice = lastKnownPrices[assetName];
        lastUpdate = lastPriceUpdate[assetName];
        threshold = priceChangeThreshold[assetName];
        hasPendingRequest = assetToRequestId[assetName] != bytes32(0);
    }
    
    function getMonitoredAssets() external view returns (string[] memory) {
        return monitoredAssets;
    }
    
    function getUpkeepStatus() external view returns (
        uint256 totalAssets,
        uint256 totalActiveSignals,
        uint256 assetsNeedingCheck
    ) {
        totalAssets = monitoredAssets.length;
        
        for (uint256 i = 0; i < monitoredAssets.length; i++) {
            string memory assetName = monitoredAssets[i];
            uint256[] memory signalIds = signalsByAsset[assetName];
            
            uint256 activeCount = 0;
            bool needsCheck = false;
            
            for (uint256 j = 0; j < signalIds.length; j++) {
                SharedTypes.TradingSignal memory signal = ITradingSignalsCore(coreContract).getSignal(signalIds[j]);
                if (signal.isValid && signal.status == 0) {
                    activeCount++;
                    if (block.timestamp >= signal.expiryTime || 
                        block.timestamp >= lastPriceUpdate[assetName] + priceCheckInterval) {
                        needsCheck = true;
                    }
                }
            }
            
            totalActiveSignals += activeCount;
            if (needsCheck && assetToRequestId[assetName] == bytes32(0)) {
                assetsNeedingCheck++;
            }
        }
    }
    
    // Admin functions
    function setCoreContract(address _coreContract) external onlyOwner {
        if (_coreContract == address(0)) revert InvalidAddress();
        emit CoreContractUpdated(coreContract, _coreContract);
        coreContract = _coreContract;
    }
    
    function updateGasLimit(uint32 newLimit) external onlyOwner {
        gasLimit = newLimit;
    }
    
    function updateDonId(bytes32 newDonId) external onlyOwner {
        donId = newDonId;
    }
    
    function updateSubscriptionId(uint64 newSubscriptionId) external onlyOwner {
        subscriptionId = newSubscriptionId;
    }
    
    function setPriceSource(string memory _priceSource) external onlyOwner {
        priceSource = _priceSource;
    }
    
    function setPriceCheckInterval(uint256 _interval) external onlyOwner {
        if (_interval < 60 || _interval > 3600) revert InvalidInput();
        priceCheckInterval = _interval;
    }
    
    function setMaxAssetsPerUpkeep(uint256 _maxAssets) external onlyOwner {
        if (_maxAssets == 0 || _maxAssets > 20) revert InvalidInput();
        maxAssetsPerUpkeep = _maxAssets;
    }
    
    function setPriceChangeThreshold(string memory assetName, uint256 threshold) external onlyOwner {
        if (threshold < 10 || threshold > 1000) revert InvalidInput();
        priceChangeThreshold[assetName] = threshold;
    }
    
    // Emergency functions
    function manualAssetPriceRequest(string memory assetName, uint8 reason) external onlyOwner returns (bytes32 requestId) {
        return _requestPriceForAsset(assetName, reason);
    }
    
    function cleanupStaleSignals(string memory assetName) external onlyOwner {
        uint256[] storage signalIds = signalsByAsset[assetName];
        
        for (uint256 i = signalIds.length; i > 0; i--) {
            uint256 signalId = signalIds[i - 1];
            SharedTypes.TradingSignal memory signal = ITradingSignalsCore(coreContract).getSignal(signalId);
            
            if (!signal.isValid || signal.status != 0) {
                signalIds[i - 1] = signalIds[signalIds.length - 1];
                signalIds.pop();
            }
        }
        
        // Remove asset from monitoring if no more signals
        if (signalIds.length == 0) {
            _removeFromMonitoredAssets(assetName);
        }
    }
    
    function forceRemoveAsset(string memory assetName) external onlyOwner {
        delete signalsByAsset[assetName];
        delete lastPriceUpdate[assetName];
        delete lastKnownPrices[assetName];
        delete priceChangeThreshold[assetName];
        _removeFromMonitoredAssets(assetName);
    }
}