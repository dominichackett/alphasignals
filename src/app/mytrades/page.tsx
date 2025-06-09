'use client'
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Search, 
  Calendar,
  DollarSign,
  Activity,
  Bitcoin,
  Building2,
  Globe,
  ChevronRight,
  Eye,
  Star,
  Users,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Shield,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Header from '@/components/Header/Header';

const MyTrades = () => {
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [stats, setStats] = useState({});

  // Mock data for trades
  useEffect(() => {
    const mockTrades = [
      {
        id: 'trade_1704567890123',
        signalId: 'signal_1704567890123',
        assetName: 'NASDAQ:AAPL',
        assetType: 'Stock',
        tradeType: 'Buy',
        entryPrice: 185.50,
        currentPrice: 198.25,
        exitPrice: 203.15,
        quantity: 50,
        takeProfit: 205.75,
        stopLoss: 175.20,
        status: 'Closed',
        openedAt: '2024-01-06T14:35:00.000Z',
        closedAt: '2024-01-15T10:20:00.000Z',
        duration: '9 days',
        pnl: 882.50,
        pnlPercentage: 9.52,
        fees: 15.50,
        creator: {
          name: 'Sarah Chen',
          image: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=150&h=150&fit=crop&crop=face'
        },
        exitReason: 'Take Profit Hit'
      },
      {
        id: 'trade_1704567890124',
        signalId: 'signal_1704567890124',
        assetName: 'NASDAQ:TSLA',
        assetType: 'Stock',
        tradeType: 'Sell',
        entryPrice: 245.80,
        currentPrice: 238.45,
        exitPrice: null,
        quantity: 25,
        takeProfit: 215.30,
        stopLoss: 260.00,
        status: 'Open',
        openedAt: '2024-01-05T10:20:00.000Z',
        closedAt: null,
        duration: null,
        pnl: 183.75,
        pnlPercentage: 2.99,
        fees: 8.25,
        creator: {
          name: 'Mike Rodriguez',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        exitReason: null
      },
      {
        id: 'trade_1704567890125',
        signalId: 'signal_1704567890125',
        assetName: 'BINANCE:BTCUSDT',
        assetType: 'Crypto',
        tradeType: 'Buy',
        entryPrice: 42150.00,
        currentPrice: 47850.00,
        exitPrice: 47850.00,
        quantity: 0.5,
        takeProfit: 48200.00,
        stopLoss: 39800.00,
        status: 'Closed',
        openedAt: '2024-01-04T16:50:00.000Z',
        closedAt: '2024-01-18T14:15:00.000Z',
        duration: '14 days',
        pnl: 2850.00,
        pnlPercentage: 13.51,
        fees: 42.30,
        creator: {
          name: 'Alex Thompson',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        exitReason: 'Manual Close'
      },
      {
        id: 'trade_1704567890126',
        signalId: 'signal_1704567890126',
        assetName: 'NASDAQ:GOOGL',
        assetType: 'Stock',
        tradeType: 'Buy',
        entryPrice: 142.30,
        currentPrice: 151.75,
        exitPrice: null,
        quantity: 75,
        takeProfit: 158.90,
        stopLoss: 135.75,
        status: 'Open',
        openedAt: '2024-01-03T11:25:00.000Z',
        closedAt: null,
        duration: null,
        pnl: 708.75,
        pnlPercentage: 6.64,
        fees: 12.75,
        creator: {
          name: 'Emma Wilson',
          image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        exitReason: null
      },
      {
        id: 'trade_1704567890127',
        signalId: 'signal_1704567890127',
        assetName: 'EURUSD',
        assetType: 'Forex',
        tradeType: 'Sell',
        entryPrice: 1.0825,
        currentPrice: 1.0920,
        exitPrice: 1.0920,
        quantity: 100000,
        takeProfit: 1.0675,
        stopLoss: 1.0925,
        status: 'Closed',
        openedAt: '2024-01-02T09:15:00.000Z',
        closedAt: '2024-01-02T15:45:00.000Z',
        duration: '6 hours',
        pnl: -950.00,
        pnlPercentage: -8.78,
        fees: 25.00,
        creator: {
          name: 'David Kim',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
        },
        exitReason: 'Stop Loss Hit'
      },
      {
        id: 'trade_1704567890128',
        signalId: 'signal_1704567890128',
        assetName: 'BINANCE:ETHUSDT',
        assetType: 'Crypto',
        tradeType: 'Buy',
        entryPrice: 2650.75,
        currentPrice: 2745.20,
        exitPrice: null,
        quantity: 2,
        takeProfit: 2850.00,
        stopLoss: 2520.00,
        status: 'Open',
        openedAt: '2024-01-01T18:35:00.000Z',
        closedAt: null,
        duration: null,
        pnl: 188.90,
        pnlPercentage: 3.56,
        fees: 18.50,
        creator: {
          name: 'Lisa Garcia',
          image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
        },
        exitReason: null
      }
    ];
    
    setTrades(mockTrades);
    setFilteredTrades(mockTrades);
    
    // Calculate stats
    const totalTrades = mockTrades.length;
    const openTrades = mockTrades.filter(t => t.status === 'Open').length;
    const closedTrades = mockTrades.filter(t => t.status === 'Closed').length;
    const winningTrades = mockTrades.filter(t => t.status === 'Closed' && t.pnl > 0).length;
    const losingTrades = mockTrades.filter(t => t.status === 'Closed' && t.pnl < 0).length;
    const totalPnL = mockTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalFees = mockTrades.reduce((sum, trade) => sum + trade.fees, 0);
    const winRate = closedTrades > 0 ? ((winningTrades / closedTrades) * 100).toFixed(1) : 0;
    
    setStats({
      totalTrades,
      openTrades,
      closedTrades,
      winningTrades,
      losingTrades,
      totalPnL,
      totalFees,
      winRate
    });
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = trades;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(trade => 
        trade.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.creator.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      if (filterType === 'stocks') {
        filtered = filtered.filter(trade => trade.assetType === 'Stock');
      } else if (filterType === 'crypto') {
        filtered = filtered.filter(trade => trade.assetType === 'Crypto');
      } else if (filterType === 'forex') {
        filtered = filtered.filter(trade => trade.assetType === 'Forex');
      } else if (filterType === 'buy') {
        filtered = filtered.filter(trade => trade.tradeType === 'Buy');
      } else if (filterType === 'sell') {
        filtered = filtered.filter(trade => trade.tradeType === 'Sell');
      } else if (filterType === 'open') {
        filtered = filtered.filter(trade => trade.status === 'Open');
      } else if (filterType === 'closed') {
        filtered = filtered.filter(trade => trade.status === 'Closed');
      } else if (filterType === 'winning') {
        filtered = filtered.filter(trade => trade.pnl > 0);
      } else if (filterType === 'losing') {
        filtered = filtered.filter(trade => trade.pnl < 0);
      }
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.openedAt) - new Date(a.openedAt);
        case 'oldest':
          return new Date(a.openedAt) - new Date(b.openedAt);
        case 'pnl':
          return b.pnl - a.pnl;
        case 'percentage':
          return b.pnlPercentage - a.pnlPercentage;
        case 'alphabetical':
          return a.assetName.localeCompare(b.assetName);
        default:
          return 0;
      }
    });

    setFilteredTrades(filtered);
  }, [trades, searchTerm, filterType, sortBy]);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <Header />
      <div className="p-6 pt-24 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="text-blue-400" size={32} />
            My Trades
          </h1>
          <p className="text-gray-400">
            Track all your trading positions and performance
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
            <div className="text-sm text-gray-400">Total Trades</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-blue-400">{stats.openTrades}</div>
            <div className="text-sm text-gray-400">Open</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-gray-400">{stats.closedTrades}</div>
            <div className="text-sm text-gray-400">Closed</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.winningTrades}</div>
            <div className="text-sm text-gray-400">Winning</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-red-400">{stats.losingTrades}</div>
            <div className="text-sm text-gray-400">Losing</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(stats.totalPnL)}
            </div>
            <div className="text-sm text-gray-400">Total P&L</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">{stats.winRate}%</div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search trades..."
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
              <option value="buy">Buy Trades</option>
              <option value="sell">Sell Trades</option>
              <option value="open">Open Trades</option>
              <option value="closed">Closed Trades</option>
              <option value="winning">Winning Trades</option>
              <option value="losing">Losing Trades</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="pnl">Highest P&L</option>
              <option value="percentage">Best Performance</option>
              <option value="alphabetical">Alphabetical</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-700/30 rounded-lg px-4 py-3">
              <span className="text-gray-300">
                {filteredTrades.length} trade{filteredTrades.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Trades List */}
        <div className="space-y-4">
          {filteredTrades.map((trade) => (
            <div
              key={trade.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              <div className="p-6">
                {/* Trade Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-600">
                  <div className="flex items-center gap-4">
                    <img
                      src={trade.creator.image}
                      alt={trade.creator.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-600"
                    />
                    <div>
                      <div className="flex items-center gap-3">
                        {getAssetTypeIcon(trade.assetType)}
                        <h3 className="text-lg font-semibold text-white">{trade.assetName}</h3>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm border ${
                          trade.tradeType === 'Buy' 
                            ? 'bg-green-500/20 text-green-400 border-green-500'
                            : 'bg-red-500/20 text-red-400 border-red-500'
                        }`}>
                          {trade.tradeType === 'Buy' ? (
                            <TrendingUp size={14} />
                          ) : (
                            <TrendingDown size={14} />
                          )}
                          {trade.tradeType}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        Signal by {trade.creator.name} • Opened {formatDate(trade.openedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      trade.status === 'Open' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500'
                    }`}>
                      {trade.status === 'Open' ? (
                        <Clock size={14} />
                      ) : (
                        <CheckCircle size={14} />
                      )}
                      {trade.status}
                    </div>
                    
                    {/* P&L */}
                    <div className="text-right">
                      <div className={`text-lg font-bold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                      </div>
                      <div className={`text-sm ${trade.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.pnlPercentage >= 0 ? '+' : ''}{trade.pnlPercentage.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trade Details */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {/* Entry Price */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Entry Price</div>
                    <div className="text-lg font-mono text-white">
                      {trade.assetType === 'Forex' ? '' : '$'}{formatPrice(trade.entryPrice, trade.assetType)}
                    </div>
                    <div className="text-xs text-gray-500">Qty: {trade.quantity}</div>
                  </div>

                  {/* Current/Exit Price */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">
                      {trade.status === 'Open' ? 'Current Price' : 'Exit Price'}
                    </div>
                    <div className="text-lg font-mono text-white">
                      {trade.assetType === 'Forex' ? '' : '$'}{formatPrice(trade.status === 'Open' ? trade.currentPrice : trade.exitPrice, trade.assetType)}
                    </div>
                    {trade.status === 'Closed' && trade.exitReason && (
                      <div className="text-xs text-gray-500">{trade.exitReason}</div>
                    )}
                  </div>

                  {/* TP & SL */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Take Profit</div>
                    <div className="text-sm font-mono text-green-400">
                      {trade.assetType === 'Forex' ? '' : '$'}{formatPrice(trade.takeProfit, trade.assetType)}
                    </div>
                    <div className="text-sm text-gray-400 mt-2 mb-1">Stop Loss</div>
                    <div className="text-sm font-mono text-red-400">
                      {trade.assetType === 'Forex' ? '' : '$'}{formatPrice(trade.stopLoss, trade.assetType)}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Duration</div>
                    <div className="text-lg text-white">
                      {trade.duration || 'Ongoing'}
                    </div>
                    {trade.closedAt && (
                      <div className="text-xs text-gray-500">
                        Closed: {formatDate(trade.closedAt)}
                      </div>
                    )}
                  </div>

                  {/* Fees & Net */}
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Fees</div>
                    <div className="text-sm text-red-300">
                      -{formatCurrency(trade.fees)}
                    </div>
                    <div className="text-sm text-gray-400 mt-2 mb-1">Net P&L</div>
                    <div className={`text-sm font-semibold ${(trade.pnl - trade.fees) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(trade.pnl - trade.fees)}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {trade.status === 'Open' && (
                  <div className="mt-6 pt-4 border-t border-gray-600 flex gap-3">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 flex items-center gap-2">
                      <XCircle size={14} />
                      Close Position
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 flex items-center gap-2">
                      <Target size={14} />
                      Modify TP/SL
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 flex items-center gap-2">
                      <Eye size={14} />
                      View Chart
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTrades.length === 0 && (
          <div className="text-center py-16">
            <Activity size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No trades found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start trading to see your positions here'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrades;