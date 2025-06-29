import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface UserProfile {
  name: string
  username: string
  avatar_url?: string
  verified: boolean
  tier: 'Basic' | 'Premium' | 'Pro' | 'Elite'
  location?: string
  bio?: string
}

interface TradingSignal {
  id: string
  user_id: string
  analysis_id?: string
  asset_name: string
  asset_type: 'Stock' | 'Crypto' | 'Forex' | 'Commodity' | 'Index'
  pattern_name: string
  recommendation: 'Buy' | 'Sell' | 'Hold'
  sentiment: 'Bullish' | 'Bearish' | 'Neutral'
  confidence: number
  entry_price: number
  exit_price?: number
  take_profit?: number
  stop_loss?: number
  actual_closed_price?: number
  status: 'Open' | 'Closed' | 'Cancelled' | 'Expired'
  reason: string
  actual_return_percentage?: number
  signal_created_at: string
  signal_closed_at?: string
  created_at: string
  updated_at: string
  enabled: boolean
  blockchain_signal_id?: string
  user_profile?: UserProfile
}

interface UseTradingSignalsResult {
  signals: TradingSignal[]
  loading: boolean
  saving: boolean
  error: string | null
  
  createTradingSignal: (signalData: Partial<TradingSignal>) => Promise<TradingSignal | null>
  updateTradingSignal: (signalId: string, updates: Partial<TradingSignal>) => Promise<TradingSignal | null>
  fetchTradingSignals: (filters?: { 
    status?: string; 
    asset_type?: string; 
    limit?: number; 
    offset?: number;
    user_only?: boolean;
  }) => Promise<void>
  
  fetchMySignals: (filters?: { 
    status?: string; 
    asset_type?: string; 
    limit?: number; 
    offset?: number;
  }) => Promise<void>
  loadMoreSignals: (filters?: { 
    status?: string; 
    asset_type?: string; 
    limit?: number;
    user_only?: boolean;
  }) => Promise<void>
  closeTradingSignal: (signalId: string, closingPrice?: number) => Promise<TradingSignal | null>
  cancelTradingSignal: (signalId: string) => Promise<TradingSignal | null>
  expireTradingSignal: (signalId: string) => Promise<TradingSignal | null>
  refreshSignals: () => Promise<void>
  clearSignals: () => void
  clearError: () => void
  
  getSignalById: (signalId: string) => TradingSignal | undefined
  getSignalsByStatus: (status: 'Open' | 'Closed' | 'Cancelled' | 'Expired') => TradingSignal[]
  getSignalsByAssetType: (assetType: 'Stock' | 'Crypto' | 'Forex' | 'Commodity' | 'Index') => TradingSignal[]
  getSignalsByRecommendation: (recommendation: 'Buy' | 'Sell' | 'Hold') => TradingSignal[]
  getPortfolioStats: () => {
    totalSignals: number
    openSignals: number
    closedSignals: number
    cancelledSignals: number
    avgConfidence: number
    winRate: number
    avgReturn: number
    totalReturn: number
    bestSignal: TradingSignal | null
    worstSignal: TradingSignal | null
    byAssetType: Record<string, number>
    byRecommendation: Record<string, number>
    closedWithReturns: number
    winningSignals: number
  }
}

export const useTradingSignals = (): UseTradingSignalsResult => {
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { isAuthenticated } = useAuth()

  // Fixed auth headers function
  const getAuthHeaders = async () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw new Error(`Session error: ${error.message}`)
      }
      
      if (session?.access_token && session?.refresh_token) {
        const sessionData = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          user: session.user
        }
        headers['Authorization'] = `Bearer ${JSON.stringify(sessionData)}`
        return headers
      } else {
        throw new Error('No valid session found')
      }
    } catch (err) {
      console.error('Auth headers error:', err)
      throw err
    }
  }

  // Fixed fetchTradingSignals function
  const fetchTradingSignals = useCallback(async (filters?: { 
    status?: string; 
    asset_type?: string; 
    limit?: number; 
    offset?: number;
    user_only?: boolean;
  }) => {
    if (!isAuthenticated) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const headers = await getAuthHeaders()

      // Build query parameters
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.asset_type) params.append('asset_type', filters.asset_type)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())
      if (filters?.user_only) params.append('user_only', 'true')

      const url = `/api/trading-signals?${params.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch trading signals`)
      }

      const responseData = await response.json()
      const fetchedSignals = responseData.signals || []
      
      if (filters?.offset === 0 || !filters?.offset) {
        setSignals(fetchedSignals)
      } else {
        setSignals(prev => [...prev, ...fetchedSignals])
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trading signals'
      setError(errorMessage)
      console.error('Error fetching trading signals:', err)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // Create a new trading signal
  const createTradingSignal = useCallback(async (signalData: Partial<TradingSignal>): Promise<TradingSignal | null> => {
    if (!isAuthenticated) {
      setError('User not authenticated')
      return null
    }

    setSaving(true)
    setError(null)

    try {
      const headers = await getAuthHeaders()

      const response = await fetch('/api/trading-signals', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(signalData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create trading signal`)
      }

      const { signal } = await response.json()
      setSignals(prev => [signal, ...prev])
      return signal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create trading signal'
      setError(errorMessage)
      console.error('Error creating trading signal:', err)
      return null
    } finally {
      setSaving(false)
    }
  }, [isAuthenticated])

  // Update an existing trading signal
  const updateTradingSignal = useCallback(async (signalId: string, updates: Partial<TradingSignal>): Promise<TradingSignal | null> => {
    if (!isAuthenticated) {
      setError('User not authenticated')
      return null
    }

    setSaving(true)
    setError(null)

    try {
      const headers = await getAuthHeaders()

      const response = await fetch('/api/trading-signals', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          signal_id: signalId,
          ...updates
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update trading signal`)
      }

      const { signal } = await response.json()
      setSignals(prev => prev.map(s => s.id === signalId ? signal : s))
      return signal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update trading signal'
      setError(errorMessage)
      console.error('Error updating trading signal:', err)
      return null
    } finally {
      setSaving(false)
    }
  }, [isAuthenticated])

  // Convenience method to fetch only user's own signals
  const fetchMySignals = useCallback(async (filters?: { 
    status?: string; 
    asset_type?: string; 
    limit?: number; 
    offset?: number;
  }) => {
    return fetchTradingSignals({
      ...filters,
      user_only: true
    })
  }, [fetchTradingSignals])

  // Load more signals (pagination)
  const loadMoreSignals = useCallback(async (filters?: { 
    status?: string; 
    asset_type?: string; 
    limit?: number;
    user_only?: boolean;
  }) => {
    if (loading) return

    const currentOffset = signals.length
    await fetchTradingSignals({
      ...filters,
      offset: currentOffset
    })
  }, [signals.length, loading, fetchTradingSignals])

  // Close a trading signal with optional closing price
  const closeTradingSignal = useCallback(async (signalId: string, closingPrice?: number): Promise<TradingSignal | null> => {
    const updates: Partial<TradingSignal> = {
      status: 'Closed',
      signal_closed_at: new Date().toISOString()
    }

    if (closingPrice !== undefined) {
      updates.actual_closed_price = closingPrice
    }

    return updateTradingSignal(signalId, updates)
  }, [updateTradingSignal])

  // Cancel a trading signal
  const cancelTradingSignal = useCallback(async (signalId: string): Promise<TradingSignal | null> => {
    return updateTradingSignal(signalId, {
      status: 'Cancelled',
      signal_closed_at: new Date().toISOString()
    })
  }, [updateTradingSignal])

  // Mark a signal as expired
  const expireTradingSignal = useCallback(async (signalId: string): Promise<TradingSignal | null> => {
    return updateTradingSignal(signalId, {
      status: 'Expired',
      signal_closed_at: new Date().toISOString()
    })
  }, [updateTradingSignal])

  // Get signal by ID
  const getSignalById = useCallback((signalId: string): TradingSignal | undefined => {
    return signals.find(signal => signal.id === signalId)
  }, [signals])

  // Get signals by status
  const getSignalsByStatus = useCallback((status: 'Open' | 'Closed' | 'Cancelled' | 'Expired'): TradingSignal[] => {
    return signals.filter(signal => signal.status === status)
  }, [signals])

  // Get signals by asset type
  const getSignalsByAssetType = useCallback((assetType: 'Stock' | 'Crypto' | 'Forex' | 'Commodity' | 'Index'): TradingSignal[] => {
    return signals.filter(signal => signal.asset_type === assetType)
  }, [signals])

  // Get signals by recommendation
  const getSignalsByRecommendation = useCallback((recommendation: 'Buy' | 'Sell' | 'Hold'): TradingSignal[] => {
    return signals.filter(signal => signal.recommendation === recommendation)
  }, [signals])

  // Calculate portfolio statistics
  const getPortfolioStats = useCallback(() => {
    const totalSignals = signals.length
    const openSignals = signals.filter(s => s.status === 'Open').length
    const closedSignals = signals.filter(s => s.status === 'Closed').length
    const cancelledSignals = signals.filter(s => s.status === 'Cancelled').length
    
    const avgConfidence = totalSignals > 0 
      ? signals.reduce((sum, signal) => sum + signal.confidence, 0) / totalSignals 
      : 0

    const closedWithReturns = signals.filter(s => 
      s.status === 'Closed' && 
      s.actual_return_percentage !== null && 
      s.actual_return_percentage !== undefined
    )
    
    const winningSignals = closedWithReturns.filter(s => s.actual_return_percentage! > 0)
    const winRate = closedWithReturns.length > 0 
      ? (winningSignals.length / closedWithReturns.length) * 100 
      : 0

    const avgReturn = closedWithReturns.length > 0
      ? closedWithReturns.reduce((sum, signal) => sum + (signal.actual_return_percentage || 0), 0) / closedWithReturns.length
      : 0

    const totalReturn = closedWithReturns.reduce((sum, signal) => sum + (signal.actual_return_percentage || 0), 0)

    const bestSignal = closedWithReturns.length > 0
      ? closedWithReturns.reduce((best, current) => 
          (current.actual_return_percentage || 0) > (best.actual_return_percentage || 0) ? current : best
        )
      : null

    const worstSignal = closedWithReturns.length > 0
      ? closedWithReturns.reduce((worst, current) => 
          (current.actual_return_percentage || 0) < (worst.actual_return_percentage || 0) ? current : worst
        )
      : null

    const byAssetType = signals.reduce((acc, signal) => {
      acc[signal.asset_type] = (acc[signal.asset_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byRecommendation = signals.reduce((acc, signal) => {
      acc[signal.recommendation] = (acc[signal.recommendation] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalSignals,
      openSignals,
      closedSignals,
      cancelledSignals,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      avgReturn: Math.round(avgReturn * 100) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100,
      bestSignal,
      worstSignal,
      byAssetType,
      byRecommendation,
      closedWithReturns: closedWithReturns.length,
      winningSignals: winningSignals.length
    }
  }, [signals])

  // Clear all signals from state
  const clearSignals = useCallback(() => {
    setSignals([])
  }, [])

  // Refresh signals
  const refreshSignals = useCallback(() => {
    return fetchTradingSignals()
  }, [fetchTradingSignals])

  // Clear error state
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    signals,
    loading,
    saving,
    error,
    
    createTradingSignal,
    updateTradingSignal,
    fetchTradingSignals,
    
    fetchMySignals,
    loadMoreSignals,
    closeTradingSignal,
    cancelTradingSignal,
    expireTradingSignal,
    refreshSignals,
    clearSignals,
    clearError,
    
    getSignalById,
    getSignalsByStatus,
    getSignalsByAssetType,
    getSignalsByRecommendation,
    getPortfolioStats
  }
}