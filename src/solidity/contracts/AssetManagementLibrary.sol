// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SharedTypes.sol";

library AssetManagementLibrary {
    
    function initializeAssetMappings(
        mapping(string => string) storage assetToPolygonSymbol,
        string[] storage supportedAssetsList
    ) external {
        // Crypto mappings
        assetToPolygonSymbol["BTC/USD"] = "X:BTCUSD";
        supportedAssetsList.push("BTC/USD");
        
        assetToPolygonSymbol["ETH/USD"] = "X:ETHUSD";
        supportedAssetsList.push("ETH/USD");
        
        assetToPolygonSymbol["AVAX/USD"] = "X:AVAXUSD";
        supportedAssetsList.push("AVAX/USD");
        
        assetToPolygonSymbol["LINK/USD"] = "X:LINKUSD";
        supportedAssetsList.push("LINK/USD");
        
        assetToPolygonSymbol["ADA/USD"] = "X:ADAUSD";
        supportedAssetsList.push("ADA/USD");
        
        assetToPolygonSymbol["SOL/USD"] = "X:SOLUSD";
        supportedAssetsList.push("SOL/USD");
        
        // Forex mappings
        assetToPolygonSymbol["EUR/USD"] = "C:EURUSD";
        supportedAssetsList.push("EUR/USD");
        
        assetToPolygonSymbol["GBP/USD"] = "C:GBPUSD";
        supportedAssetsList.push("GBP/USD");
        
        assetToPolygonSymbol["USD/JPY"] = "C:USDJPY";
        supportedAssetsList.push("USD/JPY");
        
        // Stock mappings
        assetToPolygonSymbol["AAPL"] = "AAPL";
        supportedAssetsList.push("AAPL");
        
        assetToPolygonSymbol["TSLA"] = "TSLA";
        supportedAssetsList.push("TSLA");
        
        assetToPolygonSymbol["SPY"] = "SPY";
        supportedAssetsList.push("SPY");
    }
    
    function tryGetPolygonSymbol(
        string memory assetName,
        mapping(string => string) storage assetToPolygonSymbol
    ) external view returns (string memory polygonSymbol, bool supported) {
        polygonSymbol = assetToPolygonSymbol[assetName];
        if (bytes(polygonSymbol).length > 0) {
            return (polygonSymbol, true);
        }
        
        // Try common fallbacks for similar assets
        if (contains(assetName, "BTC")) {
            string memory btcSymbol = assetToPolygonSymbol["BTC/USD"];
            return (btcSymbol, bytes(btcSymbol).length > 0);
        }
        if (contains(assetName, "ETH")) {
            string memory ethSymbol = assetToPolygonSymbol["ETH/USD"];
            return (ethSymbol, bytes(ethSymbol).length > 0);
        }
        
        return ("", false);
    }
    
    function isAssetSupported(
        string memory assetName,
        mapping(string => string) storage assetToPolygonSymbol
    ) external view returns (bool) {
        return bytes(assetToPolygonSymbol[assetName]).length > 0;
    }
    
    function addAssetMapping(
        string memory asset,
        string memory polygonSymbol,
        mapping(string => string) storage assetToPolygonSymbol,
        string[] storage supportedAssetsList
    ) external {
        bool exists = bytes(assetToPolygonSymbol[asset]).length > 0;
        assetToPolygonSymbol[asset] = polygonSymbol;
        
        if (!exists) {
            supportedAssetsList.push(asset);
        }
    }
    
    function removeAssetMapping(
        string memory asset,
        mapping(string => string) storage assetToPolygonSymbol,
        string[] storage supportedAssetsList
    ) external {
        require(bytes(assetToPolygonSymbol[asset]).length > 0, "Asset not found");
        
        delete assetToPolygonSymbol[asset];
        
        for (uint256 i = 0; i < supportedAssetsList.length; i++) {
            if (keccak256(bytes(supportedAssetsList[i])) == keccak256(bytes(asset))) {
                supportedAssetsList[i] = supportedAssetsList[supportedAssetsList.length - 1];
                supportedAssetsList.pop();
                break;
            }
        }
    }
    
    function getSupportedAssets(
        string[] storage supportedAssetsList,
        mapping(string => string) storage assetToPolygonSymbol
    ) external view returns (string[] memory assets, string[] memory polygonSymbols) {
        uint256 count = supportedAssetsList.length;
        assets = new string[](count);
        polygonSymbols = new string[](count);
        
        for (uint256 i = 0; i < count; i++) {
            assets[i] = supportedAssetsList[i];
            polygonSymbols[i] = assetToPolygonSymbol[supportedAssetsList[i]];
        }
    }
    
    function contains(string memory str, string memory substr) internal pure returns (bool) {
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