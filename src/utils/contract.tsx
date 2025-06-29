// Trading Signals Contract Address and ABI
// Network: Avalanche Fuji Testnet

export const TRADING_SIGNALS_ADDRESS = "0xBd7349B9F8A0793F45bd9c9928b13498b469B59F";

export const TRADING_SIGNALS_ABI = [
  // Constructor
  "constructor(address router, bytes32 _donId, uint64 _subscriptionId, address _linkToken, bytes memory _secretsUrl)",

  // Main Functions
  "function createSignalFromDatabase(string memory _databaseId, uint256 entryPrice, uint256 targetPrice, uint256 stopLoss, uint32 confidence, string memory assetName, string memory patternName, string memory assetType, string memory recommendation, string memory sentiment) returns (bytes32 requestId)",
  "function closeSignalManually(uint256 signalId)",
  "function getPriceFromPolygon(uint256 signalId, uint8 requestType) returns (bytes32 requestId)",
  "function processSignalWithPrice(uint256 signalId, uint256 currentPrice, uint8 processType) returns (bool processed)",

  // View Functions - Signal Data
  "function getSignal(uint256 signalId) view returns (tuple(uint256 id, address analyst, uint256 entryPrice, uint256 targetPrice, uint256 stopLoss, uint32 confidence, uint256 timestamp, uint256 expiryTime, uint8 status, uint256 closingPrice, uint256 closingTime, bool autoClose, uint32 tolerancePercent, bool isValid, bytes32 dataHash, string databaseId, bytes32 requestId) signal)",
  "function getSignalMetadata(bytes32 dataHash) view returns (tuple(string assetName, string assetType, string patternName, string recommendation, string sentiment, string userId, bytes32 dataHash, string reason, string polygonSymbol) metadata)",
  "function getFullSignalData(uint256 signalId) view returns (tuple(uint256 id, address analyst, uint256 entryPrice, uint256 targetPrice, uint256 stopLoss, uint32 confidence, uint256 timestamp, uint256 expiryTime, uint8 status, uint256 closingPrice, uint256 closingTime, bool autoClose, uint32 tolerancePercent, bool isValid, bytes32 dataHash, string databaseId, bytes32 requestId) signal, tuple(string assetName, string assetType, string patternName, string recommendation, string sentiment, string userId, bytes32 dataHash, string reason, string polygonSymbol) metadata)",

  // View Functions - Asset Management
  "function isAssetSupported(string memory assetName) view returns (bool)",
  "function getSupportedAssets() view returns (string[] memory assets, string[] memory polygonSymbols)",

  // View Functions - Contract State
  "function signalCounter() view returns (uint256)",
  "function paused() view returns (bool)",
  "function automationContract() view returns (address)",
  "function owner() view returns (address)",
  "function gasLimit() view returns (uint32)",
  "function linkToken() view returns (address)",
  "function createSource() view returns (string memory)",
  "function updateSource() view returns (string memory)",
  "function priceSource() view returns (string memory)",

  // View Functions - Reputation System
  "function reputationScore(address analyst) view returns (uint256)",
  "function successfulSignals(address analyst) view returns (uint256)",
  "function totalSignals(address analyst) view returns (uint256)",

  // Helper Functions
  "function decodePrice(bytes memory response) pure returns (uint256)",

  // Admin Functions - Contract Management
  "function pause()",
  "function unpause()",
  "function setPauseExemption(address account, bool exempt)",
  "function setAutomationContract(address _automationContract)",

  // Admin Functions - Asset Management
  "function addAssetMapping(string memory asset, string memory polygonSymbol)",

  // Admin Functions - Configuration
  "function updateGasLimit(uint32 newLimit)",
  "function updateDonId(bytes32 newDonId)",
  "function updateSubscriptionId(uint64 newSubscriptionId)",
  "function setPriceSource(string memory _priceSource)",
  "function setCreateSource(string memory _createSource)",
  "function setUpdateSource(string memory _updateSource)",

  // Admin Functions - Emergency
  "function emergencyCloseSignal(uint256 signalId, uint256 closingPrice, string memory reason)",

  // LINK Token Management
  "function withdrawLink(address to, uint256 amount)",

  // Events - Signal Lifecycle
  "event SignalCreationRequested(address indexed requester, string databaseId, bytes32 requestId)",
  "event SignalCreated(uint256 indexed signalId, address indexed analyst, string databaseId)",
  "event SignalCreatedPending(uint256 indexed signalId, address indexed analyst, string databaseId, bytes32 requestId)",
  "event SignalCreationFailed(string databaseId, string reason)",
  "event SignalVerified(uint256 indexed signalId, uint8 status, uint256 actualPrice)",

  // Events - Price Operations
  "event PriceRequested(uint256 indexed signalId, string symbol, bytes32 requestId)",
  "event PriceReceived(uint256 indexed signalId, uint256 price, uint256 timestamp)",
  "event PriceRequestFailed(uint256 indexed signalId, string reason)",

  // Events - System Operations
  "event ReputationUpdated(address indexed analyst, uint256 newScore)",
  "event Paused(address indexed account)",
  "event Unpaused(address indexed account)",
  "event AutomationContractUpdated(address indexed oldContract, address indexed newContract)",

  // Custom Errors
  "error InvalidInput()",
  "error NotFound()",
  "error Unauthorized()",
  "error ContractPaused()",
  "error InvalidStatus()",
  "error Unsupported()",
  "error InvalidAddress()",
  "error TransferFailed()"
] as const;

// Type definitions for better TypeScript support
export interface TradingSignal {
  id: bigint;
  analyst: string;
  entryPrice: bigint;
  targetPrice: bigint;
  stopLoss: bigint;
  confidence: number;
  timestamp: bigint;
  expiryTime: bigint;
  status: number; // 0=Open, 1=Closed, 2=Cancelled, 3=Expired
  closingPrice: bigint;
  closingTime: bigint;
  autoClose: boolean;
  tolerancePercent: number;
  isValid: boolean;
  dataHash: string;
  databaseId: string;
  requestId: string;
}

export interface SignalMetadata {
  assetName: string;
  assetType: string;
  patternName: string;
  recommendation: string;
  sentiment: string;
  userId: string;
  dataHash: string;
  reason: string;
  polygonSymbol: string;
}

export interface CreateSignalParams {
  databaseId: string;
  entryPrice: bigint;
  targetPrice: bigint;
  stopLoss: bigint;
  confidence: number;
  assetName: string;
  patternName: string;
  assetType: string;
  recommendation: string;
  sentiment: string;
}

export interface ReputationData {
  score: bigint;
  successful: bigint;
  total: bigint;
}


// Process type enum for automation
export enum ProcessType {
  AUTO_CLOSE = 0,
  VERIFICATION = 1,
  MANUAL_CLOSE = 2
}

// Request type enum for price requests
export enum RequestType {
  CLOSE_CHECK = 0,
  VERIFICATION = 1,
  MANUAL_CLOSE = 2
}
// Type definitions for better TypeScript support
export interface TradingSignal {
  id: bigint;
  analyst: string;
  entryPrice: bigint;
  targetPrice: bigint;
  stopLoss: bigint;
  confidence: number;
  timestamp: bigint;
  expiryTime: bigint;
  status: number; // 0=OPEN, 1=CLOSED, 2=CANCELLED, 3=EXPIRED
  closingPrice: bigint;
  closingTime: bigint;
  autoClose: boolean;
  tolerancePercent: number;
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