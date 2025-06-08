'use client'
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header/Header';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Trash2, 
  Search, 
  Filter,
  ChevronRight,
  Clock,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Link as LinkIcon
} from 'lucide-react';

const SavedCharts = () => {
  const [savedCharts, setSavedCharts] = useState([]);
  const [filteredCharts, setFilteredCharts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedChart, setSelectedChart] = useState(null);

  // Mock data for saved charts
  useEffect(() => {
    const mockCharts = [
      {
        id: 'analysis_1704567890123',
        assetName: 'NASDAQ:AAPL',
        assetType: 'Stock',
        patternName: 'EMA Crossover',
        sentiment: 'Bullish',
        confidence: 85,
        recommendation: 'Buy',
        savedAt: '2024-01-06T14:30:00.000Z',
        chartImage: '/chart.jpg',
        priceTargets: {
          entry: 185.50,
          target: 205.75,
          stopLoss: 175.20,
          support: 180.00,
          resistance: 195.00
        },
        riskReward: 2.1,
        status: 'saved',
        isPosted: false,
        isTraded: false
      },
      {
        id: 'analysis_1704567890124',
        assetName: 'NASDAQ:TSLA',
        assetType: 'Stock',
        patternName: 'Head and Shoulders',
        sentiment: 'Bearish',
        confidence: 72,
        recommendation: 'Sell',
        savedAt: '2024-01-05T10:15:00.000Z',
        chartImage: '/chart.jpg',
        priceTargets: {
          entry: 245.80,
          target: 215.30,
          stopLoss: 260.00,
          support: 230.00,
          resistance: 255.00
        },
        riskReward: 1.8,
        status: 'posted',
        isPosted: true,
        isTraded: false
      },
      {
        id: 'analysis_1704567890125',
        assetName: 'BINANCE:BTCUSDT',
        assetType: 'Crypto',
        patternName: 'Triangle Pattern',
        sentiment: 'Bullish',
        confidence: 91,
        recommendation: 'Buy',
        savedAt: '2024-01-04T16:45:00.000Z',
        chartImage: '/chart.jpg',
        priceTargets: {
          entry: 42150.00,
          target: 48200.00,
          stopLoss: 39800.00,
          support: 41000.00,
          resistance: 44500.00
        },
        riskReward: 2.6,
        status: 'traded',
        isPosted: true,
        isTraded: true
      },
      {
        id: 'analysis_1704567890126',
        assetName: 'NASDAQ:GOOGL',
        assetType: 'Stock',
        patternName: 'Support/Resistance Bounce',
        sentiment: 'Bullish',
        confidence: 78,
        recommendation: 'Buy',
        savedAt: '2024-01-03T11:20:00.000Z',
        chartImage: '/chart.jpg',
        priceTargets: {
          entry: 142.30,
          target: 158.90,
          stopLoss: 135.75,
          support: 140.00,
          resistance: 150.00
        },
        riskReward: 2.5,
        status: 'saved',
        isPosted: false,
        isTraded: false
      },
      {
        id: 'analysis_1704567890127',
        assetName: 'NASDAQ:MSFT',
        assetType: 'Stock',
        patternName: 'Bollinger Band Squeeze',
        sentiment: 'Bearish',
        confidence: 69,
        recommendation: 'Sell',
        savedAt: '2024-01-02T09:10:00.000Z',
        chartImage: '/chart.jpg',
        priceTargets: {
          entry: 378.50,
          target: 352.25,
          stopLoss: 390.00,
          support: 360.00,
          resistance: 385.00
        },
        riskReward: 2.3,
        status: 'posted',
        isPosted: true,
        isTraded: false
      }
    ];
    
    setSavedCharts(mockCharts);
    setFilteredCharts(mockCharts);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = savedCharts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(chart => 
        chart.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chart.patternName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      if (filterType === 'stocks') {
        filtered = filtered.filter(chart => chart.assetType === 'Stock');
      } else if (filterType === 'crypto') {
        filtered = filtered.filter(chart => chart.assetType === 'Crypto');
      } else if (filterType === 'bullish') {
        filtered = filtered.filter(chart => chart.sentiment === 'Bullish');
      } else if (filterType === 'bearish') {
        filtered = filtered.filter(chart => chart.sentiment === 'Bearish');
      }
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.savedAt) - new Date(a.savedAt);
        case 'oldest':
          return new Date(a.savedAt) - new Date(b.savedAt);
        case 'confidence':
          return b.confidence - a.confidence;
        case 'riskReward':
          return b.riskReward - a.riskReward;
        default:
          return 0;
      }
    });

    setFilteredCharts(filtered);
  }, [savedCharts, searchTerm, filterType, sortBy]);

  const handleChartSelect = (chart) => {
    setSelectedChart(chart);
    // In a real app, you might navigate to a detailed view or trading interface
    console.log('Selected chart:', chart);
  };

  const handleDeleteChart = (chartId, e) => {
    e.stopPropagation();
    setSavedCharts(charts => charts.filter(chart => chart.id !== chartId));
  };

  const getStatusIcon = (chart) => {
    if (chart.isTraded) {
      return <CheckCircle className="text-green-400" size={16} />;
    } else if (chart.isPosted) {
      return <LinkIcon className="text-orange-400" size={16} />;
    } else {
      return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getStatusText = (chart) => {
    if (chart.isTraded) return 'Traded';
    if (chart.isPosted) return 'Posted';
    return 'Saved';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <Header />
      
      <div className="p-6 pt-24 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="text-blue-400" size={32} />
            Saved Charts
          </h1>
          <p className="text-gray-400">
            View and manage your saved trading analysis charts
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
                placeholder="Search charts..."
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
              <option value="bullish">Bullish Signals</option>
              <option value="bearish">Bearish Signals</option>
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
              <option value="riskReward">Best Risk/Reward</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-700/30 rounded-lg px-4 py-3">
              <span className="text-gray-300">
                {filteredCharts.length} chart{filteredCharts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCharts.map((chart) => (
            <div
              key={chart.id}
              onClick={() => handleChartSelect(chart)}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-200 cursor-pointer transform hover:scale-105 shadow-xl hover:shadow-2xl group"
            >
              {/* Chart Image */}
              <div className="relative">
                <img
                  src={chart.chartImage}
                  alt={`${chart.assetName} Chart`}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    chart.isTraded 
                      ? 'bg-green-500/20 text-green-400 border border-green-500'
                      : chart.isPosted
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500'
                  }`}>
                    {getStatusIcon(chart)}
                    {getStatusText(chart)}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteChart(chart.id, e)}
                  className="absolute top-3 left-3 p-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>

              {/* Chart Info */}
              <div className="p-4">
                {/* Asset and Pattern */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {chart.assetName}
                  </h3>
                  <p className="text-blue-300 text-sm">{chart.patternName}</p>
                </div>

                {/* Key Metrics Row */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${
                      chart.sentiment === 'Bullish' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {chart.sentiment === 'Bullish' ? (
                        <TrendingUp className="inline mr-1" size={16} />
                      ) : (
                        <TrendingDown className="inline mr-1" size={16} />
                      )}
                      {chart.sentiment}
                    </div>
                    <div className="text-xs text-gray-400">Sentiment</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {chart.confidence}%
                    </div>
                    <div className="text-xs text-gray-400">Confidence</div>
                  </div>
                </div>

                {/* Price Targets */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div className="bg-gray-700/50 rounded p-2">
                    <div className="text-gray-400">Entry</div>
                    <div className="text-white font-mono">${chart.priceTargets.entry}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded p-2">
                    <div className="text-gray-400">Target</div>
                    <div className="text-green-400 font-mono">${chart.priceTargets.target}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded p-2">
                    <div className="text-gray-400">R/R</div>
                    <div className="text-blue-400 font-semibold">{chart.riskReward}:1</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                  <div className="flex items-center text-xs text-gray-400">
                    <Calendar size={12} className="mr-1" />
                    {formatDate(chart.savedAt)}
                  </div>
                  
                  <div className="flex items-center text-blue-400 text-sm group-hover:text-blue-300">
                    <Eye size={14} className="mr-1" />
                    View
                    <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCharts.length === 0 && (
          <div className="text-center py-16">
            <BarChart3 size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No charts found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start by generating and saving some trading signals'
              }
            </p>
          </div>
        )}

        {/* Selected Chart Modal/Preview (Optional) */}
        {selectedChart && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {selectedChart.assetName} - {selectedChart.patternName}
                  </h2>
                  <button
                    onClick={() => setSelectedChart(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
                
                <img
                  src={selectedChart.chartImage}
                  alt={`${selectedChart.assetName} Chart`}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-300">Recommendation:</strong>
                    <div className={`font-semibold ${
                      selectedChart.recommendation === 'Buy' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedChart.recommendation}
                    </div>
                  </div>
                  <div>
                    <strong className="text-gray-300">Confidence:</strong>
                    <div className="text-white">{selectedChart.confidence}%</div>
                  </div>
                  <div>
                    <strong className="text-gray-300">Entry Price:</strong>
                    <div className="text-white font-mono">${selectedChart.priceTargets.entry}</div>
                  </div>
                  <div>
                    <strong className="text-gray-300">Risk/Reward:</strong>
                    <div className="text-blue-400">{selectedChart.riskReward}:1</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedCharts;