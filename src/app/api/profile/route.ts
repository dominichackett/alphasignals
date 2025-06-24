import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

async function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
    }
  )
}

// Get session from Authorization header
async function getSessionFromHeader(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const sessionToken = authHeader?.replace('Bearer ', '')
  
  if (!sessionToken) {
    return { session: null, error: 'No session token provided' }
  }

  try {
    const session = JSON.parse(sessionToken)
    return { session, error: null }
  } catch (parseError) {
    return { session: null, error: 'Invalid session token' }
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/profile called')
    
    const { session, error: sessionError } = await getSessionFromHeader(request)
    
    if (sessionError || !session) {
      return NextResponse.json({ error: sessionError || 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createSupabaseClient()
    
    // Set the session
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Authenticated user:', user.id)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Create default profile
        const defaultProfile = {
          user_id: user.id,
          name: user.user_metadata?.name || 'User',
          username: `user_${user.id.slice(0, 8)}`,
          email: user.email || '',
          ethaddress: '', // Fixed typo and set default empty string
          verified: false,
          tier: 'Basic',
          referral_code: `REF_${user.id.slice(0, 8)}`,
          notification_preferences: {
            email: true,
            push: true,
            sms: false,
            tradeAlerts: true,
            marketNews: true,
            weeklyReports: false
          },
          privacy_settings: {
            profileVisible: true,
            tradesVisible: false,
            followersVisible: true,
            portfolioVisible: false
          },
          app_preferences: {
            currency: 'USD',
            timezone: 'UTC',
            theme: 'light'
          }
        }

        console.log('Creating default profile for user:', user.id)

        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(defaultProfile)
          .select()
          .single()

        if (createError) {
          console.error('Profile creation error:', createError)
          return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
        }

        return NextResponse.json({ profile: newProfile })
      }
      
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/profile called')
    
    const { session, error: sessionError } = await getSessionFromHeader(request)
    
    if (sessionError || !session) {
      return NextResponse.json({ error: sessionError || 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createSupabaseClient()
    
    // Set the session
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Update data received:', Object.keys(body))

    const {
      name,
      username,
      phone,
      location,
      ethaddress, // Fixed typo: was 'ethaddres'
      bio,
      notification_preferences,
      privacy_settings,
      app_preferences
    } = body

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Basic profile fields
    if (name !== undefined) updateData.name = name
    if (username !== undefined) updateData.username = username
    if (phone !== undefined) updateData.phone = phone
    if (location !== undefined) updateData.location = location
    if (bio !== undefined) updateData.bio = bio
    if (ethaddress !== undefined) updateData.ethaddress = ethaddress // Fixed typo

    // JSON fields
    if (notification_preferences !== undefined) updateData.notification_preferences = notification_preferences
    if (privacy_settings !== undefined) updateData.privacy_settings = privacy_settings
    if (app_preferences !== undefined) updateData.app_preferences = app_preferences

    console.log('Updating profile for user:', user.id, 'with data:', Object.keys(updateData))

    // Check if username is unique (if being updated)
    if (username !== undefined) {
      const { data: existingUser, error: checkError } = await supabase
        .from('user_profiles')
        .select('id, user_id')
        .eq('username', username)
        .neq('user_id', user.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Username check error:', checkError)
        return NextResponse.json({ error: 'Failed to validate username' }, { status: 500 })
      }

      if (existingUser) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
    }

    // Check if ethaddress is unique (if being updated)
    if (ethaddress !== undefined && ethaddress !== '') {
      const { data: existingEthUser, error: ethCheckError } = await supabase
        .from('user_profiles')
        .select('id, user_id')
        .eq('ethaddress', ethaddress)
        .neq('user_id', user.id)
        .single()

      if (ethCheckError && ethCheckError.code !== 'PGRST116') {
        console.error('ETH address check error:', ethCheckError)
        return NextResponse.json({ error: 'Failed to validate ETH address' }, { status: 500 })
      }

      if (existingEthUser) {
        return NextResponse.json({ error: 'ETH address already linked to another account' }, { status: 400 })
      }
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      if (updateError.code === '23505') {
        // Handle unique constraint violations
        if (updateError.message.includes('username')) {
          return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
        }
        if (updateError.message.includes('ethaddress')) {
          return NextResponse.json({ error: 'ETH address already linked to another account' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Duplicate value detected' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    console.log('Profile updated successfully for user:', user.id)
    return NextResponse.json({ 
      profile: updatedProfile,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/profile called')
    
    const { session, error: sessionError } = await getSessionFromHeader(request)
    
    if (sessionError || !session) {
      return NextResponse.json({ error: sessionError || 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createSupabaseClient()
    
    // Set the session
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type')
    let body: any

    if (contentType?.includes('application/json')) {
      body = await request.json()
    } else if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      body = Object.fromEntries(formData.entries())
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
    }

    console.log('POST request from user:', user.id)
    
    // Handle specific POST operations here
    const { action, ...data } = body

    switch (action) {
      case 'link_eth_address':
        // Handle linking ETH address specifically
        const { ethaddress } = data
        
        if (!ethaddress) {
          return NextResponse.json({ error: 'ETH address is required' }, { status: 400 })
        }

        // Validate ETH address format (basic check)
        if (!/^0x[a-fA-F0-9]{40}$/.test(ethaddress)) {
          return NextResponse.json({ error: 'Invalid ETH address format' }, { status: 400 })
        }

        // Check if address is already linked
        const { data: existingEthUser, error: ethCheckError } = await supabase
          .from('user_profiles')
          .select('id, user_id')
          .eq('ethaddress', ethaddress)
          .neq('user_id', user.id)
          .single()

        if (ethCheckError && ethCheckError.code !== 'PGRST116') {
          console.error('ETH address check error:', ethCheckError)
          return NextResponse.json({ error: 'Failed to validate ETH address' }, { status: 500 })
        }

        if (existingEthUser) {
          return NextResponse.json({ error: 'ETH address already linked to another account' }, { status: 400 })
        }

        // Update profile with ETH address
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            ethaddress,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) {
          console.error('ETH address update error:', updateError)
          return NextResponse.json({ error: 'Failed to link ETH address' }, { status: 500 })
        }

        return NextResponse.json({ 
          success: true,
          profile: updatedProfile,
          message: 'ETH address linked successfully'
        })

      default:
        return NextResponse.json({ 
          success: true, 
          user: user.id,
          message: 'POST operation completed successfully'
        })
    }

  } catch (error) {
    console.error('Profile POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}