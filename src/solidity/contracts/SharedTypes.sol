// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library SharedTypes {
    
   struct TradingSignal {
    uint256 id;                    // Slot 1
    uint256 entryPrice;            // Slot 2
    uint256 targetPrice;           // Slot 3
    uint256 stopLoss;              // Slot 4
    uint256 closingPrice;          // Slot 5
    uint256 timestamp;             // Slot 6
    uint256 expiryTime;            // Slot 7
    uint256 closingTime;           // Slot 8
    
    // Pack these into Slot 9:
    address analyst;               // 160 bits
    uint32 confidence;             // 32 bits
    uint32 tolerancePercent;       // 32 bits
    uint8 status;                  // 8 bits
    bool autoClose;                // 1 bit
    bool isValid;                  // 1 bit ← NEW FIELD
    // 22 bits remaining
    
    bytes32 dataHash;              // Slot 10
    string databaseId;             // Slot 11+
    bytes32 requestId;             // Slot 12 ← NEW: Track Chainlink request
}
    
    struct SignalMetadata {
        string assetName;
        string assetType;
        string patternName;
        string recommendation;
        string sentiment;
        string userId;
        string reason;
        string polygonSymbol; // Polygon.io symbol format
        bytes32 dataHash;
    }
    
    struct PendingSignal {
        string databaseId;
        address requester;
        uint256 timestamp;
        uint256 entryPrice;
        uint256 targetPrice;
        uint256 stopLoss;
        uint32 confidence;
        string  assetName;
        string  patternName;
        string  assetType;
        string  recommendation;
        string  sentiment;
        bytes32 dataHash;
        bool supported;
    }

    struct PendingPriceRequest {
        uint256 signalId;
        uint8 requestType; // 0=close_check, 1=verification, 2=manual_close
        address requester;
        uint256 timestamp;
    }
}