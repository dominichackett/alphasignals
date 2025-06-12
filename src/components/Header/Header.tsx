'use client'
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

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
            <a href="/signals" className="text-gray-300 hover:text-white transition-colors duration-200">
              Signals
            </a>
            
            {/* Account Dropdown */}
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
                      href="/mysignals" 
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                    >
                      My Signals
                    </a>
                     <a 
                      href="/mytrades" 
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
                    >
                      My Trades
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
           
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
              Sign In
            </button>
          </div>

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
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                Signals
              </a>
              
              {/* Mobile Account Section */}
              <div className="space-y-2">
                <span className="text-gray-400 text-sm font-medium">Account</span>
                <div className="pl-4 space-y-2">
                  <a href="#" className="block text-gray-300 hover:text-white transition-colors duration-200">
                    Charts
                  </a>
                  <a href="#" className="block text-gray-300 hover:text-white transition-colors duration-200">
                    My Signals
                  </a>
                </div>
              </div>
              
              <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">
                About
              </a>
              <div className="pt-4 border-t border-gray-800">
                <a href="#" className="block text-gray-300 hover:text-white transition-colors duration-200 mb-3">
                  Sign In
                </a>
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header;