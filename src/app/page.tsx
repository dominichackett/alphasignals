'use client'
import React from 'react';
import Header from '@/components/Header/Header';
const LitProtocolStyles = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      {/* Header Navigation */}
     <Header/>
      {/* Hero Section with Background Image */}
      <section 
        className="relative px-6 py-20 pt-32 overflow-hidden"
        style={{
          backgroundImage: 'url(/chart.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/75"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="block">Technical Trading Agent for</span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                 Stocks, Crypto and Forex
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
             Alpha Signals is the decentralized AI-powered platform for reading charts and generating trading signals across crypto, stocks, and forex.
Join the traders and builders leveraging intelligent analysis and a marketplace of signals to stay ahead of the markets.
            </p>
          </div>
        </div>
        
        {/* Background texture overlay */}
        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-purple-900/20 to-transparent pointer-events-none z-5"></div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Securing the Decentralized World
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                $154M+
              </div>
              <div className="text-gray-400 text-lg">Total Value Managed</div>
            </div>
            <div className="text-center space-y-4">
              <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                1.4M+
              </div>
              <div className="text-gray-400 text-lg">Total Wallets Managed</div>
            </div>
            <div className="text-center space-y-4">
              <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                30M+
              </div>
              <div className="text-gray-400 text-lg">Data Points Decrypted</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          
          {/* Agent Wallets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-4xl font-bold">Agent Wallets</h3>
              <p className="text-xl text-purple-300">
                Universal Accounts For User Controlled Automation
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Unlock true agent autonomy without sacrificing user control. 
                Define exactly what agents can do through user-delegated permissions 
                and policies enforced by Lit Actions.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Universal accounts for every chain and platform</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>User authorization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>On-chain, open source tools</span>
                </li>
              </ul>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
                Create Agent Wallets
              </button>
            </div>
            <div className="relative">
              <div className="w-full h-64 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-500/20"></div>
            </div>
          </div>

          {/* Interoperability */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="w-full h-64 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl border border-blue-500/20"></div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <h3 className="text-4xl font-bold">Interoperability</h3>
              <p className="text-xl text-blue-300">
                Program Private Keys
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Break down blockchain silos with programmable private keys for seamless 
                interoperability. Lit Actions allow you to embed immutable signing logic.
              </p>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Automate cross-chain liquidity</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Build secure, programmable vaults</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Unify disparate Web3 and Web2 systems</span>
                </li>
              </ul>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105">
                Build with Lit Actions
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Network Features */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-6xl mx-auto text-center space-y-16">
          <h2 className="text-4xl md:text-5xl font-bold">The Lit Network</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 p-6 rounded-xl bg-gray-900/50 border border-gray-700/50">
              <h3 className="text-2xl font-bold text-purple-300">Defense in Depth</h3>
              <p className="text-gray-300 leading-relaxed">
                Combines Threshold Multi-Party Computation (MPC) and Trusted 
                Execution Environments (TEE) to secure keys with multiple layers.
              </p>
            </div>
            
            <div className="space-y-4 p-6 rounded-xl bg-gray-900/50 border border-gray-700/50">
              <h3 className="text-2xl font-bold text-blue-300">Scalability</h3>
              <p className="text-gray-300 leading-relaxed">
                Deploy applications confidently on a globally distributed network 
                that scales horizontally without sacrificing security.
              </p>
            </div>
            
            <div className="space-y-4 p-6 rounded-xl bg-gray-900/50 border border-gray-700/50">
              <h3 className="text-2xl font-bold text-green-300">Orchestrate Any Secret</h3>
              <p className="text-gray-300 leading-relaxed">
                Manage any private key, credential, or sensitive data across 
                Web3, AI, cloud, and beyond with programmable signing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Integration Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <h3 className="text-2xl text-gray-400">Integrated with</h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="w-32 h-16 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="w-20 h-8 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LitProtocolStyles;