'use client'
import React, { useEffect, useRef, memo, useState } from 'react';
import Header from '@/components/Header/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketAnalysis } from '@/hooks/useMarketAnalysis';
import { TrendingUp, BarChart3, Zap, Play, Save, Link, Download, CheckCircle, DollarSign, Lock, AlertCircle } from 'lucide-react';
import { useBlockchainSignals } from '@/hooks/useBlockchainSignals'

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
  const [savedSignalId, setSavedSignalId] = useState<string | null>(null)
  const [blockchainSignalId, setBlockchainSignalId] = useState<string | null>(null)

// Add the blockchain hook
  const { 
  isCreatingSignal, 
  createSignalOnBlockchain, 
  error: blockchainError 
} = useBlockchainSignals()
  // NEW: State to store captured chart image
  const [capturedChartImage, setCapturedChartImage] = useState<string | null>(null);
  
  // Track completion states
  const [isSaved, setIsSaved] = useState(false);
  const [isPosted, setIsPosted] = useState(false);

  // Auth and database hooks
  const { isAuthenticated, loading: authLoading, signInWithSupabase } = useAuth();
  const { createAnalysis, saving: savingToDatabase } = useMarketAnalysis();

  const analysisOptions = [
    { value: 'trend', label: 'Trend Analysis', icon: TrendingUp },
    { value: 'pattern', label: 'Pattern Analysis', icon: BarChart3 }
  ];

  // Asset type mapping helper
  const mapAssetType = (assetName: string): 'Stock' | 'Crypto' | 'Forex' | 'Commodity' | 'Index' => {
    const name = assetName.toLowerCase();
    
    if (name.includes('btc') || name.includes('eth') || name.includes('crypto') || 
        name.includes('usdt') || name.includes('bnb') || name.includes('ada') ||
        name.includes('sol') || name.includes('doge')) {
      return 'Crypto';
    }
    
    if (name.includes('eur') || name.includes('usd') || name.includes('gbp') || 
        name.includes('jpy') || name.includes('forex') || name.includes('/')) {
      return 'Forex';
    }
    
    if (name.includes('gold') || name.includes('silver') || name.includes('oil') || 
        name.includes('gas') || name.includes('wheat') || name.includes('corn')) {
      return 'Commodity';
    }
    
    if (name.includes('s&p') || name.includes('nasdaq') || name.includes('dow') || 
        name.includes('index') || name.includes('spy') || name.includes('qqq')) {
      return 'Index';
    }
    
    return 'Stock';
  };

  // NEW: Helper function to capture chart image
  const captureChartImage = async (): Promise<string> => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Screenshot capture only works in browser environment');
      }

      // Wait a moment to ensure any dialogs are closed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Method 1: Try to use the browser's native screenshot API if available
      let base64Image;
      
      try {
        // Use getDisplayMedia to capture screen
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          console.log('📸 Requesting screen capture...');
          
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              mediaSource: 'screen',
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            }
          });

          console.log('✅ Screen capture permission granted, capturing frame...');

          // Create video element to capture frame
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          // Wait for video to load and a brief moment for any dialogs to disappear
          await new Promise((resolve) => {
            video.onloadedmetadata = () => {
              // Wait an additional moment after video loads to ensure dialogs are gone
              setTimeout(resolve, 1000);
            };
          });

          // Create canvas and capture frame
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);

          // Stop the stream immediately after capture
          stream.getTracks().forEach(track => track.stop());

          // Convert to base64
          base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          console.log('✅ Screen capture completed successfully');
        } else {
          throw new Error('Screen capture not supported');
        }
      } catch (screenCaptureError) {
        console.warn('Screen capture failed, trying alternative method:', screenCaptureError);
        
        // Method 2: Alternative approach using html2canvas with better configuration
        const chartContainer = container.current;
        if (!chartContainer) {
          throw new Error('Chart container not found');
        }

        console.log('📸 Using html2canvas as fallback...');

        // Hide any potential overlay elements before capture
        const overlayElements = document.querySelectorAll('[data-testid*="dialog"], .modal, .popup, .overlay, [class*="share"], [class*="dialog"]');
        const hiddenElements: { element: HTMLElement; originalDisplay: string }[] = [];
        
        overlayElements.forEach(el => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style.display !== 'none') {
            hiddenElements.push({
              element: htmlEl,
              originalDisplay: htmlEl.style.display
            });
            htmlEl.style.display = 'none';
          }
        });

        // Wait a moment for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 300));

        const html2canvas = (await import('html2canvas')).default;
        
        // Try to capture with different settings
        const canvas = await html2canvas(document.body, {
          useCORS: true,
          allowTaint: true,
          scale: 0.5,
          logging: false,
          backgroundColor: '#1a1a1a',
          foreignObjectRendering: false,
          removeContainer: false,
          imageTimeout: 30000,
          ignoreElements: (element) => {
            // Ignore common dialog/modal/overlay elements
            const className = element.className || '';
            const id = element.id || '';
            return (
              className.includes('modal') ||
              className.includes('dialog') ||
              className.includes('overlay') ||
              className.includes('popup') ||
              className.includes('share') ||
              id.includes('dialog') ||
              element.getAttribute('role') === 'dialog' ||
              element.getAttribute('aria-modal') === 'true'
            );
          },
          onclone: (clonedDoc) => {
            // Remove any elements that might cause issues in the cloned document
            const iframes = clonedDoc.querySelectorAll('iframe');
            iframes.forEach(iframe => {
              const placeholder = clonedDoc.createElement('div');
              placeholder.style.width = iframe.offsetWidth + 'px';
              placeholder.style.height = iframe.offsetHeight + 'px';
              placeholder.style.backgroundColor = '#2d3748';
              placeholder.style.display = 'flex';
              placeholder.style.alignItems = 'center';
              placeholder.style.justifyContent = 'center';
              placeholder.style.color = 'white';
              placeholder.style.fontSize = '16px';
              placeholder.textContent = 'TradingView Chart';
              iframe.parentNode?.replaceChild(placeholder, iframe);
            });

            // Remove dialog/modal elements from cloned document
            const dialogElements = clonedDoc.querySelectorAll('[data-testid*="dialog"], .modal, .popup, .overlay, [class*="share"], [class*="dialog"], [role="dialog"], [aria-modal="true"]');
            dialogElements.forEach(el => el.remove());
          }
        });

        // Restore hidden elements
        hiddenElements.forEach(({ element, originalDisplay }) => {
          element.style.display = originalDisplay;
        });

        // Convert canvas to base64
        base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        console.log('✅ html2canvas capture completed successfully');
      }

      // Validate that we have a proper image
      if (!base64Image || base64Image.length < 1000) {
        throw new Error('Failed to capture a valid chart image');
      }
      
      return base64Image;
    } catch (error) {
      console.error('Error capturing chart image:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !container.current) return;

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

    return () => {
      if (container.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isAuthenticated]);

  // Authentication checks - simple like your profile
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-gray-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-semibold text-white mb-2">
              Please Sign In
            </h1>

            {/* Description */}
            <p className="text-gray-400 mb-6">
              Sign in to view charts and generate trading analysis
            </p>

          
          </div>
        </div>
      </div>
    );
  }

  const generateSignal = async () => {
    setIsGenerating(true);
    
    // Reset completion states when generating new signal
    setIsSaved(false);
    setIsPosted(false);
    setSaveStatus('');
    setBlockchainStatus('');
    setTradeStatus('');
    setCapturedChartImage(null); // Reset captured image

    try {
      console.log('📸 Capturing chart image...');
      
      // Capture the chart image and store it in state
      const base64Image = await captureChartImage();
      setCapturedChartImage(base64Image); // Store in state for later use
      
      console.log('✅ Chart image captured and stored in state');
      
      setSignals([])
      
      const GEMINI_MODEL = 'gemini-2.0-flash-exp';
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: selectedAnalysis === "trend" ? 
                  "You are a professional trading chart analyzer. Examine this trading chart image carefully. Your primary goal is to identify if one of the following specific trading strategies is clearly present and actionable:\n\n1. **EMA Crossover:** (e.g., a shorter-period EMA like 9 or 20 crossing a longer-period EMA like 21 or 50). Note the EMAs involved if identifiable from the chart's indicators.\n2. **Support/Resistance Bounce with Candlestick Confirmation:** (e.g., price testing a clear horizontal support or resistance level and forming a distinct reversal candlestick pattern like a Pin Bar, Engulfing, Hammer, or Shooting Star). Note the S/R level and the candlestick pattern.\n3. **Bollinger Band Squeeze Breakout:** (Bollinger Bands narrow significantly, indicating a \"squeeze,\" then price breaks out decisively above the upper band or below the lower band).\n\nIf one of these three strategies is identified, populate the JSON accordingly. If multiple seem to apply, choose the most dominant or clearest one.\n\nRespond ONLY with a valid JSON object containing these fields:\n`{ \"assetName\": \"Name or ticker symbol of the asset shown\", \"assetType\": \"Stock, Crypto, Forex, or Commodity\", \"patternName\": \"One of: 'EMA Crossover', 'Support/Resistance Bounce with Candlestick Confirmation', 'Bollinger Band Squeeze Breakout', or if none of these are clearly present, 'None of the specified strategies identified'\", \"sentiment\": \"Bullish or Bearish (based on the identified strategy's typical implication)\", \"confidence\": 85, \"description\": \"Brief description of how the identified strategy is manifesting on the chart. If 'None of the specified strategies identified', explain why or what else is observed.\", \"recommendation\": \"Buy, Sell, Hold, or Unknown (based on the strategy's signal)\", \"recommendationReason\": \"Brief explanation for the recommendation tied directly to the rules/logic of the identified strategy (e.g., 'Fast EMA crossed above Slow EMA', 'Bullish pin bar at support', 'Breakout above Bollinger Band after squeeze').\", \"priceTargets\": { \"resistance\": 175.50, \"support\": 142.30, \"target\": 185.00, \"entry\": 150.25, \"exit\": 182.75, \"stopLoss\": 145.50 }, \"riskReward\": 2.5, \"timestamp\": \"2025-05-10T14:30:00Z\", \"indicators\": [ { \"name\": \"RSI\", \"value\": \"65\", \"interpretation\": \"Bullish momentum building\" } ] }`\nFor the \"priceTargets\" sub-object, resistance is a general key resistance level visible on the chart, or next logical target for a long position based on the strategy; support is a general key support level visible on the chart, or next logical target for a short position based on the strategy; target is a specific price target based on the strategy's typical expectation (e.g., next S/R, measured move, or fixed R:R); entry is the recommended entry point according to the identified strategy's rules (e.g., close of breakout candle, open of next candle after confirmation); exit is the recommended take profit point for the strategy; and stopLoss is the stop loss level according to the identified strategy's rules (e.g., below swing low/EMA for crossover, beyond S/R or candle extreme for bounce, other side of squeeze for BB breakout).\nFor the \"riskReward\" field, it should be the calculated Risk-reward ratio: (exit - entry) / (entry - stopLoss) for long, or (entry - exit) / (stopLoss - entry) for short. If not calculable, set to null or 0.\nFor the \"indicators\" array, list indicators that are *key* to the identified strategy. For example, for EMA Crossover: `[ { \"name\": \"Fast EMA\", \"value\": \"e.g., 20-period\", \"interpretation\": \"Crossed above Slow EMA indicating bullish momentum\" }, { \"name\": \"Slow EMA\", \"value\": \"e.g., 50-period\", \"interpretation\": \"Currently below Fast EMA\" } ]`. For S/R Bounce: `[ { \"name\": \"Support Level\", \"value\": \"e.g., 1.1200\", \"interpretation\": \"Price tested and bounced from this level\" }, { \"name\": \"Candlestick Pattern\", \"value\": \"e.g., Bullish Pin Bar\", \"interpretation\": \"Indicates buying pressure at support\" } ]`. For Bollinger Band Squeeze Breakout: `[ { \"name\": \"Bollinger Bands\", \"value\": \"e.g., (20, 2)\", \"interpretation\": \"Squeeze identified, price broke above upper band\" } ]`. If 'None of the specified strategies identified', list any visible standard indicators and their readings.\n\nIf the chart is unclear, you cannot confidently identify the asset, or none of the three specified strategies are clearly present, still return a complete JSON. In such cases, set `patternName` to \"None of the specified strategies identified\" or \"Unknown\" if even that is unclear. Set other unidentifiable or inapplicable fields to \"Unknown\", null, or reasonable defaults (e.g., confidence low, recommendation \"Hold\" or \"Unknown\"). Include any uncertainty in the `description` field.\n\nThe response must be ONLY the JSON object with no additional text."
                  :
                  "You are a professional trading chart analyzer. Examine this trading chart image carefully and identify the asset/stock/cryptocurrency being displayed and any technical patterns present. Respond ONLY with a valid JSON object containing these fields:\n\n{\n  \"assetName\": \"Name or ticker symbol of the asset shown\",\n  \"assetType\": \"Stock, Crypto, Forex, or Commodity\",\n  \"patternName\": \"Name of the pattern you identified\",\n  \"sentiment\": \"Bullish or Bearish\",\n  \"confidence\": 85, // Confidence percentage (number between 1-100)\n  \"description\": \"Brief description of what this pattern indicates\",\n  \"recommendation\": \"Buy\", // Must be one of: Buy, Sell, Hold, or Unknown\n  \"recommendationReason\": \"Brief explanation for the buy/sell/hold recommendation\",\n  \"priceTargets\": {\n    \"resistance\": 175.50, // Key resistance level\n    \"support\": 142.30, // Key support level\n    \"target\": 185.00, // Price target based on the pattern\n    \"entry\": 150.25, // Recommended entry point\n    \"exit\": 182.75, // Recommended exit point\n    \"stopLoss\": 145.50 // Stop loss level to minimize risk\n  },\n  \"riskReward\": 2.5, // Risk-reward ratio (potential profit / potential loss)\n  \"timestamp\": \"2025-05-10T14:30:00Z\", // Current time when analysis was performed\n  \"indicators\": [\n    {\n      \"name\": \"RSI\",\n      \"value\": \"65\",\n      \"interpretation\": \"Bullish momentum building\"\n    },\n    {\n      \"name\": \"MACD\",\n      \"value\": \"Positive crossover\",\n      \"interpretation\": \"Confirming uptrend\"\n    }\n  ]\n}\n\nIf the chart is unclear or you cannot confidently identify the asset or pattern, still return a complete JSON but set the unidentifiable fields (like assetName) to \"Unknown\" and include the uncertainty in the description field. The response must be ONLY the JSON object with no additional text."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 1,
          maxOutputTokens: 8192,
        }
      };

      const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
      }

      const geminiData = await geminiResponse.json();
      console.log("Raw Gemini API Response:", JSON.stringify(geminiData, null, 2));
      
      // Extract text from Gemini response
      let fullText = '';
      
      if (geminiData.candidates && geminiData.candidates.length > 0) {
        const candidate = geminiData.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          for (const part of candidate.content.parts) {
            if (part.text) {
              fullText += part.text;
            }
          }
        }
      }
      
      if (!fullText) {
        throw new Error('No response received from Gemini API');
      }

      console.log("Extracted text from Gemini:", fullText);

      // Parse the JSON response from Gemini
      let parsedSignal;
      try {
        // Clean the response text (remove any markdown formatting or extra text)
        const cleanedText = fullText.replace(/```json\n?|\n?```/g, '').trim();
        
        // Find JSON object in the response
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in Gemini response');
        }
        
        parsedSignal = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (!parsedSignal.assetName || !parsedSignal.patternName) {
          throw new Error('Invalid signal data received from Gemini');
        }
        
        // Ensure timestamp is current
        parsedSignal.timestamp = new Date().toISOString();
        
        // Validate and fix price targets if needed
        if (parsedSignal.priceTargets) {
          Object.keys(parsedSignal.priceTargets).forEach(key => {
            if (typeof parsedSignal.priceTargets[key] === 'string') {
              parsedSignal.priceTargets[key] = parseFloat(parsedSignal.priceTargets[key]) || 0;
            }
          });
        }
        
        // Ensure confidence is a number
        if (typeof parsedSignal.confidence === 'string') {
          parsedSignal.confidence = parseInt(parsedSignal.confidence) || 0;
        }
        
        // Ensure riskReward is a number
        if (typeof parsedSignal.riskReward === 'string') {
          parsedSignal.riskReward = parseFloat(parsedSignal.riskReward) || 0;
        }
        
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        console.error('Raw response:', fullText);
        throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
      }

      // Set the parsed signal
      setSignals([parsedSignal]);
      setIsGenerating(false);
      
    } catch (error) {
      console.error('Error generating signal:', error);
      setIsGenerating(false);
      
      // Reset captured image on error
      setCapturedChartImage(null);
      
      // Show error to user
      alert(`Error generating signal: ${error.message}`);
    }
  };

  const saveAnalysis = async () => {
  if (signals.length === 0) return;
  
  setIsSaving(true);
  setSaveStatus('');
  
  try {
    // Use the captured image from state instead of re-capturing
    let chartImageBase64 = capturedChartImage;
    
    // If for some reason we don't have a captured image, try to capture one
    if (!chartImageBase64) {
      console.log('⚠️ No captured image found in state, capturing new one...');
      try {
        chartImageBase64 = await captureChartImage();
        setCapturedChartImage(chartImageBase64);
      } catch (imageError) {
        console.warn('⚠️ Failed to capture chart image:', imageError);
      }
    } else {
      console.log('✅ Using previously captured chart image from state');
    }

    // First save the analysis as before
    const analysisData = {
      asset_name: signals[0].assetName || 'Unknown Asset',
      asset_type: mapAssetType(signals[0].assetName || 'Stock'),
      pattern_name: signals[0].patternName || 'Technical Analysis',
      sentiment: signals[0].sentiment || 'Neutral',
      confidence: signals[0].confidence || 75,
      description: signals[0].description || '',
      recommendation: signals[0].recommendation || 'Hold',
      recommendation_reason: signals[0].recommendationReason || 'Based on technical analysis',
      price_targets: signals[0].priceTargets || {},
      risk_reward: signals[0].riskReward || null,
      indicators: signals[0].indicators || [],
      chart_image_base64: chartImageBase64,
      analysis_timestamp: signals[0].timestamp || new Date().toISOString(),
      tags: [selectedAnalysis, 'Gemini AI']
    };

    console.log('💾 Saving analysis to database...');
    
    // Save to database using the hook
    const savedAnalysis = await createAnalysis(analysisData);
    
    if (savedAnalysis) {
      setIsSaved(true);
      setSaveStatus(`Analysis saved to database! ID: ${savedAnalysis.id}`);
      
      // Store the analysis ID for use in trading signal
      setSavedSignalId(savedAnalysis.id);
      
      setTimeout(() => setSaveStatus(''), 5000);
    }
    
  } catch (error) {
    console.error('❌ Error saving analysis:', error);
    setSaveStatus(`Failed to save analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    setTimeout(() => setSaveStatus(''), 5000);
  } finally {
    setIsSaving(false);
  }
};

const addToBlockchain = async () => {
  if (signals.length === 0 || !isSaved || !savedSignalId) return;
  
  setIsAddingToBlockchain(true);
  setBlockchainStatus('');
  
  try {
    // First, save the trading signal to the database
    console.log('📊 Creating trading signal in database...');
    
    const tradingSignalData = {
      analysis_id: savedSignalId,
      asset_name: signals[0].assetName || 'Unknown Asset',
      asset_type: mapAssetType(signals[0].assetName || 'Stock'),
      pattern_name: signals[0].patternName || 'Technical Analysis',
      recommendation: signals[0].recommendation || 'Hold',
      sentiment: signals[0].sentiment || 'Neutral',
      confidence: signals[0].confidence || 75,
      entry_price: signals[0].priceTargets?.entry || 0,
      exit_price: signals[0].priceTargets?.exit || null,
      take_profit: signals[0].priceTargets?.target || null,
      stop_loss: signals[0].priceTargets?.stopLoss || null,
      reason: signals[0].recommendationReason || 'Based on technical analysis',
      signal_created_at: signals[0].timestamp || new Date().toISOString(),
      enabled: false // Will be enabled after blockchain confirmation
    };

    // Get session token for API call
    const { supabaseUser } = useAuth();
    const session = supabaseUser?.session;
    
    if (!session) {
      throw new Error('No valid session found');
    }

    // Save trading signal to database
    const response = await fetch('/api/trading-signals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.stringify(session)}`
      },
      body: JSON.stringify(tradingSignalData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save trading signal');
    }

    const { signal: savedTradingSignal } = await response.json();
    console.log('✅ Trading signal saved to database:', savedTradingSignal.id);

    // Now create the signal on blockchain using the database ID
    console.log('🔗 Creating signal on blockchain...');
    
    const blockchainResult = await createSignalOnBlockchain(savedTradingSignal.id);
    
    if (blockchainResult.success) {
      setIsPosted(true);
      setBlockchainSignalId(blockchainResult.signalId || 'N/A');
      setBlockchainStatus(`Signal posted to blockchain! TX: ${blockchainResult.txHash}`);
      
      // Update the trading signal to enabled after successful blockchain creation
      if (blockchainResult.signalId) {
        await fetch('/api/trading-signals', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.stringify(session)}`
          },
          body: JSON.stringify({
            signal_id: savedTradingSignal.id,
            enabled: true,
            blockchain_signal_id: blockchainResult.signalId
          })
        });
      }
      
      setTimeout(() => setBlockchainStatus(''), 10000);
    } else {
      throw new Error(blockchainResult.error || 'Failed to create signal on blockchain');
    }
    
  } catch (error) {
    console.error('Error adding to blockchain:', error);
    setBlockchainStatus(`Failed to add to blockchain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    setTimeout(() => setBlockchainStatus(''), 5000);
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
              AI Signal Generator
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
              {isGenerating ? 'Analyzing Chart...' : 'Generate AI Signal'}
            </button>

            {/* NEW: Image Capture Status */}
            {capturedChartImage && (
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle size={16} />
                  Chart image captured and ready for saving
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Signal Results */}
        {signals.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-gray-700">
            {/* Header with Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-green-400" />
                AI Analysis Results
              </h2>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Save Analysis Button */}
                <button
                  onClick={saveAnalysis}
                  disabled={isSaving || savingToDatabase || isSaved}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isSaved
                      ? 'bg-green-700 text-green-200 cursor-default'
                      : (isSaving || savingToDatabase)
                      ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                      : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105 shadow-lg'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle size={18} />
                      Saved to Database
                    </>
                  ) : (isSaving || savingToDatabase) ? (
                    <>
                      <Download size={18} className="animate-spin" />
                      {savingToDatabase ? 'Saving to Database...' : 'Saving Analysis...'}
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
  disabled={isAddingToBlockchain || isCreatingSignal || !isSaved || isPosted}
  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
    isPosted
      ? 'bg-orange-700 text-orange-200 cursor-default'
      : !isSaved
      ? 'bg-gray-500 cursor-not-allowed text-gray-400'
      : (isAddingToBlockchain || isCreatingSignal)
      ? 'bg-gray-600 cursor-not-allowed text-gray-400'
      : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white transform hover:scale-105 shadow-lg'
  }`}
  title={!isSaved ? 'Save analysis first to post signal' : ''}
>
  {isPosted ? (
    <>
      <CheckCircle size={18} />
      Posted to Blockchain
    </>
  ) : (isAddingToBlockchain || isCreatingSignal) ? (
    <>
      <Link size={18} className="animate-pulse" />
      {isCreatingSignal ? 'Creating on Blockchain...' : 'Posting...'}
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
                    saveStatus.includes('saved') 
                      ? 'bg-green-500/20 border border-green-500 text-green-400' 
                      : 'bg-red-500/20 border border-red-500 text-red-400'
                  }`}>
                    <CheckCircle size={16} />
                    {saveStatus}
                  </div>
                )}
                {blockchainError && (
                 <div className="mb-4">
                <div className="p-3 rounded-lg flex items-center gap-2 bg-red-500/20 border border-red-500 text-red-400">
                 <AlertCircle size={16} />
                Blockchain Error: {blockchainError}
              </div>
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
                        <span className={`font-semibold ${signal.sentiment === 'Bullish' ? 'text-green-400' : signal.sentiment === 'Bearish' ? 'text-red-400' : 'text-yellow-400'}`}>
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
                      <span className="text-white font-mono">${signal.priceTargets?.entry || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target:</span>
                      <span className="text-green-400 font-mono">${signal.priceTargets?.target || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stop Loss:</span>
                      <span className="text-red-400 font-mono">${signal.priceTargets?.stopLoss || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Support:</span>
                      <span className="text-blue-400 font-mono">${signal.priceTargets?.support || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Resistance:</span>
                      <span className="text-orange-400 font-mono">${signal.priceTargets?.resistance || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-600">
                      <span className="text-gray-400">Risk/Reward:</span>
                      <span className="text-white font-semibold">{signal.riskReward ? `${signal.riskReward}:1` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Technical Indicators */}
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h4 className="font-semibold text-white mb-3">Technical Indicators</h4>
                  <div className="space-y-3">
                    {signal.indicators?.map((indicator, idx) => (
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
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-gray-500 text-xs">
                        Generated: {new Date(signal.timestamp).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 text-purple-400 text-xs">
                        <Zap size={12} />
                        <span>Powered by Gemini AI</span>
                      </div>
                    </div>
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