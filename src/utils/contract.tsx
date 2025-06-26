// Trading Signals Contract Address and ABI
// Network: Avalanche Fuji Testnet

export const TRADING_SIGNALS_ADDRESS = "0xd719b2Fee8A6bb8b7417DEc352793cabbf503B74";

export const TRADING_SIGNALS_ABI = [
  // Constructor
  "constructor(address router, bytes32 _donId, uint64 _subscriptionId, address _linkToken)",

  // Main Functions
  "function createSignalFromDatabase(string _databaseId) returns (bytes32 requestId)",
  "function closeSignalManually(uint256 signalId)",
  "function getPriceFromPolygon(uint256 signalId, uint8 requestType) returns (bytes32 requestId)",
  
  // View Functions - Signal Data
  "function getSignal(uint256 signalId) view returns (tuple(uint256 id, address analyst, uint256 entryPrice, uint256 targetPrice, uint256 stopLoss, uint256 confidence, uint256 timestamp, uint256 expiryTime, uint8 status, uint256 closingPrice, uint256 closingTime, bool autoClose, uint256 tolerancePercent, bytes32 dataHash, string databaseId))",
  "function getSignalMetadata(bytes32 dataHash) view returns (tuple(string assetName, string assetType, string patternName, string recommendation, string sentiment, string userId, string reason, string polygonSymbol))",
  "function getFullSignalData(uint256 signalId) view returns (tuple(uint256 id, address analyst, uint256 entryPrice, uint256 targetPrice, uint256 stopLoss, uint256 confidence, uint256 timestamp, uint256 expiryTime, uint8 status, uint256 closingPrice, uint256 closingTime, bool autoClose, uint256 tolerancePercent, bytes32 dataHash, string databaseId) signal, tuple(string assetName, string assetType, string patternName, string recommendation, string sentiment, string userId, string reason, string polygonSymbol) metadata)",
  
  // View Functions - Asset Management
  "function isAssetSupported(string assetName) view returns (bool)",
  "function getSupportedAssets() view returns (string[] assets, string[] polygonSymbols)",
  "function assetToPolygonSymbol(string) view returns (string)",
  
  // View Functions - Contract State
  "function signalCounter() view returns (uint256)",
  "function paused() view returns (bool)",
  "function pauseExempt(address) view returns (bool)",
  "function owner() view returns (address)",
  "function donId() view returns (bytes32)",
  "function subscriptionId() view returns (uint64)",
  "function gasLimit() view returns (uint32)",
  "function linkToken() view returns (address)",
  
  // View Functions - Reputation
  "function reputationScore(address) view returns (uint256)",
  "function successfulSignals(address) view returns (uint256)",
  "function totalSignals(address) view returns (uint256)",
  
  // View Functions - Pending Requests
  "function pendingSignals(bytes32) view returns (string databaseId, address requester, uint256 timestamp)",
  "function pendingPriceRequests(bytes32) view returns (uint256 signalId, uint8 requestType, address requester, uint256 timestamp)",
  
  // Mappings
  "function signals(uint256) view returns (uint256 id, address analyst, uint256 entryPrice, uint256 targetPrice, uint256 stopLoss, uint256 confidence, uint256 timestamp, uint256 expiryTime, uint8 status, uint256 closingPrice, uint256 closingTime, bool autoClose, uint256 tolerancePercent, bytes32 dataHash, string databaseId)",
  "function signalMetadata(bytes32) view returns (string assetName, string assetType, string patternName, string recommendation, string sentiment, string userId, string reason, string polygonSymbol)",
  
  // Admin Functions (only for contract owner)
  "function pause()",
  "function unpause()",
  "function setPauseExemption(address account, bool exempt)",
  "function addAssetMapping(string asset, string polygonSymbol)",
  "function updateGasLimit(uint32 newLimit)",
  "function updateDonId(bytes32 newDonId)",
  "function updateSubscriptionId(uint64 newSubscriptionId)",
  
  // Emergency Functions (only for contract owner)
  "function emergencyCloseSignal(uint256 signalId, uint256 closingPrice, string reason)",
  "function emergencyWithdraw(address token, address to, uint256 amount)",
  
  // LINK Token Management (only for contract owner)
  "function withdrawLink(address to, uint256 amount)",
  "function getLinkBalance() view returns (uint256)",
  
  // Chainlink Automation
  "function checkUpkeep(bytes) view returns (bool upkeepNeeded, bytes performData)",
  "function performUpkeep(bytes performData)",
  
  // Events
  "event SignalCreationRequested(address indexed requester, string databaseId, bytes32 requestId)",
  "event SignalCreated(uint256 indexed signalId, address indexed analyst, string databaseId)",
  "event SignalCreationFailed(string databaseId, string reason)",
  "event SignalVerified(uint256 indexed signalId, uint8 status, uint256 actualPrice)",
  "event ReputationUpdated(address indexed analyst, uint256 newScore)",
  "event PriceRequested(uint256 indexed signalId, string symbol, bytes32 requestId)",
  "event PriceReceived(uint256 indexed signalId, uint256 price, uint256 timestamp)",
  "event Paused(address indexed account)",
  "event Unpaused(address indexed account)"
] as const;

// Type definitions for better TypeScript support
export interface TradingSignal {
  id: bigint;
  analyst: string;
  entryPrice: bigint;
  targetPrice: bigint;
  stopLoss: bigint;
  confidence: bigint;
  timestamp: bigint;
  expiryTime: bigint;
  status: number; // 0=OPEN, 1=CLOSED, 2=CANCELLED, 3=EXPIRED
  closingPrice: bigint;
  closingTime: bigint;
  autoClose: boolean;
  tolerancePercent: bigint;
  dataHash: string;
  databaseId: string;
}

export interface SignalMetadata {
  assetName: string;
  assetType: string;
  patternName: string;
  recommendation: string;
  sentiment: string;
  userId: string;
  reason: string;
  polygonSymbol: string;
}

export interface FullSignalData {
  signal: TradingSignal;
  metadata: SignalMetadata;
}

export interface ReputationData {
  score: bigint;
  totalSignals: bigint;
  successfulSignals: bigint;
}

// Signal status enum
export enum SignalStatus {
  OPEN = 0,
  CLOSED = 1,
  CANCELLED = 2,
  EXPIRED = 3
}

// Request types for getPriceFromPolygon
export enum PriceRequestType {
  CLOSE_CHECK = 0,
  VERIFICATION = 1,
  MANUAL_CLOSE = 2
}

// Network information
export const NETWORK_INFO = {
  name: "Avalanche Fuji Testnet",
  chainId: 43113,
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  blockExplorer: "https://testnet.snowtrace.io",
  currency: {
    name: "AVAX",
    symbol: "AVAX",
    decimals: 18
  }
} as const;