'use client'
import React, { useEffect, useRef, memo, useState } from 'react';
import Header from '@/components/Header/Header';
import { TrendingUp, BarChart3, Zap, Play, Save, Link, Download, CheckCircle, DollarSign } from 'lucide-react';

const Chart = () => {
  const container = useRef(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState('trend');
  const [signals, setSignals] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToBlockchain, setIsAddingToBlockchain] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [blockchainStatus, setBlockchainStatus] = useState('');
  const [tradeStatus, setTradeStatus] = useState('');
  
  // Track completion states
  const [isSaved, setIsSaved] = useState(false);
  const [isPosted, setIsPosted] = useState(false);

  const analysisOptions = [
    { value: 'trend', label: 'Trend Analysis', icon: TrendingUp },
    { value: 'pattern', label: 'Pattern Analysis', icon: BarChart3 }
  ];

  const generateSignal = async () => {
    setIsGenerating(true);
    
    // Reset completion states when generating new signal
    setIsSaved(false);
    setIsPosted(false);
    setSaveStatus('');
    setBlockchainStatus('');
    setTradeStatus('');
    
    // Simulate AI analysis like your actual implementation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock data similar to your AI response structure
    const assets = ['NASDAQ:AAPL', 'NASDAQ:TSLA', 'NASDAQ:GOOGL', 'NASDAQ:MSFT', 'BINANCE:BTCUSDT'];
    const patterns = selectedAnalysis === 'trend' 
      ? ['EMA Crossover', 'Support/Resistance Bounce with Candlestick Confirmation', 'Bollinger Band Squeeze Breakout']
      : ['Head and Shoulders', 'Double Top', 'Triangle Pattern', 'Flag Pattern', 'Wedge Pattern'];
    
    const sentiments = ['Bullish', 'Bearish'];
    const recommendations = ['Buy', 'Sell', 'Hold'];
    
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const confidence = Math.floor(Math.random() * 40) + 60;
    const currentPrice = 150 + Math.random() * 100;
    
    const newSignal = {
      assetName: assets[Math.floor(Math.random() * assets.length)],
      assetType: assets[Math.floor(Math.random() * assets.length)].includes('BINANCE') ? 'Crypto' : 'Stock',
      patternName: patterns[Math.floor(Math.random() * patterns.length)],
      sentiment: sentiment,
      confidence: confidence,
      description: `${sentiment} ${patterns[Math.floor(Math.random() * patterns.length)]} pattern identified with ${confidence}% confidence`,
      recommendation: sentiment === 'Bullish' ? 'Buy' : sentiment === 'Bearish' ? 'Sell' : 'Hold',
      recommendationReason: `${sentiment} momentum detected based on ${selectedAnalysis} analysis`,
      priceTargets: {
        resistance: Math.round((currentPrice + Math.random() * 20) * 100) / 100,
        support: Math.round((currentPrice - Math.random() * 20) * 100) / 100,
        target: Math.round((currentPrice + (sentiment === 'Bullish' ? 1 : -1) * (Math.random() * 30 + 10)) * 100) / 100,
        entry: Math.round(currentPrice * 100) / 100,
        exit: Math.round((currentPrice + (sentiment === 'Bullish' ? 1 : -1) * (Math.random() * 25 + 15)) * 100) / 100,
        stopLoss: Math.round((currentPrice - (sentiment === 'Bullish' ? 1 : -1) * (Math.random() * 10 + 5)) * 100) / 100
      },
      riskReward: Math.round((Math.random() * 3 + 1) * 100) / 100,
      timestamp: new Date().toISOString(),
      indicators: [
        {
          name: 'RSI',
          value: Math.floor(Math.random() * 100).toString(),
          interpretation: sentiment === 'Bullish' ? 'Bullish momentum building' : 'Bearish momentum building'
        },
        {
          name: 'MACD',
          value: sentiment === 'Bullish' ? 'Positive crossover' : 'Negative crossover',
          interpretation: sentiment === 'Bullish' ? 'Confirming uptrend' : 'Confirming downtrend'
        }
      ]
    };
    
    // Replace the current signal (only keep one like your AI implementation)
    setSignals([newSignal]);
    setIsGenerating(false);
  };

  const saveAnalysis = async () => {
    if (signals.length === 0) return;
    
    setIsSaving(true);
    setSaveStatus('');
    
    try {
      // Simulate saving to database/storage
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysisData = {
        ...signals[0],
        savedAt: new Date().toISOString(),
        id: `analysis_${Date.now()}`
      };
      
      // In a real app, you would save to your database here
      // await saveToDatabase(analysisData);
      
      // For demo, we'll create a downloadable JSON file
      const dataStr = JSON.stringify(analysisData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `trading_analysis_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsSaved(true);
      setSaveStatus('Analysis saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
      
    } catch (error) {
      console.error('Error saving analysis:', error);
      setSaveStatus('Failed to save analysis');
      setTimeout(() => setSaveStatus(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const addToBlockchain = async () => {
    if (signals.length === 0 || !isSaved) return;
    
    setIsAddingToBlockchain(true);
    setBlockchainStatus('');
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const blockchainData = {
        signalHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        transactionId: `tx_${Date.now()}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
        timestamp: new Date().toISOString(),
        gasUsed: Math.floor(Math.random() * 50000) + 21000,
        confirmations: Math.floor(Math.random() * 10) + 1,
        analysisData: {
          assetName: signals[0].assetName,
          patternName: signals[0].patternName,
          recommendation: signals[0].recommendation,
          confidence: signals[0].confidence,
          timestamp: signals[0].timestamp
        }
      };
      
      // In a real app, you would interact with blockchain here
      // await addToSmartContract(blockchainData);
      
      setIsPosted(true);
      setBlockchainStatus(`Signal posted to blockchain! TX: ${blockchainData.transactionId}`);
      setTimeout(() => setBlockchainStatus(''), 5000);
      
    } catch (error) {
      console.error('Error adding to blockchain:', error);
      setBlockchainStatus('Failed to add to blockchain');
      setTimeout(() => setBlockchainStatus(''), 3000);
    } finally {
      setIsAddingToBlockchain(false);
    }
  };

  const tradeSignal = async () => {
    if (signals.length === 0 || !isSaved || !isPosted) return;
    
    setIsTrading(true);
    setTradeStatus('');
    
    try {
      // Simulate trade execution
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const tradeData = {
        tradeId: `trade_${Date.now()}`,
        asset: signals[0].assetName,
        action: signals[0].recommendation,
        entryPrice: signals[0].priceTargets.entry,
        quantity: Math.floor(Math.random() * 100) + 10,
        orderType: 'Market',
        executedAt: new Date().toISOString(),
        status: 'Executed',
        fees: Math.round(signals[0].priceTargets.entry * 0.001 * 100) / 100 // 0.1% fee
      };
      
      // In a real app, you would execute the trade through your broker API
      // await executeTrade(tradeData);
      
      setTradeStatus(`Trade executed successfully! ${tradeData.action} ${tradeData.quantity} shares of ${tradeData.asset} at $${tradeData.entryPrice}`);
      setTimeout(() => setTradeStatus(''), 5000);
      
    } catch (error) {
      console.error('Error executing trade:', error);
      setTradeStatus('Failed to execute trade');
      setTimeout(() => setTradeStatus(''), 3000);
    } finally {
      setIsTrading(false);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "NASDAQ:AAPL",
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "studies": [
           "STD;MA%1Cross",
            "STD;MACD",
            "STD;RSI",
            "Volume@tv-basicstudies"
        ],
        "support_host": "https://www.tradingview.com"
      }`;
    container.current.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      {/* Header Navigation */}
      <Header />
      
      {/* Main Content Container */}
      <div className="p-4 pt-30 space-y-4">
        {/* Top Section - Chart and Signal Generator */}
        <div className="flex h-[calc(70vh)] gap-4">
          {/* Chart Container */}
          <div className="flex-1">
            <div 
              className="tradingview-widget-container h-full w-full rounded-lg overflow-hidden shadow-2xl" 
              ref={container}
            >
              <div 
                className="tradingview-widget-container__widget" 
                style={{ height: "calc(100% - 32px)", width: "100%" }}
              ></div>
              <div className="tradingview-widget-copyright">
                <a 
                  href="https://www.tradingview.com/" 
                  rel="noopener nofollow" 
                  target="_blank"
                >
                  <span className="blue-text">Track all markets on TradingView</span>
                </a>
              </div>
            </div>
          </div>

          {/* Signal Generator Panel */}
          <div className="w-80 bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="text-blue-400" />
              Signal Generator
            </h2>
            
            {/* Analysis Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Analysis Type
              </label>
              <div className="space-y-2">
                {analysisOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedAnalysis(option.value)}
                      className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 ${
                        selectedAnalysis === option.value
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      <IconComponent size={18} />
                      <span className="font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateSignal}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isGenerating
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105'
              }`}
            >
              <Play size={18} />
              {isGenerating ? 'Analyzing Chart...' : 'Generate Signal'}
            </button>
          </div>
        </div>

        {/* Bottom Section - Signal Results */}
        {signals.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-gray-700">
            {/* Header with Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-green-400" />
                Analysis Results
              </h2>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Save Analysis Button */}
                <button
                  onClick={saveAnalysis}
                  disabled={isSaving || isSaved}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSaved
                      ? 'bg-green-700 text-green-200 cursor-default'
                      : isSaving
                      ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                      : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105 shadow-lg'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle size={18} />
                      Saved
                    </>
                  ) : isSaving ? (
                    <>
                      <Download size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Analysis
                    </>
                  )}
                </button>
                
                {/* Post Signal Button */}
                <button
                  onClick={addToBlockchain}
                  disabled={isAddingToBlockchain || !isSaved || isPosted}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isPosted
                      ? 'bg-orange-700 text-orange-200 cursor-default'
                      : !isSaved
                      ? 'bg-gray-500 cursor-not-allowed text-gray-400'
                      : isAddingToBlockchain
                      ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white transform hover:scale-105 shadow-lg'
                  }`}
                  title={!isSaved ? 'Save analysis first to post signal' : ''}
                >
                  {isPosted ? (
                    <>
                      <CheckCircle size={18} />
                      Posted
                    </>
                  ) : isAddingToBlockchain ? (
                    <>
                      <Link size={18} className="animate-pulse" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Link size={18} />
                      Post Signal
                    </>
                  )}
                </button>

                {/* Trade Signal Button */}
                <button
                  onClick={tradeSignal}
                  disabled={isTrading || !isSaved || !isPosted}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    !isSaved || !isPosted
                      ? 'bg-gray-500 cursor-not-allowed text-gray-400'
                      : isTrading
                      ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white transform hover:scale-105 shadow-lg'
                  }`}
                  title={!isSaved || !isPosted ? 'Save and post signal first to trade' : ''}
                >
                  {isTrading ? (
                    <>
                      <DollarSign size={18} className="animate-pulse" />
                      Trading...
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

            {/* Status Messages */}
            {(saveStatus || blockchainStatus || tradeStatus) && (
              <div className="mb-4 space-y-2">
                {saveStatus && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    saveStatus.includes('successfully') 
                      ? 'bg-green-500/20 border border-green-500 text-green-400' 
                      : 'bg-red-500/20 border border-red-500 text-red-400'
                  }`}>
                    <CheckCircle size={16} />
                    {saveStatus}
                  </div>
                )}
                {blockchainStatus && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    blockchainStatus.includes('posted') 
                      ? 'bg-orange-500/20 border border-orange-500 text-orange-400' 
                      : 'bg-red-500/20 border border-red-500 text-red-400'
                  }`}>
                    <Link size={16} />
                    {blockchainStatus}
                  </div>
                )}
                {tradeStatus && (
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    tradeStatus.includes('executed') 
                      ? 'bg-purple-500/20 border border-purple-500 text-purple-400' 
                      : 'bg-red-500/20 border border-red-500 text-red-400'
                  }`}>
                    <DollarSign size={16} />
                    {tradeStatus}
                  </div>
                )}
              </div>
            )}
            
            {signals.map((signal, index) => (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Asset Info & Pattern */}
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-2">{signal.assetName}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white">{signal.assetType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Pattern:</span>
                        <span className="text-blue-300">{signal.patternName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sentiment:</span>
                        <span className={`font-semibold ${signal.sentiment === 'Bullish' ? 'text-green-400' : 'text-red-400'}`}>
                          {signal.sentiment}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-white">{signal.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <h4 className="font-semibold text-white mb-2">Recommendation</h4>
                    <div className="space-y-2">
                      <div className={`text-center py-2 px-4 rounded-lg font-bold text-lg ${
                        signal.recommendation === 'Buy' ? 'bg-green-500/20 text-green-400 border border-green-500' :
                        signal.recommendation === 'Sell' ? 'bg-red-500/20 text-red-400 border border-red-500' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                      }`}>
                        {signal.recommendation}
                      </div>
                      <p className="text-gray-300 text-sm">{signal.recommendationReason}</p>
                    </div>
                  </div>
                </div>

                {/* Price Targets */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-semibold text-white mb-3">Price Targets</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Entry:</span>
                      <span className="text-white font-mono">${signal.priceTargets.entry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target:</span>
                      <span className="text-green-400 font-mono">${signal.priceTargets.target}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stop Loss:</span>
                      <span className="text-red-400 font-mono">${signal.priceTargets.stopLoss}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Support:</span>
                      <span className="text-blue-400 font-mono">${signal.priceTargets.support}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Resistance:</span>
                      <span className="text-orange-400 font-mono">${signal.priceTargets.resistance}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-600">
                      <span className="text-gray-400">Risk/Reward:</span>
                      <span className="text-white font-semibold">{signal.riskReward}:1</span>
                    </div>
                  </div>
                </div>

                {/* Technical Indicators */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-semibold text-white mb-3">Technical Indicators</h4>
                  <div className="space-y-3">
                    {signal.indicators.map((indicator, idx) => (
                      <div key={idx} className="p-3 bg-gray-600/50 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-300 font-medium">{indicator.name}</span>
                          <span className="text-white font-mono text-sm">{indicator.value}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{indicator.interpretation}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-600">
                    <p className="text-gray-300 text-sm">{signal.description}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      Generated: {new Date(signal.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chart;