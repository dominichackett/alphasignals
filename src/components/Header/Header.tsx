'use client'
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext"; // Your combined auth context
import { useWeb3Auth } from "@web3auth/modal/react";
import { useAccount } from "wagmi";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Use combined auth context
  const { 
    isAuthenticated, 
    loading: authLoading, 
    error: authError, 
    web3AuthUser, 
    supabaseUser, 
    signOut,
    signInWithSupabase
  } = useAuth();
  
  // Use base Web3Auth hook for status only
  const { web3Auth, isConnected: web3AuthConnected, status } = useWeb3Auth();
  
  const { address } = useAccount();

  // Check if Web3Auth is ready - it can be either 'ready' or properly connected with user
  const isWeb3AuthReady = status === 'ready' || (status === 'connected' && web3AuthUser);
  const isWeb3AuthConnected = status === 'connected' && web3AuthUser;
  const isBrokenConnection = status === 'connected' && !web3AuthUser;
  
  // Combine loading states
  const loading = authLoading;

  // Helper function to truncate address
  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Helper function to copy address to clipboard
  const copyAddress = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  

  // Handle connect - trigger Web3Auth modal
  const handleConnect = async () => {
    if (!web3Auth) {
      console.error('Web3Auth instance not available');
      return;
    }

    try {
      // If Web3Auth shows connected but no user, clear the session first
      if (status === 'connected' && !web3AuthUser) {
        await web3Auth.logout();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Now connect fresh
      await web3Auth.connect();
      
    } catch (error) {
      console.error('Web3Auth connection failed:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AS</span>
            </div>
            <span className="text-xl font-bold">Alpha Signals</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
             <a href="/" className="text-gray-300 hover:text-white transition-colors duration-200">
              Home
            </a>
          
            
            {/* Account Dropdown - Only show when fully authenticated */}
            {isAuthenticated && (
              <div className="relative group">
                <button 
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-1"
                  onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                  onMouseEnter={() => setIsAccountDropdownOpen(true)}
                >
                  <span>Account</span>
                  <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                       style={{ transform: isAccountDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isAccountDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
                    onMouseLeave={() => setIsAccountDropdownOpen(false)}
                  >
                    <div className="py-2">
                      <a 
                        href="/chart" 
                        className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                      >
                        Charts
                      </a>
                      <a 
                        href="/savedcharts" 
                        className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                      >
                        Saved Charts
                      </a>
                     
                        <a 
                        href="/profile" 
                        className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                      >
                        Profile
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* CTA Buttons - Sign In when not connected OR connection is broken */}
          {(!isAuthenticated && !isWeb3AuthConnected) || isBrokenConnection ? (
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={handleConnect}
                disabled={loading && !isBrokenConnection}
                className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && !isBrokenConnection ? 'Connecting...' : isBrokenConnection ? 'Reconnect' : !isWeb3AuthReady ? `Initializing... (${status})` : 'Sign In'}
              </button>
            </div>
          ) : null}

          {/* Show processing state when Web3Auth is connected but Supabase isn't ready */}
          {!isAuthenticated && isWeb3AuthConnected && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Completing sign in...</span>
              </div>
            </div>
          )}

          {/* Address and Sign Out when connected */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              {/* User Info Display */}
              <div className="flex items-center space-x-3">
                {/* User Avatar/Name */}
                {(web3AuthUser?.profileImage || web3AuthUser?.name) && (
                  <div className="flex items-center space-x-2">
                    {web3AuthUser?.profileImage && (
                      <img 
                        src={web3AuthUser.profileImage} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border border-gray-600"
                      />
                    )}
                    {web3AuthUser?.name && (
                      <span className="text-gray-300 text-sm">
                        {web3AuthUser.name}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Address Display */}
                <button 
                  onClick={copyAddress}
                  className="flex items-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-700 transition-all duration-200 cursor-pointer group"
                  title="Click to copy full address"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300 text-sm font-mono group-hover:text-white transition-colors">
                    {address ? truncateAddress(address) : 'Connected'}
                  </span>
                  {/* Copy Icon */}
                  <svg 
                    className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {copied ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    )}
                  </svg>
                </button>
              </div>
              
              {/* Sign Out Button */}
              <button 
                onClick={signOut}
                disabled={loading}
                className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <div className="flex flex-col space-y-4">
              <a href="/" className="text-gray-300 hover:text-white transition-colors duration-200">
                Home
              </a>
           
              
              {/* Mobile Account Section - Only show when authenticated */}
              {isAuthenticated && (
                <div className="space-y-2">
                  <span className="text-gray-400 text-sm font-medium">Account</span>
                  <div className="pl-4 space-y-2">
                    <a href="/chart" className="block text-gray-300 hover:text-white transition-colors duration-200">
                      Charts
                    </a>
                    <a href="/savedcharts" className="block text-gray-300 hover:text-white transition-colors duration-200">
                      Saved Charts
                    </a>
                   
                    <a href="/profile" className="block text-gray-300 hover:text-white transition-colors duration-200">
                      Profile
                    </a>
                  </div>
                </div>
              )}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-800">
                {(!isAuthenticated && !isWeb3AuthConnected) || isBrokenConnection ? (
                  <button 
                    onClick={handleConnect}
                    disabled={loading && !isBrokenConnection}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && !isBrokenConnection ? 'Connecting...' : isBrokenConnection ? 'Reconnect' : !isWeb3AuthReady ? `Initializing... (${status})` : 'Sign In'}
                  </button>
                ) : !isAuthenticated && isWeb3AuthConnected ? (
                  <div className="w-full flex items-center justify-center space-x-2 text-gray-300 py-3">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Completing sign in...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Mobile User Info */}
                    {web3AuthUser?.name && (
                      <div className="flex items-center space-x-2 px-3 py-2">
                        {web3AuthUser?.profileImage && (
                          <img 
                            src={web3AuthUser.profileImage} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full border border-gray-600"
                          />
                        )}
                        <span className="text-gray-300 text-sm">
                          {web3AuthUser.name}
                        </span>
                      </div>
                    )}
                    
                    {/* Mobile Address Display */}
                    <button 
                      onClick={copyAddress}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-800/50 hover:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-700 transition-all duration-200 cursor-pointer group"
                      title="Click to copy full address"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300 text-sm font-mono group-hover:text-white transition-colors">
                        {address ? truncateAddress(address) : 'Connected'}
                      </span>
                      {/* Copy Icon */}
                      <svg 
                        className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        {copied ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        )}
                      </svg>
                    </button>
                    
                    {/* Mobile Sign Out Button */}
                    <button 
                      onClick={signOut}
                      disabled={loading}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Signing Out...' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(authError || (!isWeb3AuthReady && status)) && (
          <div className="absolute top-full left-0 right-0 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 text-sm">
            {authError || `Web3Auth Status: ${status}`}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header;