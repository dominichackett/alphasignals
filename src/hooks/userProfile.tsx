import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface ProfileData {
  id: string
  user_id: string
  name: string
  username: string
  ethaddress: string // Fixed typo: was 'ethaddres'
  email: string
  phone?: string
  location?: string
  bio?: string
  avatar_url?: string
  joined_at: string
  verified: boolean
  tier: string
  referral_code: string
  notification_preferences: {
    email: boolean
    push: boolean
    sms: boolean
    tradeAlerts: boolean
    marketNews: boolean
    weeklyReports: boolean
  }
  privacy_settings: {
    profileVisible: boolean
    tradesVisible: boolean
    followersVisible: boolean
    portfolioVisible: boolean
  }
  app_preferences: {
    currency: string
    timezone: string
    theme: string
  }
  created_at: string
  updated_at: string
}

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [linkingEthAddress, setLinkingEthAddress] = useState(false)
  const { isAuthenticated } = useAuth()

  // Get auth headers with session
  const getAuthHeaders = async () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Get current session with debugging
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('=== Session Debug ===')
    console.log('Session exists:', !!session)
    console.log('Session error:', error)
    console.log('Access token exists:', !!session?.access_token)
    console.log('User exists:', !!session?.user)
    console.log('User email:', session?.user?.email)
    console.log('==================')
    
    if (session) {
      headers['Authorization'] = `Bearer ${JSON.stringify(session)}`
      console.log('Authorization header set')
    } else {
      console.log('No session found, header not set')
    }
    
    return headers
  }

  // Fetch profile data
  const fetchProfile = async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const headers = await getAuthHeaders()

      const response = await fetch('/api/profile', {
        method: 'GET',
        headers,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch profile`)
      }

      const data = await response.json()
      setProfile(data.profile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Update profile data
  const updateProfile = async (updatedData: Partial<ProfileData>) => {
    if (!profile) return false

    try {
      setError(null)

      const headers = await getAuthHeaders()

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(updatedData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update profile`)
      }

      const data = await response.json()
      setProfile(data.profile)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      console.error('Profile update error:', err)
      return false
    }
  }

  // Link ETH address (using POST method with action)
  const linkEthAddress = async (ethAddress: string) => {
    if (!profile) return false

    // Basic validation
    if (!ethAddress || !/^0x[a-fA-F0-9]{40}$/.test(ethAddress)) {
      setError('Invalid ETH address format')
      return false
    }

    try {
      setLinkingEthAddress(true)
      setError(null)

      const headers = await getAuthHeaders()

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          action: 'link_eth_address',
          ethaddress: ethAddress
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to link ETH address`)
      }

      const data = await response.json()
      setProfile(data.profile)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link ETH address')
      console.error('ETH address linking error:', err)
      return false
    } finally {
      setLinkingEthAddress(false)
    }
  }

  // Update ETH address (using PUT method)
  const updateEthAddress = async (ethAddress: string) => {
    if (!profile) return false

    // Basic validation
    if (ethAddress && !/^0x[a-fA-F0-9]{40}$/.test(ethAddress)) {
      setError('Invalid ETH address format')
      return false
    }

    return await updateProfile({
      ethaddress: ethAddress
    })
  }

  // Remove ETH address
  const removeEthAddress = async () => {
    return await updateProfile({
      ethaddress: ''
    })
  }

  // Upload avatar
  const uploadAvatar = async (file: File) => {
    if (!profile) return false

    try {
      setUploadingAvatar(true)
      setError(null)

      const formData = new FormData()
      formData.append('avatar', file)

      // For form data, don't set Content-Type header, but include auth
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = {}
      if (session) {
        headers['Authorization'] = `Bearer ${JSON.stringify(session)}`
      }

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to upload avatar`)
      }

      const data = await response.json()
      setProfile(data.profile)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
      console.error('Avatar upload error:', err)
      return false
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Update notification preferences
  const updateNotificationPreferences = async (preferences: Partial<ProfileData['notification_preferences']>) => {
    if (!profile) return false

    const updatedPreferences = {
      ...profile.notification_preferences,
      ...preferences
    }

    return await updateProfile({
      notification_preferences: updatedPreferences
    })
  }

  // Update privacy settings
  const updatePrivacySettings = async (settings: Partial<ProfileData['privacy_settings']>) => {
    if (!profile) return false

    const updatedSettings = {
      ...profile.privacy_settings,
      ...settings
    }

    return await updateProfile({
      privacy_settings: updatedSettings
    })
  }

  // Update app preferences
  const updateAppPreferences = async (preferences: Partial<ProfileData['app_preferences']>) => {
    if (!profile) return false

    const updatedPreferences = {
      ...profile.app_preferences,
      ...preferences
    }

    return await updateProfile({
      app_preferences: updatedPreferences
    })
  }

  // Update basic profile info
  const updateBasicInfo = async (info: {
    name?: string
    username?: string
    phone?: string
    location?: string
    bio?: string
  }) => {
    return await updateProfile(info)
  }

  // Check if ETH address is linked
  const hasEthAddress = () => {
    return !!(profile?.ethaddress && profile.ethaddress.trim() !== '')
  }

  // Get formatted ETH address
  const getFormattedEthAddress = () => {
    if (!profile?.ethaddress) return ''
    const address = profile.ethaddress
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Validate profile completeness
  const getProfileCompleteness = () => {
    if (!profile) return 0

    const fields = [
      'name',
      'username', 
      'email',
      'ethaddress',
      'bio',
      'location',
      'avatar_url'
    ]

    const completed = fields.filter(field => {
      const value = profile[field as keyof ProfileData]
      return value && String(value).trim() !== ''
    }).length

    return Math.round((completed / fields.length) * 100)
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  // Refresh profile
  const refreshProfile = async () => {
    await fetchProfile()
  }

  useEffect(() => {
    fetchProfile()
  }, [isAuthenticated])

  return {
    // State
    profile,
    loading,
    error,
    uploadingAvatar,
    linkingEthAddress,
    
    // Basic operations
    fetchProfile,
    updateProfile,
    refreshProfile,
    clearError,
    setError,
    
    // ETH address operations
    linkEthAddress,
    updateEthAddress,
    removeEthAddress,
    hasEthAddress,
    getFormattedEthAddress,
    
    // Specific update methods
    uploadAvatar,
    updateBasicInfo,
    updateNotificationPreferences,
    updatePrivacySettings,
    updateAppPreferences,
    
    // Utility methods
    getProfileCompleteness,
  }
}