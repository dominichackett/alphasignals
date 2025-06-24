// components/SimpleSignInPrompt.tsx
'use client'
import React from 'react';
import { Lock, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SimpleSignInPrompt = () => {
  const { signInWithSupabase, loading, error } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
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
          Sign in to view charts and trading analysis
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Sign In Button */}
        <button
          onClick={signInWithSupabase}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            loading
              ? 'bg-gray-700 cursor-not-allowed text-gray-400'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </button>
      </div>
    </div>
  );
};

export default SimpleSignInPrompt;