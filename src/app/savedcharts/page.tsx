'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import { useMarketAnalysis } from '@/hooks/useMarketAnalysis';
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
  Link as LinkIcon,
  Loader2,
  RefreshCw
} from 'lucide-react';

const SavedCharts = () => {
  const router = useRouter();
  const {
    analyses,
    loading,
    error,
    fetchAnalyses,
    updateAnalysis,
    getFilteredAnalyses,
    getStatistics
  } = useMarketAnalysis();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filteredCharts, setFilteredCharts] = useState([]);

  // Load initial data
  useEffect(() => {
    fetchAnalyses({ status: 'active' });
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...analyses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(analysis => 
        analysis.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analysis.pattern_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      switch (filterType) {
        case 'stocks':
          filtered = filtered.filter(analysis => analysis.asset_type === 'Stock');
          break;
        case 'crypto':
          filtered = filtered.filter(analysis => analysis.asset_type === 'Crypto');
          break;
        case 'forex':
          filtered = filtered.filter(analysis => analysis.asset_type === 'Forex');
          break;
        case 'bullish':
          filtered = filtered.filter(analysis => analysis.sentiment === 'Bullish');
          break;
        case 'bearish':
          filtered = filtered.filter(analysis => analysis.sentiment === 'Bearish');
          break;
        case 'neutral':
          filtered = filtered.filter(analysis => analysis.sentiment === 'Neutral');
          break;
      }
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'confidence':
          return b.confidence - a.confidence;
        case 'riskReward':
          return (b.risk_reward || 0) - (a.risk_reward || 0);
        case 'assetName':
          return a.asset_name.localeCompare(b.asset_name);
        default:
          return 0;
      }
    });

    setFilteredCharts(filtered);
  }, [analyses, searchTerm, filterType, sortBy]);

  const handleChartSelect = (analysis) => {
    // Navigate to ViewChart page with the analysis ID
    router.push(`/viewchart/${analysis.id}`);
  };

  const handleDeleteChart = async (analysisId, e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      // Update status to 'expired' instead of deleting
      await updateAnalysis(analysisId, { status: 'expired' });
      
      // Refresh the list
      fetchAnalyses({ status: 'active' });
    } catch (error) {
      console.error('Failed to delete analysis:', error);
      alert('Failed to delete analysis. Please try again.');
    }
  };

  const handleRefresh = () => {
    fetchAnalyses({ status: 'active' });
  };

  const getStatusIcon = (analysis) => {
    // You can extend this based on your business logic
    // For now, we'll show based on recommendation
    switch (analysis.recommendation) {
      case 'Buy':
        return <TrendingUp className="text-green-400" size={16} />;
      case 'Sell':
        return <TrendingDown className="text-red-400" size={16} />;
      case 'Hold':
        return <Clock className="text-yellow-400" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getStatusText = (analysis) => {
    return analysis.recommendation;
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

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Bullish':
        return 'text-green-400';
      case 'Bearish':
        return 'text-red-400';
      case 'Neutral':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRecommendationBadgeColor = (recommendation) => {
    switch (recommendation) {
      case 'Buy':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'Sell':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'Hold':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  // Get statistics for the header
  const stats = getStatistics();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <Header />
        <div className="p-6 pt-24 max-w-7xl mx-auto">
          <div className="text-center py-16">
            <XCircle size={64} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Error Loading Charts
            </h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      <Header />
      
      <div className="p-6 pt-24 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="text-blue-400" size={32} />
                Saved Charts
              </h1>
              <p className="text-gray-400">
                View and manage your saved trading analysis charts
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={16} />
              Refresh
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Analyses</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-green-400">{stats.byRecommendation.Buy || 0}</div>
              <div className="text-sm text-gray-400">Buy Signals</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-red-400">{stats.byRecommendation.Sell || 0}</div>
              <div className="text-sm text-gray-400">Sell Signals</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">{stats.averageConfidence}%</div>
              <div className="text-sm text-gray-400">Avg. Confidence</div>
            </div>
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
              <option value="forex">Forex Only</option>
              <option value="bullish">Bullish Signals</option>
              <option value="bearish">Bearish Signals</option>
              <option value="neutral">Neutral Signals</option>
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
              <option value="assetName">Asset Name (A-Z)</option>
            </select>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-700/30 rounded-lg px-4 py-3">
              <span className="text-gray-300">
                {filteredCharts.length} chart{filteredCharts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 size={48} className="text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading your saved charts...</p>
          </div>
        )}

        {/* Charts Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCharts.map((analysis) => (
              <div
                key={analysis.id}
                onClick={() => handleChartSelect(analysis)}
                className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-200 cursor-pointer transform hover:scale-105 shadow-xl hover:shadow-2xl group"
              >
                {/* Chart Image */}
                <div className="relative">
                  {analysis.chart_image_url ? (
                    <img
                      src={analysis.chart_image_url}
                      alt={`${analysis.asset_name} Chart`}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-700/50 rounded-t-lg flex items-center justify-center">
                      <BarChart3 size={48} className="text-gray-500" />
                    </div>
                  )}
                  
                  {/* Recommendation Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border ${getRecommendationBadgeColor(analysis.recommendation)}`}>
                      {getStatusIcon(analysis)}
                      {getStatusText(analysis)}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteChart(analysis.id, e)}
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
                      {analysis.asset_name}
                    </h3>
                    <p className="text-blue-300 text-sm">{analysis.pattern_name}</p>
                    <p className="text-gray-400 text-xs">{analysis.asset_type}</p>
                  </div>

                  {/* Key Metrics Row */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getSentimentColor(analysis.sentiment)}`}>
                        {analysis.sentiment === 'Bullish' ? (
                          <TrendingUp className="inline mr-1" size={16} />
                        ) : analysis.sentiment === 'Bearish' ? (
                          <TrendingDown className="inline mr-1" size={16} />
                        ) : (
                          <Clock className="inline mr-1" size={16} />
                        )}
                        {analysis.sentiment}
                      </div>
                      <div className="text-xs text-gray-400">Sentiment</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">
                        {analysis.confidence}%
                      </div>
                      <div className="text-xs text-gray-400">Confidence</div>
                    </div>
                  </div>

                  {/* Price Targets */}
                  {analysis.price_targets && (
                    <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                      {analysis.price_targets.entry && (
                        <div className="bg-gray-700/50 rounded p-2">
                          <div className="text-gray-400">Entry</div>
                          <div className="text-white font-mono">${analysis.price_targets.entry}</div>
                        </div>
                      )}
                      {analysis.price_targets.target && (
                        <div className="bg-gray-700/50 rounded p-2">
                          <div className="text-gray-400">Target</div>
                          <div className="text-green-400 font-mono">${analysis.price_targets.target}</div>
                        </div>
                      )}
                      {analysis.risk_reward && (
                        <div className="bg-gray-700/50 rounded p-2">
                          <div className="text-gray-400">R/R</div>
                          <div className="text-blue-400 font-semibold">{analysis.risk_reward}:1</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {analysis.tags && analysis.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {analysis.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {analysis.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full">
                            +{analysis.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-600">
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(analysis.created_at)}
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
        )}

        {/* Empty State */}
        {!loading && filteredCharts.length === 0 && (
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
      </div>
    </div>
  );
};

export default SavedCharts;