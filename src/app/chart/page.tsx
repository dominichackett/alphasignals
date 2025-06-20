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

// Helper function to compress images for ElizaOS
function compressImage(canvas, quality = 0.3) {
  return canvas.toDataURL('image/jpeg', quality).split(',')[1];
}

// Helper function to extract values from text using regex
function extractValue(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

// Create fallback signal if parsing fails
function createFallbackSignal(responseText, analysisType) {
  return {
    assetName: "Chart Analysis",
    assetType: "Unknown", 
    patternName: `${analysisType} Analysis`,
    sentiment: "Neutral",
    confidence: 75,
    description: `ElizaOS Agent Response: ${responseText.substring(0, 200)}...`,
    recommendation: "Hold",
    recommendationReason: "Fallback response due to parsing error",
    priceTargets: {
      resistance: null,
      support: null, 
      target: null,
      entry: null,
      exit: null,
      stopLoss: null
    },
    riskReward: null,
    timestamp: new Date().toISOString(),
    indicators: [
      {
        name: "Status",
        value: "Parsing Error",
        interpretation: "Response received but structure parsing failed"
      }
    ]
  };
}

// Enhanced response parser for ElizaOS responses
function parseElizaResponse(responseText, analysisType) {
  try {
    console.log('🔍 Parsing ElizaOS response:', responseText.substring(0, 200));
    
    // Try to find and parse JSON first
    const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
    
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Successfully parsed JSON from response:', parsed);
        
        if (parsed.assetName || parsed.patternName || parsed.sentiment) {
          return {
            ...parsed,
            timestamp: new Date().toISOString(),
            confidence: Number(parsed.confidence) || 75,
            riskReward: Number(parsed.riskReward) || null,
            // Ensure priceTargets are numbers
            priceTargets: parsed.priceTargets ? {
              resistance: Number(parsed.priceTargets.resistance) || null,
              support: Number(parsed.priceTargets.support) || null,
              target: Number(parsed.priceTargets.target) || null,
              entry: Number(parsed.priceTargets.entry) || null,
              exit: Number(parsed.priceTargets.exit) || null,
              stopLoss: Number(parsed.priceTargets.stopLoss) || null,
            } : {
              resistance: null,
              support: null,
              target: null,
              entry: null,
              exit: null,
              stopLoss: null
            }
          };
        }
      } catch (jsonError) {
        console.log('⚠️ JSON parsing failed, falling back to text parsing:', jsonError);
      }
    }
    
    // Fallback: create structured response from text analysis
    console.log('📝 Creating structured response from text analysis');
    
    return {
      assetName: extractValue(responseText, /asset[:\s]+([^\n,]+)/i) || "Chart Analysis",
      assetType: extractValue(responseText, /type[:\s]+([^\n,]+)/i) || "Unknown",
      patternName: extractValue(responseText, /pattern[:\s]+([^\n,]+)/i) || `${analysisType} Analysis`,
      sentiment: extractValue(responseText, /sentiment[:\s]+([^\n,]+)/i) || "Neutral",
      confidence: Number(extractValue(responseText, /confidence[:\s]+(\d+)/i)) || 75,
      description: responseText.substring(0, 300) + (responseText.length > 300 ? '...' : ''),
      recommendation: extractValue(responseText, /recommendation[:\s]+([^\n,]+)/i) || "Hold",
      recommendationReason: "Analysis completed by ElizaOS trading agent",
      priceTargets: {
        resistance: Number(extractValue(responseText, /resistance[:\s]+[\$]?([0-9.,]+)/i)?.replace(',', '')) || null,
        support: Number(extractValue(responseText, /support[:\s]+[\$]?([0-9.,]+)/i)?.replace(',', '')) || null,
        target: Number(extractValue(responseText, /target[:\s]+[\$]?([0-9.,]+)/i)?.replace(',', '')) || null,
        entry: Number(extractValue(responseText, /entry[:\s]+[\$]?([0-9.,]+)/i)?.replace(',', '')) || null,
        exit: Number(extractValue(responseText, /exit[:\s]+[\$]?([0-9.,]+)/i)?.replace(',', '')) || null,
        stopLoss: Number(extractValue(responseText, /stop.?loss[:\s]+[\$]?([0-9.,]+)/i)?.replace(',', '')) || null,
      },
      riskReward: Number(extractValue(responseText, /risk.?reward[:\s]+([0-9.]+)/i)) || null,
      timestamp: new Date().toISOString(),
      indicators: [
        {
          name: "ElizaOS Agent Analysis",
          value: "Completed",
          interpretation: "Chart analyzed by AI trading agent"
        }
      ]
    };
    
  } catch (error) {
    console.error('💥 Error parsing response:', error);
    return createFallbackSignal(responseText, analysisType);
  }
}

// Function to parse text-only responses when no JSON is found
function parseTextResponseToSignal(responseText, analysisType) {
  console.log('📄 Parsing text-only response to create signal structure');
  
  // Look for common trading terms and extract information
  const bullishWords = ['bullish', 'buy', 'long', 'upward', 'positive', 'strong'];
  const bearishWords = ['bearish', 'sell', 'short', 'downward', 'negative', 'weak'];
  
  const lowerText = responseText.toLowerCase();
  let sentiment = 'Neutral';
  
  if (bullishWords.some(word => lowerText.includes(word))) {
    sentiment = 'Bullish';
  } else if (bearishWords.some(word => lowerText.includes(word))) {
    sentiment = 'Bearish';
  }
  
  return {
    assetName: "Chart Analysis",
    assetType: "Unknown",
    patternName: analysisType === "trend" ? "Trend Analysis" : "Technical Analysis",
    sentiment: sentiment,
    confidence: 80,
    description: responseText.substring(0, 400) + (responseText.length > 400 ? '...' : ''),
    recommendation: sentiment === 'Bullish' ? 'Buy' : sentiment === 'Bearish' ? 'Sell' : 'Hold',
    recommendationReason: "Based on ElizaOS agent text analysis",
    priceTargets: {
      resistance: null,
      support: null,
      target: null,
      entry: null,
      exit: null,
      stopLoss: null
    },
    riskReward: null,
    timestamp: new Date().toISOString(),
    indicators: [
      {
        name: "Text Analysis",
        value: "Completed",
        interpretation: `Detected ${sentiment.toLowerCase()} sentiment from agent response`
      }
    ]
  };
}

const generateSignal = async () => {
  setIsGenerating(true);
  
  // Reset completion states when generating new signal
  setIsSaved(false);
  setIsPosted(false);
  setSaveStatus('');
  setBlockchainStatus('');
  setTradeStatus('');

  try {
    console.log('🚀 Starting signal generation process...');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Screenshot capture only works in browser environment');
    }

    // === IMAGE CAPTURE SECTION ===
    let base64Image;
    let includeImage = false;
    
    try {
      console.log('📸 Starting image capture process...');
      
      // Method 1: Try to use the browser's native screenshot API if available
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          console.log('🖥️ Using native screen capture API...');
          
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              mediaSource: 'screen'
            }
          });

          // Create video element to capture frame
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          // Wait for video to load
          await new Promise((resolve) => {
            video.onloadedmetadata = resolve;
          });

          // Create canvas and capture frame
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);

          // Stop the stream
          stream.getTracks().forEach(track => track.stop());

          // Convert to base64 with aggressive compression for ElizaOS
          base64Image = compressImage(canvas, 0.3);
          console.log('✅ Screen capture successful');
          
        } else {
          throw new Error('Screen capture not supported');
        }
      } catch (screenCaptureError) {
        console.warn('⚠️ Screen capture failed, trying alternative method:', screenCaptureError);
        
        // Method 2: Alternative approach using html2canvas
        const chartContainer = container?.current;
        if (!chartContainer) {
          throw new Error('Chart container not found');
        }

        console.log('📄 Using html2canvas fallback...');
        
        const html2canvas = (await import('html2canvas')).default;
        
        // Try to capture with settings optimized for ElizaOS (very small file size)
        const canvas = await html2canvas(document.body, {
          useCORS: true,
          allowTaint: true,
          scale: 0.3, // Very small scale for ElizaOS limits
          logging: false,
          backgroundColor: '#1a1a1a',
          foreignObjectRendering: false,
          removeContainer: false,
          imageTimeout: 15000,
          width: 600, // Smaller limit for ElizaOS
          height: 400, // Smaller limit for ElizaOS
          onclone: (clonedDoc) => {
            // Remove any elements that might cause issues
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
              iframe.parentNode.replaceChild(placeholder, iframe);
            });
          }
        });

        // Convert canvas to base64 with aggressive compression for ElizaOS  
        base64Image = compressImage(canvas, 0.3);
        console.log('✅ html2canvas capture successful');
      }

      // Validate that we have a proper image and compress if needed
      if (!base64Image || base64Image.length < 1000) {
        throw new Error('Failed to capture a valid chart image');
      }
      
      // Check image size and compress EXTREMELY aggressively for ElizaOS
      const imageSizeKB = (base64Image.length * 3) / 4 / 1024;
      console.log(`📊 Initial image size: ${imageSizeKB.toFixed(2)} KB`);
      
      if (imageSizeKB > 50) { // Very aggressive - target under 50KB for ElizaOS Express limits
        console.log('🗜️ Image too large for ElizaOS Express body-parser, compressing extremely...');
        
        // Create a temporary canvas to compress the image much more
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Create image from base64
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = `data:image/jpeg;base64,${base64Image}`;
        });
        
        // Very aggressively reduce dimensions for ElizaOS Express
        const maxDimension = 300;
        let { width, height } = img;
        
        if (width > maxDimension || height > maxDimension) {
          const scale = Math.min(maxDimension / width, maxDimension / height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        tempCtx.drawImage(img, 0, 0, width, height);
        
        // Extremely aggressive compression for ElizaOS Express
        base64Image = tempCanvas.toDataURL('image/jpeg', 0.1).split(',')[1]; // 10% quality
        
        const newSizeKB = (base64Image.length * 3) / 4 / 1024;
        console.log(`🗜️ Extremely compressed image size: ${newSizeKB.toFixed(2)} KB`);
        
        // If still too large, try even more extreme compression
        if (newSizeKB > 30) {
          console.log('🔥 Still too large, maximum compression...');
          
          // Even smaller dimensions
          const ultraMaxDimension = 200;
          if (width > ultraMaxDimension || height > ultraMaxDimension) {
            const ultraScale = Math.min(ultraMaxDimension / width, ultraMaxDimension / height);
            width = Math.floor(width * ultraScale);
            height = Math.floor(height * ultraScale);
            
            tempCanvas.width = width;
            tempCanvas.height = height;
            tempCtx.drawImage(img, 0, 0, width, height);
          }
          
          base64Image = tempCanvas.toDataURL('image/jpeg', 0.05).split(',')[1]; // 5% quality
          const ultraSizeKB = (base64Image.length * 3) / 4 / 1024;
          console.log(`🔥 Maximum compressed image size: ${ultraSizeKB.toFixed(2)} KB`);
        }
      }
      
      // Final size check - if still too large, we'll send without image
      const finalSizeKB = (base64Image.length * 3) / 4 / 1024;
      const estimatedPayloadKB = finalSizeKB + 5; // Add some overhead for JSON
      
      console.log(`📈 Final image size: ${finalSizeKB.toFixed(2)} KB, estimated payload: ${estimatedPayloadKB.toFixed(2)} KB`);
      
      // If payload is still likely too large for Express (>800KB), send without image
      includeImage = estimatedPayloadKB < 800;
      
      if (!includeImage) {
        console.log('⚠️ Image still too large for ElizaOS Express limits, will send text-only analysis request');
      } else {
        console.log('✅ Image size acceptable for ElizaOS transmission');
      }
      
    } catch (imageError) {
      console.warn('📸 Image capture failed:', imageError);
      includeImage = false;
    }
    
    // Reset signals before generating new one
    setSignals([]);

    // === ELIZA AGENT INTEGRATION ===
    console.log('🤖 Starting ElizaOS agent integration...');
    
    // Use single API endpoint
    const elizaApiUrl = process.env.NEXT_PUBLIC_ELIZA_API_URL || 'http://localhost:3000';
    const endpoint = `${elizaApiUrl}/api/messaging/central-channels/f2d40929-878c-4494-8c21-d7609acea4e7/messages`;

    // Prepare message
    const analysisMessage = includeImage ? 
      (selectedAnalysis === "trend" ? 
        "Analyze this trading chart for trend patterns including EMA crossovers, support/resistance bounces, and Bollinger Band squeezes. Please provide a detailed technical analysis with specific price targets and risk management recommendations." :
        "Perform comprehensive technical analysis on this trading chart. Identify patterns, support/resistance levels, and provide detailed trading recommendations with price targets.") :
      `Perform ${selectedAnalysis === "trend" ? 'trend-focused' : 'general'} technical analysis. I was unable to send the chart image due to size constraints, but please provide a template analysis showing what information you would typically extract from trading charts, including asset identification, pattern recognition, price targets, and trading recommendations.`;
const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

  const requestBody = {
  channelId: "f2d40929-878c-4494-8c21-d7609acea4e7", // Your actual channel ID
  server_id: "00000000-0000-0000-0000-000000000000",
  author_id: `a9308c87-8a1c-4d75-aff6-d5a390b467cb`, // Changed from senderId
  content: analysisMessage, // Changed from text
  source_type: "eliza_gui", // Changed from source

  metadata: {
    user_display_name: "Chart Analyst"
  },
  
    attachments: [{
      type: "image",
      contentType: "image/jpeg", 
      data: cleanBase64,
      name: `trading_chart_${Date.now()}.jpg`
    }]
  
};
   console.log(`Include image:${includeImage}`)
    console.log(`🌐 Calling endpoint: ${endpoint}`);
    
    // Calculate payload size
    const payloadString = JSON.stringify(requestBody);
    const payloadSizeKB = new Blob([payloadString]).size / 1024;
    console.log(`📦 Payload size: ${payloadSizeKB.toFixed(2)} KB`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add auth if needed
        // 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ELIZA_API_KEY}`,
      },
      body: payloadString,
    });

    console.log(`📊 Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('✅ SUCCESS! Received response from ElizaOS:', {
      responseKeys: Object.keys(responseData),
      hasText: !!(responseData.text || responseData.content?.text || responseData.message)
    });

    console.log("🎯 Raw ElizaOS Agent Response:", JSON.stringify(responseData, null, 2));
    
    // Enhanced response parsing to handle different ElizaOS response formats
    let responseText = '';
    let elizaData = responseData;
    
    console.log('🔍 Starting response parsing...');
    
    // Handle different possible response structures
    if (typeof elizaData === 'string') {
      responseText = elizaData;
      console.log('📝 Response is direct string');
    } else if (elizaData.response) {
      responseText = elizaData.response;
      console.log('📝 Found response in .response field');
    } else if (elizaData.content?.text) {
      responseText = elizaData.content.text;
      console.log('📝 Found response in .content.text field');
    } else if (elizaData.text) {
      responseText = elizaData.text;
      console.log('📝 Found response in .text field');
    } else if (elizaData.message) {
      responseText = elizaData.message;
      console.log('📝 Found response in .message field');
    } else if (elizaData.messages && Array.isArray(elizaData.messages)) {
      // Handle array of messages
      const lastMessage = elizaData.messages[elizaData.messages.length - 1];
      responseText = lastMessage.content?.text || lastMessage.text || lastMessage.message;
      console.log('📝 Found response in messages array');
    } else if (Array.isArray(elizaData)) {
      // Handle direct array response
      const lastItem = elizaData[elizaData.length - 1];
      responseText = lastItem.content?.text || lastItem.text || lastItem.message;
      console.log('📝 Found response in direct array');
    } else {
      // Try to find any text content in the response
      console.log('🔍 Searching for text content in complex response structure...');
      
      const findText = (obj, path = '') => {
        if (typeof obj === 'string') {
          console.log(`📝 Found string at path: ${path}`);
          return obj;
        }
        if (typeof obj !== 'object' || obj === null) return null;
        
        // First, look for common text field names
        for (const [key, value] of Object.entries(obj)) {
          if (key.includes('text') || key.includes('content') || key.includes('message') || key.includes('response')) {
            if (typeof value === 'string') {
              console.log(`📝 Found text in field: ${path}.${key}`);
              return value;
            }
            if (typeof value === 'object') {
              const found = findText(value, `${path}.${key}`);
              if (found) return found;
            }
          }
        }
        
        // Recursively search through all values
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'object') {
            const found = findText(value, `${path}.${key}`);
            if (found) return found;
          }
        }
        
        return null;
      };
      
      responseText = findText(elizaData) || JSON.stringify(elizaData);
      console.log('📝 Complex search completed');
    }
    
    if (!responseText) {
      throw new Error('No response text found in ElizaOS agent response');
    }

    console.log("📝 Extracted text from ElizaOS (first 500 chars):", responseText.substring(0, 500));

    // Enhanced signal parsing
    console.log('🔄 Starting signal parsing...');
    let parsedSignal = parseElizaResponse(responseText, selectedAnalysis);
    
    console.log('✅ Parsed signal:', {
      assetName: parsedSignal.assetName,
      sentiment: parsedSignal.sentiment,
      confidence: parsedSignal.confidence,
      recommendation: parsedSignal.recommendation
    });
    
    // Set the parsed signal
    setSignals([parsedSignal]);
    setIsGenerating(false);
    
    console.log('🎉 Signal generation completed successfully!');
    
  } catch (error) {
    console.error('💥 Error generating signal:', error);
    setIsGenerating(false);
    
    // Enhanced error reporting with debugging information
    const debugInfo = {
      timestamp: new Date().toISOString(),
      elizaUrl: process.env.NEXT_PUBLIC_ELIZA_API_URL || 'http://localhost:3000',
      analysisType: selectedAnalysis,
      includeImage: includeImage,
      errorMessage: error.message,
      errorStack: error.stack,
      userAgent: navigator.userAgent,
      windowLocation: window.location.href
    };
    
    console.error('🐛 Full debugging information:', debugInfo);
    
    const errorMessage = `Error generating signal: ${error.message}

🐛 Debug Information:
- ElizaOS URL: ${debugInfo.elizaUrl}
- Analysis type: ${debugInfo.analysisType}
- Include image: ${debugInfo.includeImage}
- Timestamp: ${debugInfo.timestamp}
- User Agent: ${debugInfo.userAgent.substring(0, 50)}...

Check browser console for detailed logs.`;
    
    alert(errorMessage);
    
    // Optionally create a fallback signal with error information
    const errorSignal = {
      assetName: "Error in Analysis", 
      assetType: "Unknown",
      patternName: "Error Pattern",
      sentiment: "Unknown",
      confidence: 0,
      description: `Error occurred during signal generation: ${error.message}`,
      recommendation: "Unknown",
      recommendationReason: "Analysis failed due to technical error",
      priceTargets: {
        resistance: null,
        support: null,
        target: null,
        entry: null,
        exit: null,
        stopLoss: null
      },
      riskReward: null,
      timestamp: new Date().toISOString(),
      indicators: [
        {
          name: "System Status",
          value: "Error",
          interpretation: error.message
        }
      ]
    };
    
    setSignals([errorSignal]);
  }
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










function extractSentiment(text) {
  const lower = text.toLowerCase();
  if (lower.includes('bullish') || lower.includes('buy') || lower.includes('long')) return 'Bullish';
  if (lower.includes('bearish') || lower.includes('sell') || lower.includes('short')) return 'Bearish';
  return 'Neutral';
}

function extractConfidence(text) {
  const match = text.match(/confidence[:\s]+(\d+)/i);
  return match ? parseInt(match[1]) : 75;
}

function extractRecommendation(text) {
  const lower = text.toLowerCase();
  if (lower.includes('buy') || lower.includes('long')) return 'Buy';
  if (lower.includes('sell') || lower.includes('short')) return 'Sell';
  return 'Hold';
}

function extractRecommendationReason(text) {
  // Look for sentences containing recommendation logic
  const sentences = text.split(/[.!?]/);
  for (const sentence of sentences) {
    if (sentence.toLowerCase().includes('because') || 
        sentence.toLowerCase().includes('due to') ||
        sentence.toLowerCase().includes('reason')) {
      return sentence.trim();
    }
  }
  return "Based on technical analysis";
}

function extractPriceTargets(text) {
  // Extract price levels from text
  const pricePattern = /\$?(\d+\.?\d*)/g;
  const prices = [];
  let match;
  
  while ((match = pricePattern.exec(text)) !== null) {
    const price = parseFloat(match[1]);
    if (price > 0) prices.push(price);
  }
  
  // Assign prices to targets (this is a simple heuristic)
  return {
    resistance: prices[0] || null,
    support: prices[1] || null,
    target: prices[2] || null,
    entry: prices[3] || null,
    exit: prices[4] || null,
    stopLoss: prices[5] || null
  };
}

function extractRiskReward(text) {
  const match = text.match(/risk[\/\s]*reward[:\s]*(\d+\.?\d*)/i);
  return match ? parseFloat(match[1]) : null;
}

function extractIndicators(text) {
  const indicators = [];
  const commonIndicators = ['RSI', 'MACD', 'EMA', 'SMA', 'Bollinger Bands', 'Volume'];
  
  for (const indicator of commonIndicators) {
    if (text.toLowerCase().includes(indicator.toLowerCase())) {
      indicators.push({
        name: indicator,
        value: "Detected",
        interpretation: `${indicator} mentioned in analysis`
      });
    }
  }
  
  if (indicators.length === 0) {
    indicators.push({
      name: "Technical Analysis",
      value: "Complete",
      interpretation: "Chart analyzed by ElizaOS agent"
    });
  }
  
  return indicators;
}

// Helper function to parse text response into structured signal
function parseTextResponseToSignal(responseText, analysisType) {
  // Extract key information from the text response
  const signal = {
    assetName: extractAssetName(responseText) || "Chart Analysis",
    assetType: extractAssetType(responseText) || "Unknown",
    patternName: extractPatternName(responseText, analysisType),
    sentiment: extractSentiment(responseText) || "Neutral",
    confidence: extractConfidence(responseText) || 75,
    description: responseText.substring(0, 300) + (responseText.length > 300 ? '...' : ''),
    recommendation: extractRecommendation(responseText) || "Hold",
    recommendationReason: extractRecommendationReason(responseText) || "Based on ElizaOS agent analysis",
    priceTargets: extractPriceTargets(responseText),
    riskReward: extractRiskReward(responseText),
    timestamp: new Date().toISOString(),
    indicators: extractIndicators(responseText)
  };
  
  return signal;
}

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