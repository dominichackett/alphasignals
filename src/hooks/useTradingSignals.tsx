import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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
}

interface UseTradingSignalsResult {
  signals: TradingSignal[]
  loading: boolean
  saving: boolean
  error: string | null
  createTradingSignal: (signalData: Partial<TradingSignal>) => Promise<TradingSignal | null>
  updateTradingSignal: (signalId: string, updates: Partial<TradingSignal>) => Promise<TradingSignal | null>
  fetchTradingSignals: (filters?: { status?: string; asset_type?: string; limit?: number; offset?: number }) => Promise<void>
  closeTradingSignal: (signalId: string, closingPrice?: number) => Promise<TradingSignal | null>
}

export const useTradingSignals = (): UseTradingSignalsResult => {
  const [signals, setSignals] = useState<TradingSignal[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { supabaseUser } = useAuth()

  // Get session token for API calls
  const getSessionToken = useCallback(() => {
    const session = supabaseUser?.session
    if (!session) {
      throw new Error('No valid session found')
    }
    return JSON.stringify(session)
  }, [supabaseUser])

  // Create a new trading signal
  const createTradingSignal = useCallback(async (signalData: Partial<TradingSignal>): Promise<TradingSignal | null> => {
    setSaving(true)
    setError(null)

    try {
      const sessionToken = getSessionToken()

      const response = await fetch('/api/trading-signals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(signalData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create trading signal')
      }

      const { signal } = await response.json()
      
      // Add to local state
      setSignals(prev => [signal, ...prev])
      
      return signal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error creating trading signal:', err)
      return null
    } finally {
      setSaving(false)
    }
  }, [getSessionToken])

  // Update an existing trading signal
  const updateTradingSignal = useCallback(async (signalId: string, updates: Partial<TradingSignal>): Promise<TradingSignal | null> => {
    setSaving(true)
    setError(null)

    try {
      const sessionToken = getSessionToken()

      const response = await fetch('/api/trading-signals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          signal_id: signalId,
          ...updates
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update trading signal')
      }

      const { signal } = await response.json()
      
      // Update local state
      setSignals(prev => prev.map(s => s.id === signalId ? signal : s))
      
      return signal
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error updating trading signal:', err)
      return null
    } finally {
      setSaving(false)
    }
  }, [getSessionToken])

  // Fetch trading signals
  const fetchTradingSignals = useCallback(async (filters?: { 
    status?: string; 
    asset_type?: string; 
    limit?: number; 
    offset?: number 
  }) => {
    setLoading(true)
    setError(null)

    try {
      const sessionToken = getSessionToken()

      // Build query parameters
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.asset_type) params.append('asset_type', filters.asset_type)
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const response = await fetch(`/api/trading-signals?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch trading signals')
      }

      const { signals: fetchedSignals } = await response.json()
      setSignals(fetchedSignals || [])
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Error fetching trading signals:', err)
    } finally {
      setLoading(false)
    }
  }, [getSessionToken])

  // Close a trading signal
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

  return {
    signals,
    loading,
    saving,
    error,
    createTradingSignal,
    updateTradingSignal,
    fetchTradingSignals,
    closeTradingSignal
  }
}