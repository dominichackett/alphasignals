'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Eye,
  Star,
  Users,
  Award,
  Loader2,
  RefreshCw,
  XCircle,
  AlertTriangle,
  TrendingDown as TrendingDownIcon,
  Clock
} from 'lucide-react';
import Header from '@/components/Header/Header';
import { useTradingSignals } from '@/hooks/useTradingSignals';

const GeneralSignals = () => {
  const router = useRouter();
  const { 
    signals, 
    loading, 
    error, 
    fetchTradingSignals,
    fetchMySignals 
  } = useTradingSignals();

  const [filteredSignals, setFilteredSignals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Load initial data - fetch all signals since they're all public
  useEffect(() => {
    console.log('GeneralSignals: Loading all signals...');
    fetchTradingSignals();
  }, [fetchTradingSignals]);

  // Debug: Log signals when they change
  useEffect(() => {
    console.log('GeneralSignals: Signals updated:', signals.length, signals);
  }, [signals]);

  // Debug: Log filtered signals
  useEffect(() => {
    console.log('GeneralSignals: Filtered signals:', filteredSignals.length, filteredSignals);
  }, [filteredSignals]);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...signals];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(signal => 
        signal.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        signal.pattern_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (signal.user_profile?.name && signal.user_profile.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (signal.user_profile?.username && signal.user_profile.username.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      switch (filterType) {
        case 'stocks':
          filtered = filtered.filter(signal => signal.asset_type === 'Stock');
          break;
        case 'crypto':
          filtered = filtered.filter(signal => signal.asset_type === 'Crypto');
          break;
        case 'forex':
          filtered = filtered.filter(signal => signal.asset_type === 'Forex');
          break;
        case 'commodity':
          filtered = filtered.filter(signal => signal.asset_type === 'Commodity');
          break;
        case 'index':
          filtered = filtered.filter(signal => signal.asset_type === 'Index');
          break;
        case 'buy':
          filtered = filtered.filter(signal => signal.recommendation === 'Buy');
          break;
        case 'sell':
          filtered = filtered.filter(signal => signal.recommendation === 'Sell');
          break;
        case 'hold':
          filtered = filtered.filter(signal => signal.recommendation === 'Hold');
          break;
        case 'open':
          filtered = filtered.filter(signal => signal.status === 'Open');
          break;
        case 'closed':
          filtered = filtered.filter(signal => signal.status === 'Closed');
          break;
        case 'verified':
          filtered = filtered.filter(signal => signal.user_profile?.verified);
          break;
      }
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.signal_created_at || b.created_at) - new Date(a.signal_created_at || a.created_at);
        case 'oldest':
          return new Date(a.signal_created_at || a.created_at) - new Date(b.signal_created_at || b.created_at);
        case 'confidence':
          return b.confidence - a.confidence;
        case 'rating':
          // Sort by tier priority: Elite > Pro > Premium > Basic
          const tierPriority = { 'Elite': 4, 'Pro': 3, 'Premium': 2, 'Basic': 1 };
          return (tierPriority[b.user_profile?.tier] || 0) - (tierPriority[a.user_profile?.tier] || 0);
        case 'followers':
          // For now, sort by tier as a proxy for popularity
          return (tierPriority[b.user_profile?.tier] || 0) - (tierPriority[a.user_profile?.tier] || 0);
        case 'alphabetical':
          return a.asset_name.localeCompare(b.asset_name);
        default:
          return 0;
      }
    });

    setFilteredSignals(filtered);
  }, [signals, searchTerm, filterType, sortBy]);

  const handleRefresh = () => {
    fetchTradingSignals();
  };

  const handleSignalClick = (signal) => {
    // Navigate to signal details
    if (signal.analysis_id) {
      router.push(`/viewchart/${signal.analysis_id}`);
    } else {
      router.push(`/signal/${signal.id}`);
    }
  };

  const handleTradeNow = (signal, e) => {
    e.stopPropagation();
    // Navigate to trading interface or open modal
    router.push(`/trade/${signal.id}`);
  };

  const getAssetTypeIcon = (type) => {
    switch (type) {
      case 'Stock':
        return <Building2 className="text-blue-400" size={16} />;
      case 'Crypto':
        return <Bitcoin className="text-orange-400" size={16} />;
      case 'Forex':
        return <Globe className="text-green-400" size={16} />;
      case 'Commodity':
        return <DollarSign className="text-yellow-400" size={16} />;
      case 'Index':
        return <BarChart3 className="text-purple-400" size={16} />;
      default:
        return <BarChart3 className="text-gray-400" size={16} />;
    }
  };

  const formatPrice = (price, assetType) => {
    if (!price) return '—';
    
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
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateActualReturn = (signal) => {
    if (signal.actual_return_percentage !== null && signal.actual_return_percentage !== undefined) {
      return signal.actual_return_percentage.toFixed(1);
    }

    if (signal.status !== 'Closed' || !signal.actual_closed_price || !signal.entry_price) {
      return null;
    }
    
    const entry = signal.entry_price;
    const actualClosed = signal.actual_closed_price;
    
    if (signal.recommendation === 'Buy') {
      return ((actualClosed - entry) / entry * 100).toFixed(1);
    } else {
      return ((entry - actualClosed) / entry * 100).toFixed(1);
    }
  };

  const formatFollowers = (followers) => {
    if (!followers) return '0';
    if (followers >= 1000) {
      return `${(followers / 1000).toFixed(1)}K`;
    }
    return followers.toString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'Closed':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'Expired':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-400';
      case 'Closed':
        return 'bg-green-400';
      case 'Cancelled':
        return 'bg-red-400';
      case 'Expired':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-400';
    }
  };

  // Get creator tier badge color
  const getTierColor = (tier) => {
    switch (tier) {
      case 'Elite':
        return 'text-purple-400 bg-purple-500/20';
      case 'Pro':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'Premium':
        return 'text-blue-400 bg-blue-500/20';
      case 'Basic':
        return 'text-gray-400 bg-gray-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Generate avatar fallback
  const getAvatarFallback = (name) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=150`;
  };

  // Calculate statistics
  const stats = {
    total: signals.length,
    open: signals.filter(s => s.status === 'Open').length,
    verified: signals.filter(s => s.user_profile?.verified).length,
    avgConfidence: signals.length > 0 
      ? signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length 
      : 0
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <Header />
        <div className="p-6 pt-24 max-w-7xl mx-auto">
          <div className="text-center py-16">
            <XCircle size={64} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">
              Error Loading Signals
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Zap className="text-blue-400" size={32} />
                Trading Signals
              </h1>
              <p className="text-gray-400">
                Discover trading signals from expert traders and analysts
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
            
            {/* Debug buttons - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <button
                  onClick={() => {
                    console.log('🧪 Testing fetchTradingSignals (all signals)');
                    fetchTradingSignals();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                >
                  Test All Signals
                </button>
              </>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Signals</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">{stats.open}</div>
              <div className="text-sm text-gray-400">Open Signals</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-green-400">{stats.verified}</div>
              <div className="text-sm text-gray-400">Active Traders</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-yellow-400">{stats.avgConfidence.toFixed(0)}%</div>
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
                placeholder="Search signals or assets..."
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
              <option value="commodity">Commodities</option>
              <option value="index">Indices</option>
              <option value="buy">Buy Signals</option>
              <option value="sell">Sell Signals</option>
              <option value="hold">Hold Signals</option>
              <option value="open">Open Positions</option>
              <option value="closed">Closed Positions</option>
              <option value="verified">Verified Traders</option>
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
              <option value="rating">Top Rated Traders</option>
              <option value="followers">Most Followed</option>
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

     

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 size={48} className="text-blue-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading trading signals...</p>
          </div>
        )}

        {/* Signals List */}
        {!loading && (
          <div className="space-y-4">
            {filteredSignals.map((signal, index) => {
              // Use real user profile data if available, otherwise fallback
              const creator = signal.user_profile || {
                name: signal.user_id || 'Anonymous Trader',
                username: `trader_${signal.user_id?.slice(-6) || 'unknown'}`,
                avatar_url: null,
                verified: false,
                tier: 'Basic'
              };
              
              return (
                <div
                  key={signal.id}
                  onClick={() => handleSignalClick(signal)}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] shadow-xl hover:shadow-2xl group"
                >
                  <div className="p-6">
                    {/* Creator Info - Top Row */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-600">
                      <div className="flex items-center gap-3">
                        <img
                          src={creator.avatar_url || getAvatarFallback(creator.name)}
                          alt={creator.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-600"
                          onError={(e) => {
                            e.target.src = getAvatarFallback(creator.name);
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-semibold">{creator.name}</h4>
                            {creator.verified && (
                              <Award className="text-blue-400" size={16} />
                            )}
                            {creator.tier && (
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTierColor(creator.tier)}`}>
                                {creator.tier}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>@{creator.username}</span>
                            {creator.location && (
                              <span>{creator.location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">
                          {formatDate(signal.signal_created_at || signal.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 items-center">
                      {/* Asset Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-2">
                          {getAssetTypeIcon(signal.asset_type)}
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {signal.asset_name}
                            </h3>
                            <p className="text-sm text-gray-400">{signal.asset_type} • {signal.pattern_name}</p>
                          </div>
                        </div>
                        {/* Status Badge */}
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(signal.status)}`}>
                          <div className={`w-2 h-2 rounded-full ${getStatusDotColor(signal.status)}`}></div>
                          {signal.status}
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm border ${
                          signal.recommendation === 'Buy' 
                            ? 'bg-green-500/20 text-green-400 border-green-500'
                            : signal.recommendation === 'Sell'
                            ? 'bg-red-500/20 text-red-400 border-red-500'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
                        }`}>
                          {signal.recommendation === 'Buy' ? (
                            <TrendingUp size={16} />
                          ) : signal.recommendation === 'Sell' ? (
                            <TrendingDown size={16} />
                          ) : (
                            <Clock size={16} />
                          )}
                          {signal.recommendation}
                        </div>
                      </div>

                      {/* Entry & TP/SL */}
                      <div className="text-center">
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-gray-400">Entry</div>
                            <div className="text-sm font-mono text-white">
                              {signal.asset_type === 'Forex' ? '' : '$'}{formatPrice(signal.entry_price, signal.asset_type)}
                            </div>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <div>
                              <div className="text-gray-400">TP</div>
                              <div className="font-mono text-green-400">
                                {signal.take_profit 
                                  ? `${signal.asset_type === 'Forex' ? '' : '$'}${formatPrice(signal.take_profit, signal.asset_type)}`
                                  : '—'
                                }
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-400">SL</div>
                              <div className="font-mono text-red-400">
                                {signal.stop_loss 
                                  ? `${signal.asset_type === 'Forex' ? '' : '$'}${formatPrice(signal.stop_loss, signal.asset_type)}`
                                  : '—'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actual Closed Price */}
                      <div className="text-center">
                        <div className="text-xs text-gray-400 mb-1">Closed At</div>
                        <div className="text-lg font-mono text-white">
                          {signal.actual_closed_price 
                            ? `${signal.asset_type === 'Forex' ? '' : '$'}${formatPrice(signal.actual_closed_price, signal.asset_type)}`
                            : '—'
                          }
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {signal.status === 'Open' ? 'Active' : 'Final'}
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
                            <div className="text-xs text-gray-400">Return</div>
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

                      {/* Action */}
                      <div className="text-center">
                        {signal.status === 'Open' ? (
                          <button 
                            onClick={(e) => handleTradeNow(signal, e)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 flex items-center gap-2 mx-auto"
                          >
                            <DollarSign size={14} />
                            Trade Now
                          </button>
                        ) : (
                          <div className="flex items-center justify-center text-blue-400 text-sm group-hover:text-blue-300">
                            <Eye size={14} className="mr-1" />
                            View Details
                            <ChevronRight size={14} className="ml-1" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reason - Full Width Below */}
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <div className="text-sm text-gray-400 mb-1">Analysis:</div>
                      <p className="text-sm text-gray-300 leading-relaxed">{signal.reason || 'No detailed analysis provided'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSignals.length === 0 && (
          <div className="text-center py-16">
            <Zap size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No signals found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Check back later for new trading signals'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneralSignals;