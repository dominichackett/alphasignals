// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import "./SharedTypes.sol";
import "./SignalProcessingLibrary.sol";
import "./AssetManagementLibrary.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface LinkTokenInterface {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

interface ITradingSignalsAutomation {
    function registerSignalForMonitoring(
        uint256 signalId,
        string memory assetName,
        uint32 tolerancePercent
    ) external;
    
    function removeSignalFromMonitoring(uint256 signalId, string memory assetName) external;
    
    function processSignalWithPrice(
        uint256 signalId,
        uint256 currentPrice,
        uint8 processType
    ) external returns (bool processed);
}

contract TradingSignalsCore is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;
    using AssetManagementLibrary for mapping(string => string);

    // Configuration
    bytes32 private donId;
    uint64 private subscriptionId;
    uint32 public gasLimit = 300000;
    address private linkToken;
    bytes public secretsUrl;
    string public createSource;
    string public updateSource;
    string public priceSource;
    
    // Automation contract
    address public automationContract;
    
    // Pause functionality
    bool public paused;
    mapping(address => bool) private pauseExempt;
    
    // Core storage
    mapping(uint256 => SharedTypes.TradingSignal) private signals;
    mapping(bytes32 => SharedTypes.SignalMetadata) private signalMetadata;
    uint256 public signalCounter;
    mapping(bytes32 => SharedTypes.PendingPriceRequest) private pendingPriceRequests;
    mapping(bytes32 => uint256) private requestIdToSignalId;
    
    // Asset mappings
    mapping(string => string) private assetToPolygonSymbol;
    string[] private supportedAssetsList;
    
    // Reputation
    mapping(address => uint256) public successfulSignals;
    mapping(address => uint256) public totalSignals;
    mapping(address => uint256) public reputationScore;
    
    // Events
    event SignalCreationRequested(address indexed requester, string databaseId, bytes32 requestId);
    event SignalCreated(uint256 indexed signalId, address indexed analyst, string databaseId);
    event SignalCreationFailed(string databaseId, string reason);
    event SignalVerified(uint256 indexed signalId, uint8 status, uint256 actualPrice);
    event ReputationUpdated(address indexed analyst, uint256 newScore);
    event PriceRequested(uint256 indexed signalId, string symbol, bytes32 requestId);
    event PriceReceived(uint256 indexed signalId, uint256 price, uint256 timestamp);
    event SignalCreatedPending(uint256 indexed signalId, address indexed analyst, string databaseId, bytes32 requestId);
    event PriceRequestFailed(uint256 indexed signalId, string reason);
    event Paused(address indexed account);
    event Unpaused(address indexed account);
    event AutomationContractUpdated(address indexed oldContract, address indexed newContract);
    
    // Errors
    error InvalidInput();
    error NotFound();
    error Unauthorized();
    error ContractPaused();
    error InvalidStatus();
    error Unsupported();
    error InvalidAddress();
    error TransferFailed();
    
    // Modifiers
    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }
    
    modifier whenPaused() {
        if (!paused) revert InvalidStatus();
        _;
    }
    
    modifier notPausedOrExempt() {
        if (paused && !pauseExempt[msg.sender]) revert ContractPaused();
        _;
    }
    
    modifier onlyAutomation() {
        if (msg.sender != automationContract && msg.sender != owner()) revert Unauthorized();
        _;
    }
    
    constructor(
        address router,
        bytes32 _donId,
        uint64 _subscriptionId,
        address _linkToken,
        bytes memory _secretsUrl
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        donId = _donId;
        subscriptionId = _subscriptionId;
        linkToken = _linkToken;
        secretsUrl = _secretsUrl;
        pauseExempt[msg.sender] = true;
        
        AssetManagementLibrary.initializeAssetMappings(assetToPolygonSymbol, supportedAssetsList);
    }
    
    // Signal creation
    function createSignalFromDatabase(
        string memory _databaseId, 
        uint256 entryPrice,
        uint256 targetPrice,
        uint256 stopLoss,
        uint32 confidence,
        string memory assetName,
        string memory patternName,
        string memory assetType,
        string memory recommendation,
        string memory sentiment
    ) external whenNotPaused returns (bytes32 requestId) {
        if (bytes(_databaseId).length == 0) revert InvalidInput();

        signalCounter++;
        uint256 currentSignalId = signalCounter;

        bytes32 dataHash = keccak256(abi.encodePacked(assetName, patternName, msg.sender, block.timestamp));
        (string memory polygonSymbol, bool supported) = AssetManagementLibrary.tryGetPolygonSymbol(assetName, assetToPolygonSymbol);
        
        signalMetadata[dataHash] = SharedTypes.SignalMetadata({
            assetName: assetName,
            assetType: assetType,
            patternName: patternName,
            recommendation: recommendation,
            sentiment: sentiment,
            userId: "",
            dataHash: dataHash,
            reason: supported ? "DB signal" : "DB signal (unsupported)",
            polygonSymbol: supported ? polygonSymbol : ""
        });
        
        signals[currentSignalId] = SharedTypes.TradingSignal({
            id: currentSignalId,
            analyst: msg.sender,
            entryPrice: entryPrice,
            targetPrice: targetPrice,
            stopLoss: stopLoss,
            confidence: confidence,
            timestamp: block.timestamp,
            expiryTime: block.timestamp + 86400,
            status: 0,
            closingPrice: 0,
            closingTime: 0,
            autoClose: supported,
            tolerancePercent: 50,
            isValid: false,
            dataHash: dataHash,
            databaseId: _databaseId,
            requestId: bytes32(0)
        });
        
        string memory source = bytes(createSource).length != 0 ? createSource : 
            "const x=secrets.xApiKey,s=args[0],w=args[1],u='https://mjalvgosvkxviwaphqxh.supabase.co',k=secrets.supabaseKey,r=await Functions.makeHttpRequest({url:`${u}/functions/v1/trading-signal?id=${s}&wallet_address=${w}`,method:'GET',headers:{Authorization:`Bearer ${k}`,xApiKey:x}});if(r.error)throw Error('Query failed');if(!r.data||r.data.success!==1||!r.data.signal)throw Error('Not found');const d=r.data.signal;if(d.status!=='Open')throw Error('Not open');return Functions.encodeString(`${d.entry_price||0},${d.take_profit||d.exit_price||d.entry_price*1.05||0},${d.stop_loss||0},${d.confidence||0},${d.asset_name||''},${d.pattern_name||''},${d.asset_type||'Unknown'},${d.recommendation||'Hold'},${d.sentiment||'Neutral'}`);";
        
        string[] memory args = new string[](2);
        args[0] = _databaseId;
        args[1] = _addressToString(msg.sender);
        
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.setArgs(args);
        req.addSecretsReference(secretsUrl);
        
        requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donId);
        
        signals[currentSignalId].requestId = requestId;
        requestIdToSignalId[requestId] = currentSignalId;
        
        emit SignalCreationRequested(msg.sender, _databaseId, requestId);
        emit SignalCreatedPending(currentSignalId, msg.sender, _databaseId, requestId);
        
        return requestId;
    }

    function isAssetSupported(string memory assetName) public view returns (bool) {
        return AssetManagementLibrary.isAssetSupported(assetName, assetToPolygonSymbol);
    }
    
    // Individual price requests for manual operations
    function getPriceFromPolygon(uint256 signalId, uint8 requestType) public notPausedOrExempt returns (bytes32 requestId) {
        SharedTypes.TradingSignal memory signal = signals[signalId];
        if (signal.id == 0) revert NotFound();
        if (signal.status != 0) revert InvalidStatus();
        
        SharedTypes.SignalMetadata memory meta = signalMetadata[signal.dataHash];
        
        string memory polygonSymbol;
        bool supported;
        
        if (bytes(meta.polygonSymbol).length > 0) {
            polygonSymbol = meta.polygonSymbol;
            supported = true;
        } else {
            (polygonSymbol, supported) = AssetManagementLibrary.tryGetPolygonSymbol(meta.assetName, assetToPolygonSymbol);
        }
        
        if (!supported) revert Unsupported();
        
        string memory source = bytes(priceSource).length != 0 ? priceSource : "const s=args[0],k=secrets.supaBaseKey,x=secrets.xApiKey;if(!s)throw Error('Symbol required');if(!x)throw Error('Missing xApiKey');try{const r=await Functions.makeHttpRequest({url:'https://mjalvgosvkxviwaphqxh.supabase.co/functions/v1/fetch-price',method:'POST',headers:{Authorization:`Bearer ${k}`,'Content-Type':'application/json','xApiKey':x},data:{symbol:s}});if(r.error)throw Error(r.error.message);if(!r.data)throw Error('No data');if(r.data.success!==1)throw Error(r.data.error||'Unknown error');const p=r.data.encodedPrice;if(!p||p<=0)throw Error(`Invalid: ${p}`);return Functions.encodeUint256(p)}catch(e){throw Error(`Failed: ${e.message}`)}";
        string[] memory args = new string[](1);
        args[0] = polygonSymbol;
        
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.setArgs(args);
        req.addSecretsReference(secretsUrl);
        
        requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donId);
        
        pendingPriceRequests[requestId] = SharedTypes.PendingPriceRequest({
            signalId: signalId,
            requestType: requestType,
            requester: msg.sender,
            timestamp: block.timestamp
        });
        
        emit PriceRequested(signalId, polygonSymbol, requestId);
        return requestId;
    }
   
    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        // Signal creation request
        uint256 signalId = requestIdToSignalId[requestId];
        if (signalId != 0) {
            _handleSignalValidation(requestId, response, err);
            return;
        }
        
        // Individual signal price request
        SharedTypes.PendingPriceRequest memory pendingPrice = pendingPriceRequests[requestId];
        if (pendingPrice.signalId != 0) {
            _handlePriceResponse(requestId, response, err, pendingPrice);
            return;
        }
    }

    function _handlePriceResponse(
        bytes32 requestId,
        bytes memory response,
        bytes memory err,
        SharedTypes.PendingPriceRequest memory pending
    ) internal {
        if (err.length > 0) {
            delete pendingPriceRequests[requestId];
            return;
        }
        
        SharedTypes.TradingSignal storage signal = signals[pending.signalId];
        if (signal.id == 0 || !signal.isValid) {
            delete pendingPriceRequests[requestId];
            return;
        }
        
        uint256 price;
        try this.decodePrice(response) returns (uint256 decodedPrice) {
            price = decodedPrice;
        } catch {
            delete pendingPriceRequests[requestId];
            return;
        }
        
        emit PriceReceived(pending.signalId, price, block.timestamp);
        
        if (pending.requestType == 0) {
            _processAutoClose(pending.signalId, price);
        } else if (pending.requestType == 1) {
            _processVerification(pending.signalId, price);
        } else if (pending.requestType == 2) {
            _processManualClose(pending.signalId, price);
        }
        
        delete pendingPriceRequests[requestId];
    }

    function decodePrice(bytes memory response) external pure returns (uint256) {
        if (response.length < 32) revert InvalidInput();
        return abi.decode(response, (uint256));
    }

    function _handleSignalValidation(bytes32 requestId, bytes memory response, bytes memory err) internal {
        uint256 signalId = requestIdToSignalId[requestId];
        if (signalId == 0) revert InvalidInput();
        
        SharedTypes.TradingSignal storage signal = signals[signalId];
        if (signal.id != signalId) revert InvalidInput();
        if (signal.isValid) revert InvalidStatus();
        
        if (err.length > 0) {
            signal.status = 2;
            signal.closingTime = block.timestamp;
            signal.closingPrice = signal.entryPrice;
            
            emit SignalCreationFailed(signal.databaseId, string(err));
            _updateSignalStatus(signal.databaseId, signal.status, signal.entryPrice, "Chainlink validation failed");
        } else {
            signal.isValid = true;
            totalSignals[signal.analyst]++;
            
            // Register with automation contract if available and supported
            if (automationContract != address(0)) {
                SharedTypes.SignalMetadata memory meta = signalMetadata[signal.dataHash];
                if (AssetManagementLibrary.isAssetSupported(meta.assetName, assetToPolygonSymbol)) {
                    try ITradingSignalsAutomation(automationContract).registerSignalForMonitoring(
                        signalId,
                        meta.assetName,
                        signal.tolerancePercent
                    ) {} catch {}
                }
            }
            
            emit SignalCreated(signalId, signal.analyst, signal.databaseId);
        }
        
        delete requestIdToSignalId[requestId];
    }
    
    // Signal processing functions
    function _processAutoClose(uint256 signalId, uint256 currentPrice) internal {
        (bool shouldClose, string memory reason) = SignalProcessingLibrary.processAutoClose(
            signals[signalId],
            signalMetadata[signals[signalId].dataHash],
            currentPrice,
            successfulSignals
        );
        
        if (shouldClose) {
            _updateReputation(signals[signalId].analyst);
            _updateSignalStatus(signals[signalId].databaseId, signals[signalId].status, currentPrice, reason);
            _removeSignalFromAutomation(signalId);
        }
    }
    
    function _processVerification(uint256 signalId, uint256 currentPrice) internal {
        uint8 newStatus = SignalProcessingLibrary.processVerification(
            signals[signalId],
            currentPrice,
            successfulSignals
        );
        
        _updateReputation(signals[signalId].analyst);
        _updateSignalStatus(signals[signalId].databaseId, newStatus, currentPrice, "Verified");
        _removeSignalFromAutomation(signalId);
        
        emit SignalVerified(signalId, newStatus, currentPrice);
    }
    
    function _processManualClose(uint256 signalId, uint256 currentPrice) internal {
        SignalProcessingLibrary.processManualClose(
            signals[signalId],
            currentPrice,
            successfulSignals
        );
        
        _updateReputation(signals[signalId].analyst);
        _updateSignalStatus(signals[signalId].databaseId, signals[signalId].status, currentPrice, "Manual");
        _removeSignalFromAutomation(signalId);
    }
    
    // External signal processing (called by automation contract)
    function processSignalWithPrice(
        uint256 signalId,
        uint256 currentPrice,
        uint8 processType
    ) external onlyAutomation returns (bool processed) {
        SharedTypes.TradingSignal storage signal = signals[signalId];
        if (!signal.isValid || signal.status != 0) return false;
        
        if (processType == 0) {
            // Auto-close
            (bool shouldClose, string memory reason) = _shouldAutoClose(signal, currentPrice);
            if (shouldClose) {
                _processAutoCloseWithPrice(signalId, currentPrice, reason);
                return true;
            }
        } else if (processType == 1) {
            // Verification
            _processVerificationWithPrice(signalId, currentPrice);
            return true;
        } else if (processType == 2) {
            // Manual close
            _processManualCloseWithPrice(signalId, currentPrice);
            return true;
        }
        
        return false;
    }
    
    function _shouldAutoClose(SharedTypes.TradingSignal memory signal, uint256 currentPrice) internal pure returns (bool shouldClose, string memory reason) {
        if (signal.targetPrice > signal.entryPrice) {
            // Bullish signal
            uint256 target = signal.targetPrice - (signal.targetPrice * signal.tolerancePercent / 10000);
            if (currentPrice >= target) {
                shouldClose = true;
                reason = "Target reached";
            } else if (currentPrice <= signal.stopLoss) {
                shouldClose = true;
                reason = "Stop loss hit";
            }
        } else {
            // Bearish signal
            uint256 target = signal.targetPrice + (signal.targetPrice * signal.tolerancePercent / 10000);
            if (currentPrice <= target) {
                shouldClose = true;
                reason = "Target reached";
            } else if (currentPrice >= signal.stopLoss) {
                shouldClose = true;
                reason = "Stop loss hit";
            }
        }
        
        return (shouldClose, reason);
    }
    
    function _processAutoCloseWithPrice(uint256 signalId, uint256 currentPrice, string memory reason) internal {
        SharedTypes.TradingSignal storage signal = signals[signalId];
        
        signal.closingPrice = currentPrice;
        signal.closingTime = block.timestamp;
        signal.status = 1; // CLOSED
        
        bool isProfit = (signal.targetPrice > signal.entryPrice) ? 
            currentPrice > signal.entryPrice : 
            currentPrice < signal.entryPrice;
            
        if (isProfit) {
            successfulSignals[signal.analyst]++;
        }
        
        _updateReputation(signal.analyst);
        _updateSignalStatus(signal.databaseId, signal.status, currentPrice, reason);
        _removeSignalFromAutomation(signalId);
        
        emit SignalVerified(signalId, signal.status, currentPrice);
    }
    
    function _processVerificationWithPrice(uint256 signalId, uint256 currentPrice) internal {
        SharedTypes.TradingSignal storage signal = signals[signalId];
        
        bool isSuccess = (signal.targetPrice > signal.entryPrice) ? 
            currentPrice > signal.entryPrice : 
            currentPrice < signal.entryPrice;
        
        uint8 newStatus = isSuccess ? 1 : 3; // CLOSED or EXPIRED
        signal.status = newStatus;
        signal.closingPrice = currentPrice;
        signal.closingTime = block.timestamp;
        
        if (isSuccess) {
            successfulSignals[signal.analyst]++;
        }
        
        _updateReputation(signal.analyst);
        _updateSignalStatus(signal.databaseId, newStatus, currentPrice, "Verification completed");
        _removeSignalFromAutomation(signalId);
        
        emit SignalVerified(signalId, newStatus, currentPrice);
    }
    
    function _processManualCloseWithPrice(uint256 signalId, uint256 currentPrice) internal {
        SharedTypes.TradingSignal storage signal = signals[signalId];
        
        bool isProfit = (signal.targetPrice > signal.entryPrice) ? 
            currentPrice > signal.entryPrice : 
            currentPrice < signal.entryPrice;
        
        signal.closingPrice = currentPrice;
        signal.closingTime = block.timestamp;
        signal.status = 1; // CLOSED
        
        if (isProfit) {
            successfulSignals[signal.analyst]++;
        }
        
        _updateReputation(signal.analyst);
        _updateSignalStatus(signal.databaseId, signal.status, currentPrice, "Manual close");
        _removeSignalFromAutomation(signalId);
        
        emit SignalVerified(signalId, signal.status, currentPrice);
    }
    
    function _removeSignalFromAutomation(uint256 signalId) internal {
        if (automationContract != address(0)) {
            SharedTypes.TradingSignal memory signal = signals[signalId];
            SharedTypes.SignalMetadata memory meta = signalMetadata[signal.dataHash];
            try ITradingSignalsAutomation(automationContract).removeSignalFromMonitoring(signalId, meta.assetName) {} catch {}
        }
    }
    
    function _updateSignalStatus(string memory databaseId, uint8 status, uint256 price, string memory reason) internal {
        string memory statusStr = status == 0 ? "Open" : status == 1 ? "Closed" : status == 2 ? "Cancelled" : "Expired";
        
        string memory source = bytes(updateSource).length !=0 ? updateSource:"const x=secrets.xApiKey,i=args[0],s=args[1],p=args[2],r=args[3],u='https://mjalvgosvkxviwaphqxh.supabase.co',k=secrets.supabaseKey,d={databaseId:i,signalStatus:s,currentPrice:parseFloat(p)};if(s!=='Open'&&r)d.closeReason=r;await Functions.makeHttpRequest({url:`${u}/functions/v1/update-trading-signal`,method:'POST',headers:{Authorization:`Bearer ${k}`,xApiKey:x,'Content-Type':'application/json'},data:d});return Functions.encodeUint256(1);";
        
        string[] memory args = new string[](4);
        args[0] = databaseId;
        args[1] = statusStr;
        args[2] = Strings.toString(price);
        args[3] = reason;
        
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.setArgs(args);
        req.addSecretsReference(secretsUrl);
        
        _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donId);
    }

    // Utility functions
    function closeSignalManually(uint256 signalId) external whenNotPaused {
        SharedTypes.TradingSignal memory signal = signals[signalId];
        if (signal.status != 0) revert InvalidStatus();
        if (msg.sender != signal.analyst && msg.sender != owner()) revert Unauthorized();
        
        getPriceFromPolygon(signalId, 2);
    }
    
    function _updateReputation(address analyst) internal {
        uint256 total = totalSignals[analyst];
        uint256 successful = successfulSignals[analyst];
        
        if (total > 0) {
            reputationScore[analyst] = (successful * 10000) / total;
            emit ReputationUpdated(analyst, reputationScore[analyst]);
        }
    }
    
    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
    
    // Admin functions
    function pause() external onlyOwner whenNotPaused {
        paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() external onlyOwner whenPaused {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    function setPauseExemption(address account, bool exempt) external onlyOwner {
        if (account == address(0)) revert InvalidAddress();
        pauseExempt[account] = exempt;
    }
    
    function setAutomationContract(address _automationContract) external onlyOwner {
        emit AutomationContractUpdated(automationContract, _automationContract);
        automationContract = _automationContract;
    }
    
    function emergencyCloseSignal(uint256 signalId, uint256 closingPrice, string memory reason) external onlyOwner {
        SharedTypes.TradingSignal storage signal = signals[signalId];
        if (signal.status != 0) revert InvalidStatus();
        
        signal.closingPrice = closingPrice;
        signal.closingTime = block.timestamp;
        signal.status = 2;
        
        _removeSignalFromAutomation(signalId);
        _updateReputation(signal.analyst);
        _updateSignalStatus(signal.databaseId, signal.status, closingPrice, reason);
        
        emit SignalVerified(signalId, signal.status, closingPrice);
    }
    
    // View functions
    function getSignal(uint256 signalId) external view returns (SharedTypes.TradingSignal memory) {
        return signals[signalId];
    }
    
    function getSignalMetadata(bytes32 dataHash) external view returns (SharedTypes.SignalMetadata memory) {
        return signalMetadata[dataHash];
    }
    
    function getFullSignalData(uint256 signalId) external view returns (SharedTypes.TradingSignal memory signal, SharedTypes.SignalMetadata memory metadata) {
        signal = signals[signalId];
        metadata = signalMetadata[signal.dataHash];
    }
    
    function getSupportedAssets() external view returns (string[] memory assets, string[] memory polygonSymbols) {
        return AssetManagementLibrary.getSupportedAssets(supportedAssetsList, assetToPolygonSymbol);
    }
    
    // LINK management
    function withdrawLink(address to, uint256 amount) external onlyOwner {
        if (to == address(0) || linkToken == address(0)) revert InvalidAddress();
        LinkTokenInterface link = LinkTokenInterface(linkToken);
        if (link.balanceOf(address(this)) < amount) revert InvalidInput();
        if (!link.transfer(to, amount)) revert TransferFailed();
    }
    
    // Configuration functions
    function addAssetMapping(string memory asset, string memory polygonSymbol) external onlyOwner {
        AssetManagementLibrary.addAssetMapping(asset, polygonSymbol, assetToPolygonSymbol, supportedAssetsList);
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
    
    function setCreateSource(string memory _createSource) external onlyOwner {
        createSource = _createSource;
    }
    
    function setUpdateSource(string memory _updateSource) external onlyOwner {
        updateSource = _updateSource;
    }
}