// hooks/useMarketAnalysis.ts
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface PriceTargets {
  resistance?: number | null
  support?: number | null
  target?: number | null
  entry?: number | null
  exit?: number | null
  stopLoss?: number | null
}

interface TechnicalIndicator {
  name: string
  value: string
  interpretation: string
}

interface MarketAnalysis {
  id: string
  user_id: string
  asset_name: string
  asset_type: 'Stock' | 'Crypto' | 'Forex' | 'Commodity' | 'Index'
  pattern_name: string
  sentiment: 'Bullish' | 'Bearish' | 'Neutral'
  confidence: number
  description: string
  recommendation: 'Buy' | 'Sell' | 'Hold'
  recommendation_reason: string
  price_targets: PriceTargets
  risk_reward?: number | null
  chart_image_url?: string | null
  indicators: TechnicalIndicator[]
  analysis_timestamp: string
  created_at: string
  updated_at: string
  status: 'active' | 'expired' | 'closed'
  tags: string[]
}

interface CreateAnalysisData {
  asset_name: string
  asset_type: 'Stock' | 'Crypto' | 'Forex' | 'Commodity' | 'Index'
  pattern_name: string
  sentiment: 'Bullish' | 'Bearish' | 'Neutral'
  confidence: number
  description: string
  recommendation: 'Buy' | 'Sell' | 'Hold'
  recommendation_reason: string
  price_targets: PriceTargets
  risk_reward?: number | null
  indicators: TechnicalIndicator[]
  chart_image_base64?: string
  analysis_timestamp?: string
  tags?: string[]
}

interface AnalysisFilters {
  asset_type?: string
  sentiment?: string
  status?: string
  limit?: number
  offset?: number
}

interface AnalysisPagination {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export const useMarketAnalysis = () => {
  const [analyses, setAnalyses] = useState<MarketAnalysis[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<AnalysisPagination>({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  })
  const { isAuthenticated } = useAuth()

  // Get auth headers with session
  const getAuthHeaders = async () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      headers['Authorization'] = `Bearer ${JSON.stringify(session)}`
    }
    
    return headers
  }

  // Fetch analyses with filters
  const fetchAnalyses = async (filters: AnalysisFilters = {}) => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.asset_type) params.append('asset_type', filters.asset_type)
      if (filters.sentiment) params.append('sentiment', filters.sentiment)
      if (filters.status) params.append('status', filters.status)
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.offset) params.append('offset', filters.offset.toString())

      const headers = await getAuthHeaders()

      const response = await fetch(`/api/market-analysis?${params.toString()}`, {
        method: 'GET',
        headers,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch analyses`)
      }

      const data = await response.json()
      
      if (filters.offset === 0) {
        // Replace existing data for fresh fetch
        setAnalyses(data.analyses)
      } else {
        // Append for pagination
        setAnalyses(prev => [...prev, ...data.analyses])
      }
      
      setPagination(data.pagination)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analyses')
      console.error('Fetch analyses error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create new analysis
  const createAnalysis = async (analysisData: CreateAnalysisData): Promise<MarketAnalysis | null> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated')
    }

    try {
      setSaving(true)
      setError(null)

      const headers = await getAuthHeaders()

      const response = await fetch('/api/market-analysis', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(analysisData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to save analysis`)
      }

      const data = await response.json()
      
      // Add new analysis to the beginning of the list
      setAnalyses(prev => [data.analysis, ...prev])
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1
      }))

      return data.analysis

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save analysis'
      setError(errorMessage)
      console.error('Create analysis error:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Update existing analysis
  const updateAnalysis = async (id: string, updateData: Partial<CreateAnalysisData>): Promise<MarketAnalysis | null> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated')
    }

    try {
      setSaving(true)
      setError(null)

      const headers = await getAuthHeaders()

      const response = await fetch('/api/market-analysis', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ id, ...updateData }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update analysis`)
      }

      const data = await response.json()
      
      // Update analysis in the list
      setAnalyses(prev => 
        prev.map(analysis => 
          analysis.id === id ? data.analysis : analysis
        )
      )

      return data.analysis

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update analysis'
      setError(errorMessage)
      console.error('Update analysis error:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  // Load more analyses (pagination)
  const loadMore = async (filters: AnalysisFilters = {}) => {
    if (!pagination.hasMore || loading) return

    await fetchAnalyses({
      ...filters,
      offset: pagination.offset + pagination.limit
    })
  }

  // Refresh analyses
  const refresh = async (filters: AnalysisFilters = {}) => {
    await fetchAnalyses({ ...filters, offset: 0 })
  }

  // Get analysis by ID
  const getAnalysisById = (id: string): MarketAnalysis | undefined => {
    return analyses.find(analysis => analysis.id === id)
  }

  // Get analyses by filters (client-side filtering)
  const getFilteredAnalyses = (filters: Partial<MarketAnalysis>): MarketAnalysis[] => {
    return analyses.filter(analysis => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null) return true
        return analysis[key as keyof MarketAnalysis] === value
      })
    })
  }

  // Get analysis statistics
  const getStatistics = () => {
    const total = analyses.length
    const byRecommendation = analyses.reduce((acc, analysis) => {
      acc[analysis.recommendation] = (acc[analysis.recommendation] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const bySentiment = analyses.reduce((acc, analysis) => {
      acc[analysis.sentiment] = (acc[analysis.sentiment] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byAssetType = analyses.reduce((acc, analysis) => {
      acc[analysis.asset_type] = (acc[analysis.asset_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const averageConfidence = total > 0 
      ? analyses.reduce((sum, analysis) => sum + analysis.confidence, 0) / total 
      : 0

    return {
      total,
      byRecommendation,
      bySentiment,
      byAssetType,
      averageConfidence: Math.round(averageConfidence * 100) / 100
    }
  }

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalyses()
    }
  }, [isAuthenticated])

  return {
    // Data
    analyses,
    pagination,
    
    // States
    loading,
    saving,
    error,
    
    // Actions
    fetchAnalyses,
    createAnalysis,
    updateAnalysis,
    loadMore,
    refresh,
    
    // Utils
    getAnalysisById,
    getFilteredAnalyses,
    getStatistics,
    
    // Error handling
    setError
  }
}