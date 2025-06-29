'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
import { useMarketAnalysis } from '@/hooks/useMarketAnalysis';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft, 
  Calendar, 
  Target,
  Shield,
  Activity,
  DollarSign,
  TrendingDown as TrendingDownIcon,
  CheckCircle,
  XCircle,
  Link as LinkIcon,
  Clock,
  Loader2,
  AlertTriangle,
  Edit,
  Share2
} from 'lucide-react';

const ViewChart = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  const { getAnalysisById, updateAnalysis, loading: hookLoading, error: hookError } = useMarketAnalysis();
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchAnalysis = () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get analysis from the hook
        const foundAnalysis = getAnalysisById(id);
        
        if (!foundAnalysis) {
          setError('Analysis not found');
          return;
        }
        
        setAnalysis(foundAnalysis);
      } catch (err) {
        setError('Failed to load analysis');
        console.error('Error loading analysis:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalysis();
    }
  }, [id, getAnalysisById]);

  const handlePostSignal = async () => {
    if (!analysis || updating) return;
    
    try {
      setUpdating(true);
      // You can add custom logic here for posting signals
      // For now, we'll just add a 'posted' tag
      const updatedTags = analysis.tags ? [...analysis.tags, 'posted'] : ['posted'];
      
      await updateAnalysis(analysis.id, {
        tags: updatedTags
      });
      
      // Update local state
      setAnalysis(prev => ({
        ...prev,
        tags: updatedTags
      }));
      
    } catch (err) {
      console.error('Failed to post signal:', err);
      alert('Failed to post signal. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleTradeSignal = async () => {
    if (!analysis || updating) return;
    
    try {
      setUpdating(true);
      // Add 'traded' tag
      const updatedTags = analysis.tags ? [...analysis.tags, 'traded'] : ['traded'];
      
      await updateAnalysis(analysis.id, {
        tags: updatedTags
      });
      
      // Update local state
      setAnalysis(prev => ({
        ...prev,
        tags: updatedTags
      }));
      
    } catch (err) {
      console.error('Failed to trade signal:', err);
      alert('Failed to trade signal. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = () => {
    router.push(`/edit-analysis/${id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${analysis.asset_name} Analysis`,
          text: `${analysis.pattern_name} - ${analysis.sentiment} signal with ${analysis.confidence}% confidence`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const isPosted = () => {
    return analysis?.tags?.includes('posted') || false;
  };

  const isTraded = () => {
    return analysis?.tags?.includes('traded') || false;
  };

  const getStatusIcon = () => {
    if (isTraded()) {
      return <CheckCircle className="text-green-400" size={20} />;
    } else if (isPosted()) {
      return <LinkIcon className="text-orange-400" size={20} />;
    } else {
      return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStatusText = () => {
    if (isTraded()) return 'Traded';
    if (isPosted()) return 'Posted';
    return 'Saved';
  };

  const getStatusColor = () => {
    if (isTraded()) return 'bg-green-500/20 text-green-400 border-green-500';
    if (isPosted()) return 'bg-orange-500/20 text-orange-400 border-orange-500';
    return 'bg-gray-500/20 text-gray-400 border-gray-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || hookLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <div className="text-center">
            <Loader2 size={64} className="text-blue-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-white">Loading chart analysis...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || hookError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <div className="text-center">
            <XCircle size={64} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Chart Not Found</h2>
            <p className="text-gray-400 mb-4">{error || hookError}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <div className="text-center">
            <AlertTriangle size={64} className="text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Analysis Not Found</h2>
            <p className="text-gray-400 mb-4">The requested analysis could not be found.</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors"
            >
              Go Back
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
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Saved Charts
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Share2 size={16} />
                Share
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Edit size={16} />
                Edit
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="text-blue-400" size={32} />
                {analysis.asset_name}
              </h1>
              <p className="text-gray-400">
                {analysis.pattern_name} • Generated {formatDate(analysis.created_at)}
              </p>
            </div>
            
            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border ${getStatusColor()}`}>
              {getStatusIcon()}
              {getStatusText()}
            </div>
          </div>
        </div>

        {/* Chart Image */}
        <div className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
            {analysis.chart_image_url ? (
              <img
                src={analysis.chart_image_url}
                alt={`${analysis.asset_name} Chart`}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 bg-gray-700/50 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 size={64} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No chart image available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-gray-700">
          {/* Header with Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-green-400" />
              Analysis Results
            </h2>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handlePostSignal}
                disabled={isPosted() || updating}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isPosted()
                    ? 'bg-orange-700 text-orange-200 cursor-default'
                    : updating
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white transform hover:scale-105 shadow-lg'
                }`}
              >
                {updating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : isPosted() ? (
                  <>
                    <CheckCircle size={18} />
                    Posted
                  </>
                ) : (
                  <>
                    <LinkIcon size={18} />
                    Post Signal
                  </>
                )}
              </button>
              
              <button 
                onClick={handleTradeSignal}
                disabled={!isPosted() || isTraded() || updating}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isTraded()
                    ? 'bg-green-700 text-green-200 cursor-default'
                    : !isPosted() || updating
                    ? 'bg-gray-500 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg'
                }`}
                title={!isPosted() ? 'Post signal first to trade' : ''}
              >
                {updating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : isTraded() ? (
                  <>
                    <CheckCircle size={18} />
                    Traded
                  </>
                ) : (
                  <>
                    <DollarSign size={18} />
                    Trade Signal
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Asset Info & Pattern */}
            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-2">{analysis.asset_name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{analysis.asset_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pattern:</span>
                    <span className="text-blue-300">{analysis.pattern_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sentiment:</span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      analysis.sentiment === 'Bullish' ? 'text-green-400' : 
                      analysis.sentiment === 'Bearish' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {analysis.sentiment === 'Bullish' ? (
                        <TrendingUp size={16} />
                      ) : analysis.sentiment === 'Bearish' ? (
                        <TrendingDown size={16} />
                      ) : (
                        <Clock size={16} />
                      )}
                      {analysis.sentiment}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-white font-semibold">{analysis.confidence}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Target className="text-blue-400" size={18} />
                  Recommendation
                </h4>
                <div className="space-y-2">
                  <div className={`text-center py-3 px-4 rounded-lg font-bold text-lg border ${
                    analysis.recommendation === 'Buy' ? 'bg-green-500/20 text-green-400 border-green-500' :
                    analysis.recommendation === 'Sell' ? 'bg-red-500/20 text-red-400 border-red-500' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500'
                  }`}>
                    {analysis.recommendation}
                  </div>
                  <p className="text-gray-300 text-sm">{analysis.recommendation_reason || 'No specific reason provided'}</p>
                </div>
              </div>
            </div>

            {/* Price Targets */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <DollarSign className="text-green-400" size={18} />
                Price Targets
              </h4>
              <div className="space-y-3">
                {analysis.price_targets?.entry && (
                  <div className="flex justify-between items-center p-2 bg-gray-600/50 rounded">
                    <span className="text-gray-400">Entry:</span>
                    <span className="text-white font-mono text-lg">${analysis.price_targets.entry}</span>
                  </div>
                )}
                {analysis.price_targets?.target && (
                  <div className="flex justify-between items-center p-2 bg-green-500/10 rounded border border-green-500/30">
                    <span className="text-gray-400">Target:</span>
                    <span className="text-green-400 font-mono text-lg font-semibold">${analysis.price_targets.target}</span>
                  </div>
                )}
                {analysis.price_targets?.stopLoss && (
                  <div className="flex justify-between items-center p-2 bg-red-500/10 rounded border border-red-500/30">
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-red-400 font-mono text-lg font-semibold">${analysis.price_targets.stopLoss}</span>
                  </div>
                )}
                {analysis.price_targets?.support && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Support:</span>
                    <span className="text-blue-400 font-mono">${analysis.price_targets.support}</span>
                  </div>
                )}
                {analysis.price_targets?.resistance && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Resistance:</span>
                    <span className="text-orange-400 font-mono">${analysis.price_targets.resistance}</span>
                  </div>
                )}
                {analysis.risk_reward && (
                  <div className="flex justify-between pt-3 border-t border-gray-600">
                    <span className="text-gray-400 font-medium">Risk/Reward:</span>
                    <span className="text-white font-bold text-lg">{analysis.risk_reward}:1</span>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Indicators */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="text-purple-400" size={18} />
                Technical Indicators
              </h4>
              <div className="space-y-3">
                {analysis.indicators && analysis.indicators.length > 0 ? (
                  analysis.indicators.map((indicator, idx) => (
                    <div key={idx} className="p-3 bg-gray-600/50 rounded-lg border border-gray-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 font-medium">{indicator.name}</span>
                        <span className="text-white font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                          {indicator.value}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs leading-relaxed">{indicator.interpretation}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <BarChart3 size={32} className="mx-auto mb-2 text-gray-500" />
                    <p>No technical indicators available</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-600">
                <h5 className="text-gray-300 font-medium mb-2">Analysis Summary</h5>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {analysis.description || 'No detailed description provided for this analysis.'}
                </p>
                <div className="flex items-center gap-2 text-gray-500 text-xs mt-3">
                  <Calendar size={12} />
                  Generated: {formatDate(analysis.created_at)}
                </div>
                
                {/* Tags */}
                {analysis.tags && analysis.tags.length > 0 && (
                  <div className="mt-3">
                    <p className="text-gray-400 text-xs mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewChart;