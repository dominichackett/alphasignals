// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

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