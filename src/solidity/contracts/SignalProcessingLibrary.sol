// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SharedTypes.sol";

library SignalProcessingLibrary {
    
    event SignalClosed(uint256 indexed signalId, uint8 status, uint256 closingPrice, string reason);
    
    function processAutoClose(
        SharedTypes.TradingSignal storage signal,
        SharedTypes.SignalMetadata memory meta,
        uint256 currentPrice,
        mapping(address => uint256) storage successfulSignals
    ) external returns (bool shouldClose, string memory reason) {
        bool isProfit = false;
        
        if (signal.targetPrice > signal.entryPrice) {
            // Bullish signal
            uint256 target = signal.targetPrice - (signal.targetPrice * signal.tolerancePercent / 10000);
            if (currentPrice >= target) {
                shouldClose = true;
                isProfit = true;
                reason = "Target reached";
            } else if (currentPrice <= signal.stopLoss) {
                shouldClose = true;
                isProfit = false;
                reason = "Stop loss hit";
            }
        } else {
            // Bearish signal
            uint256 target = signal.targetPrice + (signal.targetPrice * signal.tolerancePercent / 10000);
            if (currentPrice <= target) {
                shouldClose = true;
                isProfit = true;
                reason = "Target reached";
            } else if (currentPrice >= signal.stopLoss) {
                shouldClose = true;
                isProfit = false;
                reason = "Stop loss hit";
            }
        }
        
        if (shouldClose) {
            signal.closingPrice = currentPrice;
            signal.closingTime = block.timestamp;
            signal.status = 1; // CLOSED
            
            if (isProfit) {
                successfulSignals[signal.analyst]++;
            }
            
            emit SignalClosed(signal.id, signal.status, currentPrice, reason);
        }
        
        return (shouldClose, reason);
    }
    
    function processVerification(
        SharedTypes.TradingSignal storage signal,
        uint256 currentPrice,
        mapping(address => uint256) storage successfulSignals
    ) external returns (uint8 newStatus) {
        bool isSuccess = (signal.targetPrice > signal.entryPrice) ? 
            currentPrice > signal.entryPrice : 
            currentPrice < signal.entryPrice;
        
        newStatus = isSuccess ? 1 : 3; // CLOSED or EXPIRED
        signal.status = newStatus;
        signal.closingPrice = currentPrice;
        signal.closingTime = block.timestamp;
        
        if (isSuccess) {
            successfulSignals[signal.analyst]++;
        }
        
        emit SignalClosed(signal.id, newStatus, currentPrice, "Verification completed");
        return newStatus;
    }
    
    function processManualClose(
        SharedTypes.TradingSignal storage signal,
        uint256 currentPrice,
        mapping(address => uint256) storage successfulSignals
    ) external {
        bool isProfit = (signal.targetPrice > signal.entryPrice) ? 
            currentPrice > signal.entryPrice : 
            currentPrice < signal.entryPrice;
        
        signal.closingPrice = currentPrice;
        signal.closingTime = block.timestamp;
        signal.status = 1; // CLOSED
        
        if (isProfit) {
            successfulSignals[signal.analyst]++;
        }
        
        emit SignalClosed(signal.id, signal.status, currentPrice, "Manual close");
    }
    
    function parseSignalData(string memory data) external pure returns (
        uint256 entryPrice,
        uint256 targetPrice,
        uint256 stopLoss,
        uint256 confidence,
        string memory assetName,
        string memory patternName,
        string memory assetType,
        string memory recommendation,
        string memory sentiment
    ) {
        bytes memory dataBytes = bytes(data);
        string[] memory parts = new string[](9);
        uint256 partIndex = 0;
        uint256 startIndex = 0;
        
        for (uint256 i = 0; i < dataBytes.length && partIndex < 9; i++) {
            if (dataBytes[i] == ',' || i == dataBytes.length - 1) {
                uint256 endIndex = (dataBytes[i] == ',') ? i : i + 1;
                parts[partIndex] = substring(data, startIndex, endIndex);
                partIndex++;
                startIndex = i + 1;
            }
        }
        
        entryPrice = stringToUint(parts[0]);
        targetPrice = stringToUint(parts[1]);
        stopLoss = stringToUint(parts[2]);
        confidence = stringToUint(parts[3]);
        assetName = bytes(parts[4]).length > 0 ? parts[4] : "BTC/USD";
        patternName = bytes(parts[5]).length > 0 ? parts[5] : "Technical Pattern";
        assetType = bytes(parts[6]).length > 0 ? parts[6] : "Unknown";
        recommendation = bytes(parts[7]).length > 0 ? parts[7] : "Hold";
        sentiment = bytes(parts[8]).length > 0 ? parts[8] : "Neutral";
    }
    
    function substring(string memory str, uint256 startIndex, uint256 endIndex) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        
        return string(result);
    }
    
    function stringToUint(string memory str) public pure returns (uint256) {
        bytes memory b = bytes(str);
        uint256 result = 0;
        
        for (uint256 i = 0; i < b.length; i++) {
            uint8 digit = uint8(b[i]);
            if (digit >= 48 && digit <= 57) {
                result = result * 10 + (digit - 48);
            }
        }
        
        return result;
    }
    
    function contains(string memory str, string memory substr) external pure returns (bool) {
        bytes memory strBytes = bytes(str);
        bytes memory substrBytes = bytes(substr);
        
        if (substrBytes.length > strBytes.length) return false;
        
        for (uint256 i = 0; i <= strBytes.length - substrBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < substrBytes.length; j++) {
                if (strBytes[i + j] != substrBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        return false;
    }
}