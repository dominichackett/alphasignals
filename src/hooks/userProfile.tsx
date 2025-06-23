import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface ProfileData {
  id: string
  user_id: string
  name: string
  username: string
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

  useEffect(() => {
    fetchProfile()
  }, [isAuthenticated])

  return {
    profile,
    loading,
    error,
    uploadingAvatar,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    updateNotificationPreferences,
    updatePrivacySettings,
    updateAppPreferences,
    setError
  }
}