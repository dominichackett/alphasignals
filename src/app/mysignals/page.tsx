'use client'
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header/Header';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Search, 
  Calendar,
  DollarSign,
  Zap,
  Bitcoin,
  Building2,
  Globe,
  ChevronRight,
  Eye
} from 'lucide-react';

const MySignals = () => {
  const [signals, setSignals] = useState([]);
  const [filteredSignals, setFilteredSignals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data for signals with entry/exit prices, status, and reasons
  useEffect(() => {
    const mockSignals = [
      {
        id: 'signal_1704567890123',
        assetName: 'NASDAQ:AAPL',
        assetType: 'Stock',
        recommendation: 'Buy',
        sentiment: 'Bullish',
        confidence: 85,
        entryPrice: 185.50,
        exitPrice: 185.50,
        takeProfit: 205.75,
        stopLoss: 175.20,
        actualClosedPrice: 203.15,
        status: 'Closed',
        reason: 'Strong bullish breakout above key resistance with high volume confirmation and positive earnings momentum',
        createdAt: '2024-01-06T14:30:00.000Z',
        patternName: 'EMA Crossover'
      },
      {
        id: 'signal_1704567890124',
        assetName: 'NASDAQ:TSLA',
        assetType: 'Stock',
        recommendation: 'Sell',
        sentiment: 'Bearish',
        confidence: 72,
        entryPrice: 245.80,
        exitPrice: 245.80,
        takeProfit: 215.30,
        stopLoss: 260.00,
        actualClosedPrice: null,
        status: 'Open',
        reason: 'Head and shoulders reversal pattern with declining volume on rallies and negative analyst downgrades',
        createdAt: '2024-01-05T10:15:00.000Z',
        patternName: 'Head and Shoulders'
      },
      {
        id: 'signal_1704567890125',
        assetName: 'BINANCE:BTCUSDT',
        assetType: 'Crypto',
        recommendation: 'Buy',
        sentiment: 'Bullish',
        confidence: 91,
        entryPrice: 42150.00,
        exitPrice: 42150.00,
        takeProfit: 48200.00,
        stopLoss: 39800.00,
        actualClosedPrice: 47850.00,
        status: 'Closed',
        reason: 'Ascending triangle breakout with massive volume spike, institutional buying, and positive regulatory news',
        createdAt: '2024-01-04T16:45:00.000Z',
        patternName: 'Triangle Pattern'
      },
      {
        id: 'signal_1704567890126',
        assetName: 'NASDAQ:GOOGL',
        assetType: 'Stock',
        recommendation: 'Buy',
        sentiment: 'Bullish',
        confidence: 78,
        entryPrice: 142.30,
        exitPrice: 142.30,
        takeProfit: 158.90,
        stopLoss: 135.75,
        actualClosedPrice: null,
        status: 'Open',
        reason: 'Bounce from major support level with bullish RSI divergence and AI technology catalyst potential',
        createdAt: '2024-01-03T11:20:00.000Z',
        patternName: 'Support/Resistance Bounce'
      },
      {
        id: 'signal_1704567890127',
        assetName: 'EURUSD',
        assetType: 'Forex',
        recommendation: 'Sell',
        sentiment: 'Bearish',
        confidence: 69,
        entryPrice: 1.0825,
        exitPrice: 1.0825,
        takeProfit: 1.0675,
        stopLoss: 1.0925,
        actualClosedPrice: 1.0920,
        status: 'Closed',
        reason: 'Double top formation at major resistance with ECB dovish sentiment and weak eurozone data',
        createdAt: '2024-01-02T09:10:00.000Z',
        patternName: 'Double Top'
      },
      {
        id: 'signal_1704567890128',
        assetName: 'BINANCE:ETHUSDT',
        assetType: 'Crypto',
        recommendation: 'Buy',
        sentiment: 'Bullish',
        confidence: 83,
        entryPrice: 2650.75,
        exitPrice: 2650.75,
        takeProfit: 2850.00,
        stopLoss: 2520.00,
        actualClosedPrice: null,
        status: 'Open',
        reason: 'Bullish pennant formation with ETF approval catalyst, strong on-chain metrics, and developer activity growth',
        createdAt: '2024-01-01T18:30:00.000Z',
        patternName: 'Ascending Triangle'
      }
    ];
    
    setSignals(mockSignals);
    setFilteredSignals(mockSignals);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = signals;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(signal => 
        signal.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        signal.patternName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      if (filterType === 'stocks') {
        filtered = filtered.filter(signal => signal.assetType === 'Stock');
      } else if (filterType === 'crypto') {
        filtered = filtered.filter(signal => signal.assetType === 'Crypto');
      } else if (filterType === 'forex') {
        filtered = filtered.filter(signal => signal.assetType === 'Forex');
      } else if (filterType === 'buy') {
        filtered = filtered.filter(signal => signal.recommendation === 'Buy');
      } else if (filterType === 'sell') {
        filtered = filtered.filter(signal => signal.recommendation === 'Sell');
      } else if (filterType === 'open') {
        filtered = filtered.filter(signal => signal.status === 'Open');
      } else if (filterType === 'closed') {
        filtered = filtered.filter(signal => signal.status === 'Closed');
      }
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'confidence':
          return b.confidence - a.confidence;
        case 'alphabetical':
          return a.assetName.localeCompare(b.assetName);
        default:
          return 0;
      }
    });

    setFilteredSignals(filtered);
  }, [signals, searchTerm, filterType, sortBy]);

  const getAssetTypeIcon = (type) => {
    switch (type) {
      case 'Stock':
        return <Building2 className="text-blue-400" size={16} />;
      case 'Crypto':
        return <Bitcoin className="text-orange-400" size={16} />;
      case 'Forex':
        return <Globe className="text-green-400" size={16} />;
      default:
        return <BarChart3 className="text-gray-400" size={16} />;
    }
  };

  const formatPrice = (price, assetType) => {
    if (assetType === 'Forex') {
      return price.toFixed(4);
    } else if (assetType === 'Crypto' && price > 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } else if (assetType === 'Crypto') {
      return price.toFixed(2);
    } else {
      return price.toFixed(2);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateActualReturn = (signal) => {
    if (signal.status === 'Open' || !signal.actualClosedPrice) {
      return null;
    }
    
    const entry = signal.entryPrice;
    const actualClosed = signal.actualClosedPrice;
    
    if (signal.recommendation === 'Buy') {
      return ((actualClosed - entry) / entry * 100).toFixed(1);
    } else {
      return ((entry - actualClosed) / entry * 100).toFixed(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <Header />
      
      <div className="p-6 pt-24 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="text-blue-400" size={32} />
            My Signals
          </h1>
          <p className="text-gray-400">
            All your trading signals with entry/exit prices, status, and detailed reasons
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search signals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="stocks">Stocks Only</option>
              <option value="crypto">Crypto Only</option>
              <option value="forex">Forex Only</option>
              <option value="buy">Buy Signals</option>
              <option value="sell">Sell Signals</option>
              <option value="open">Open Positions</option>
              <option value="closed">Closed Positions</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="confidence">Highest Confidence</option>
              <option value="alphabetical">Alphabetical</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-700/30 rounded-lg px-4 py-3">
              <span className="text-gray-300">
                {filteredSignals.length} signal{filteredSignals.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Signals List */}
        <div className="space-y-4">
          {filteredSignals.map((signal) => (
            <div
              key={signal.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] shadow-xl hover:shadow-2xl group"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-9 gap-4 items-center">
                  {/* Asset Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      {getAssetTypeIcon(signal.assetType)}
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {signal.assetName}
                        </h3>
                        <p className="text-sm text-gray-400">{signal.assetType} • {signal.patternName}</p>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      signal.status === 'Open' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        signal.status === 'Open' ? 'bg-blue-400' : 'bg-gray-400'
                      }`}></div>
                      {signal.status}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm border ${
                      signal.recommendation === 'Buy' 
                        ? 'bg-green-500/20 text-green-400 border-green-500'
                        : 'bg-red-500/20 text-red-400 border-red-500'
                    }`}>
                      {signal.recommendation === 'Buy' ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      {signal.recommendation}
                    </div>
                  </div>

                  {/* Entry & Exit Prices */}
                  <div className="text-center">
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-400">Entry Price</div>
                        <div className="text-sm font-mono text-white">
                          {signal.assetType === 'Forex' ? '' : '$'}{formatPrice(signal.entryPrice, signal.assetType)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Exit Price</div>
                        <div className="text-sm font-mono text-white">
                          {signal.assetType === 'Forex' ? '' : '$'}{formatPrice(signal.exitPrice, signal.assetType)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TP & Stop Loss */}
                  <div className="text-center">
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-400">TP (Target)</div>
                        <div className="text-sm font-mono text-green-400">
                          {signal.assetType === 'Forex' ? '' : '$'}{formatPrice(signal.takeProfit, signal.assetType)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Stop Loss</div>
                        <div className="text-sm font-mono text-red-400">
                          {signal.assetType === 'Forex' ? '' : '$'}{formatPrice(signal.stopLoss, signal.assetType)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actual Closed Price */}
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Actual Closed</div>
                    <div className="text-lg font-mono text-white">
                      {signal.actualClosedPrice 
                        ? `${signal.assetType === 'Forex' ? '' : '$'}${formatPrice(signal.actualClosedPrice, signal.assetType)}`
                        : '—'
                      }
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {signal.status === 'Open' ? 'Position Open' : 'Final Price'}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="text-center">
                    <div className="text-xl font-bold text-white mb-1">
                      {signal.confidence}%
                    </div>
                    <div className="text-xs text-gray-400 mb-2">Confidence</div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          signal.confidence >= 80 ? 'bg-green-500' :
                          signal.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${signal.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Return */}
                  <div className="text-center">
                    {signal.status === 'Closed' ? (
                      <>
                        <div className={`text-lg font-bold mb-1 ${
                          parseFloat(calculateActualReturn(signal)) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {parseFloat(calculateActualReturn(signal)) >= 0 ? '+' : ''}{calculateActualReturn(signal)}%
                        </div>
                        <div className="text-xs text-gray-400">Actual Return</div>
                      </>
                    ) : (
                      <>
                        <div className="text-lg font-bold text-gray-400 mb-1">
                          —
                        </div>
                        <div className="text-xs text-gray-400">Pending</div>
                      </>
                    )}
                  </div>

                  {/* Date & Action */}
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">
                      {formatDate(signal.createdAt)}
                    </div>
                    <div className="flex items-center justify-center text-blue-400 text-sm group-hover:text-blue-300">
                      <Eye size={14} className="mr-1" />
                      View
                      <ChevronRight size={14} className="ml-1" />
                    </div>
                  </div>
                </div>

                {/* Reason - Full Width Below */}
                <div className="mt-4 pt-4 border-t border-gray-600">
                  <div className="text-sm text-gray-400 mb-1">Reason:</div>
                  <p className="text-sm text-gray-300 leading-relaxed">{signal.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSignals.length === 0 && (
          <div className="text-center py-16">
            <Zap size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No signals found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start by generating some trading signals'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySignals;