// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../SharedTypes.sol";

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