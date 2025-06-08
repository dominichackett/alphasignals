'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header/Header';
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
  Clock
} from 'lucide-react';

const ViewChart = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data - in real app, fetch from database using the ID
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data based on ID - in real app, this would be a database query
        const mockCharts = {
          'analysis_1704567890123': {
            id: 'analysis_1704567890123',
            assetName: 'NASDAQ:AAPL',
            assetType: 'Stock',
            patternName: 'EMA Crossover',
            sentiment: 'Bullish',
            confidence: 85,
            recommendation: 'Buy',
            recommendationReason: 'Bullish momentum detected based on trend analysis with strong technical indicators',
            savedAt: '2024-01-06T14:30:00.000Z',
            chartImage: '/chart.jpg',
            description: 'Bullish EMA Crossover pattern identified with 85% confidence. Strong upward momentum with favorable risk/reward ratio.',
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
            isTraded: false,
            indicators: [
              {
                name: 'RSI',
                value: '68',
                interpretation: 'Bullish momentum building, not yet overbought'
              },
              {
                name: 'MACD',
                value: 'Positive crossover',
                interpretation: 'Confirming uptrend with strong momentum'
              },
              {
                name: 'Volume',
                value: 'Above average',
                interpretation: 'Strong institutional buying interest'
              }
            ]
          },
          'analysis_1704567890124': {
            id: 'analysis_1704567890124',
            assetName: 'NASDAQ:TSLA',
            assetType: 'Stock',
            patternName: 'Head and Shoulders',
            sentiment: 'Bearish',
            confidence: 72,
            recommendation: 'Sell',
            recommendationReason: 'Bearish reversal pattern with declining volume confirmation',
            savedAt: '2024-01-05T10:15:00.000Z',
            chartImage: '/chart.jpg',
            description: 'Bearish Head and Shoulders pattern identified with 72% confidence. Classic reversal signal with volume confirmation.',
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
            isTraded: false,
            indicators: [
              {
                name: 'RSI',
                value: '45',
                interpretation: 'Bearish momentum building, showing weakness'
              },
              {
                name: 'MACD',
                value: 'Negative crossover',
                interpretation: 'Confirming downtrend with increasing bearish momentum'
              },
              {
                name: 'Volume',
                value: 'Declining on rallies',
                interpretation: 'Lack of buying interest on upward moves'
              }
            ]
          },
          'analysis_1704567890125': {
            id: 'analysis_1704567890125',
            assetName: 'BINANCE:BTCUSDT',
            assetType: 'Crypto',
            patternName: 'Triangle Pattern',
            sentiment: 'Bullish',
            confidence: 91,
            recommendation: 'Buy',
            recommendationReason: 'Strong bullish breakout from consolidation triangle with high volume',
            savedAt: '2024-01-04T16:45:00.000Z',
            chartImage: '/chart.jpg',
            description: 'Bullish Triangle Pattern identified with 91% confidence. Excellent risk/reward setup with strong technical confirmation.',
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
            isTraded: true,
            indicators: [
              {
                name: 'RSI',
                value: '75',
                interpretation: 'Strong bullish momentum, approaching overbought'
              },
              {
                name: 'MACD',
                value: 'Strong positive divergence',
                interpretation: 'Powerful uptrend confirmation with accelerating momentum'
              },
              {
                name: 'Volume',
                value: 'Breakout with high volume',
                interpretation: 'Strong institutional and retail buying pressure'
              }
            ]
          }
        };
        
        const chart = mockCharts[id];
        if (!chart) {
          throw new Error('Chart not found');
        }
        
        setChartData(chart);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChartData();
    }
  }, [id]);

  const getStatusIcon = (chart) => {
    if (chart.isTraded) {
      return <CheckCircle className="text-green-400" size={20} />;
    } else if (chart.isPosted) {
      return <LinkIcon className="text-orange-400" size={20} />;
    } else {
      return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStatusText = (chart) => {
    if (chart.isTraded) return 'Traded';
    if (chart.isPosted) return 'Posted';
    return 'Saved';
  };

  const getStatusColor = (chart) => {
    if (chart.isTraded) return 'bg-green-500/20 text-green-400 border-green-500';
    if (chart.isPosted) return 'bg-orange-500/20 text-orange-400 border-orange-500';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <div className="text-center">
            <BarChart3 size={64} className="text-blue-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-white">Loading chart analysis...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <div className="text-center">
            <XCircle size={64} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Chart Not Found</h2>
            <p className="text-gray-400 mb-4">{error}</p>
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
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Saved Charts
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="text-blue-400" size={32} />
                {chartData.assetName}
              </h1>
              <p className="text-gray-400">
                {chartData.patternName} • Generated {formatDate(chartData.savedAt)}
              </p>
            </div>
            
            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border ${getStatusColor(chartData)}`}>
              {getStatusIcon(chartData)}
              {getStatusText(chartData)}
            </div>
          </div>
        </div>

        {/* Chart Image */}
        <div className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden">
            <img
              src={chartData.chartImage}
              alt={`${chartData.assetName} Chart`}
              className="w-full h-96 object-cover"
            />
          </div>
        </div>

        {/* Analysis Results - Similar to Chart.js */}
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
                disabled={chartData.isPosted}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  chartData.isPosted
                    ? 'bg-orange-700 text-orange-200 cursor-default'
                    : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white transform hover:scale-105 shadow-lg'
                }`}
              >
                {chartData.isPosted ? (
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
                disabled={!chartData.isPosted || chartData.isTraded}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  chartData.isTraded
                    ? 'bg-green-700 text-green-200 cursor-default'
                    : !chartData.isPosted
                    ? 'bg-gray-500 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg'
                }`}
                title={!chartData.isPosted ? 'Post signal first to trade' : ''}
              >
                {chartData.isTraded ? (
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
                <h3 className="text-lg font-semibold text-white mb-2">{chartData.assetName}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white">{chartData.assetType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pattern:</span>
                    <span className="text-blue-300">{chartData.patternName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sentiment:</span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      chartData.sentiment === 'Bullish' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {chartData.sentiment === 'Bullish' ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      {chartData.sentiment}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-white font-semibold">{chartData.confidence}%</span>
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
                    chartData.recommendation === 'Buy' ? 'bg-green-500/20 text-green-400 border-green-500' :
                    chartData.recommendation === 'Sell' ? 'bg-red-500/20 text-red-400 border-red-500' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500'
                  }`}>
                    {chartData.recommendation}
                  </div>
                  <p className="text-gray-300 text-sm">{chartData.recommendationReason}</p>
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
                <div className="flex justify-between items-center p-2 bg-gray-600/50 rounded">
                  <span className="text-gray-400">Entry:</span>
                  <span className="text-white font-mono text-lg">${chartData.priceTargets.entry}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-500/10 rounded border border-green-500/30">
                  <span className="text-gray-400">Target:</span>
                  <span className="text-green-400 font-mono text-lg font-semibold">${chartData.priceTargets.target}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-500/10 rounded border border-red-500/30">
                  <span className="text-gray-400">Stop Loss:</span>
                  <span className="text-red-400 font-mono text-lg font-semibold">${chartData.priceTargets.stopLoss}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Support:</span>
                  <span className="text-blue-400 font-mono">${chartData.priceTargets.support}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Resistance:</span>
                  <span className="text-orange-400 font-mono">${chartData.priceTargets.resistance}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-600">
                  <span className="text-gray-400 font-medium">Risk/Reward:</span>
                  <span className="text-white font-bold text-lg">{chartData.riskReward}:1</span>
                </div>
              </div>
            </div>

            {/* Technical Indicators */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="text-purple-400" size={18} />
                Technical Indicators
              </h4>
              <div className="space-y-3">
                {chartData.indicators.map((indicator, idx) => (
                  <div key={idx} className="p-3 bg-gray-600/50 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 font-medium">{indicator.name}</span>
                      <span className="text-white font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                        {indicator.value}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{indicator.interpretation}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-600">
                <h5 className="text-gray-300 font-medium mb-2">Analysis Summary</h5>
                <p className="text-gray-300 text-sm leading-relaxed">{chartData.description}</p>
                <div className="flex items-center gap-2 text-gray-500 text-xs mt-3">
                  <Calendar size={12} />
                  Generated: {formatDate(chartData.savedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewChart;