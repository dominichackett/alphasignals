// app/api/trading-signals/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create service role client for admin operations
function createServiceSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
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
    
    // Validate session structure
    if (!session.access_token || !session.user?.id) {
      return { session: null, error: 'Invalid session structure' }
    }
    
    return { session, error: null }
  } catch (parseError) {
    return { session: null, error: 'Invalid session token' }
  }
}

// Verify user with Supabase
async function verifyUser(session: any) {
  const supabase = createServiceSupabaseClient()
  
  try {
    // Use service role to verify the user exists and token is valid
    const { data: user, error } = await supabase.auth.admin.getUserById(session.user.id)
    
    if (error || !user) {
      throw new Error('User verification failed')
    }
    
    return user.user
  } catch (error) {
    console.error('User verification error:', error)
    throw new Error('Invalid user session')
  }
}

// Check user tier
async function checkUserTier(userId: string) {
  const supabase = createServiceSupabaseClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('tier')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching user tier:', error)
    return false
  }

  return data && data.tier !== '' && data.tier !== null
}


// GET - Fetch trading signals with user profiles
export async function GET(request: NextRequest) {
  try {
    const { session, error: sessionError } = await getSessionFromHeader(request)
    
    if (sessionError || !session) {
      return NextResponse.json({ error: sessionError || 'Unauthorized' }, { status: 401 })
    }

    // Verify user exists
    const user = await verifyUser(session)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Check user tier
    const isTierValid = await checkUserTier(user.id)
    if (!isTierValid) {
      return NextResponse.json({ error: 'You do not have permission to view trading signals.' }, { status: 403 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const status = url.searchParams.get('status')
    const asset_type = url.searchParams.get('asset_type')
    const user_only = url.searchParams.get('user_only') === 'true'

    const supabase = createServiceSupabaseClient()

    // Build the query with user profile join
    let query = supabase
      .from('trading_signals')
      .select(`
        *,
        user_profile:user_profiles(
          name,
          username,
          avatar_url,
          verified,
          tier,
          location,
          bio
        )
      `)
      .eq('enabled', true)
      .order('signal_created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (user_only) {
      query = query.eq('user_id', user.id)
    }

    if (status) {
      query = query.eq('status', status)
    }
    if (asset_type) {
      query = query.eq('asset_type', asset_type)
    }

    const { data: signals, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching trading signals:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch trading signals' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('trading_signals')
      .select('*', { count: 'exact', head: true })
      .eq('enabled', true)

    if (user_only) {
      countQuery = countQuery.eq('user_id', user.id)
    }

    if (status) {
      countQuery = countQuery.eq('status', status)
    }
    if (asset_type) {
      countQuery = countQuery.eq('asset_type', asset_type)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error getting count:', countError)
    }

    return NextResponse.json({
      signals: signals || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Trading signals GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new trading signal
export async function POST(request: NextRequest) {
  try {
    const { session, error: sessionError } = await getSessionFromHeader(request)
    
    if (sessionError || !session) {
      return NextResponse.json({ error: sessionError || 'Unauthorized' }, { status: 401 })
    }

    // Verify user exists
    const user = await verifyUser(session)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Check user tier
    const isTierValid = await checkUserTier(user.id)
    if (!isTierValid) {
      return NextResponse.json({ error: 'You do not have permission to create trading signals.' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()

    const {
      analysis_id,
      asset_name,
      asset_type,
      pattern_name,
      recommendation,
      sentiment,
      confidence,
      entry_price,
      exit_price,
      take_profit,
      stop_loss,
      reason,
      signal_created_at
    } = body

    // Validate required fields
    if (!asset_name || !asset_type || !recommendation || !entry_price) {
      return NextResponse.json({ 
        error: 'Missing required fields: asset_name, asset_type, recommendation, entry_price' 
      }, { status: 400 })
    }

    // Validate enums
    const validAssetTypes = ['Stock', 'Crypto', 'Forex', 'Commodity', 'Index']
    const validRecommendations = ['Buy', 'Sell', 'Hold']
    const validSentiments = ['Bullish', 'Bearish', 'Neutral']

    if (!validAssetTypes.includes(asset_type)) {
      return NextResponse.json({ error: 'Invalid asset_type' }, { status: 400 })
    }
    if (!validRecommendations.includes(recommendation)) {
      return NextResponse.json({ error: 'Invalid recommendation' }, { status: 400 })
    }
    if (sentiment && !validSentiments.includes(sentiment)) {
      return NextResponse.json({ error: 'Invalid sentiment' }, { status: 400 })
    }

    // Prepare data for insertion
    const signalData = {
      user_id: user.id,
      analysis_id: analysis_id || null,
      asset_name,
      asset_type,
      pattern_name: pattern_name || '',
      recommendation,
      sentiment: sentiment || 'Neutral',
      confidence: parseInt(confidence) || 75,
      entry_price: parseFloat(entry_price),
      exit_price: exit_price ? parseFloat(exit_price) : null,
      take_profit: take_profit ? parseFloat(take_profit) : null,
      stop_loss: stop_loss ? parseFloat(stop_loss) : null,
      reason: reason || '',
      status: 'Open',
      signal_created_at: signal_created_at || new Date().toISOString(),
      enabled: true
    }

    const supabase = createServiceSupabaseClient()

    // Insert into database
    const { data: newSignal, error: insertError } = await supabase
      .from('trading_signals')
      .insert(signalData)
      .select(`
        *,
        user_profile:user_profiles(
          name,
          username,
          avatar_url,
          verified,
          tier,
          location,
          bio
        )
      `)
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save trading signal' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Trading signal saved successfully',
      signal: newSignal 
    })

  } catch (error) {
    console.error('Trading signal POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update existing trading signal
export async function PUT(request: NextRequest) {
  try {
    const { session, error: sessionError } = await getSessionFromHeader(request)
    
    if (sessionError || !session) {
      return NextResponse.json({ error: sessionError || 'Unauthorized' }, { status: 401 })
    }

    // Verify user exists
    const user = await verifyUser(session)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Check user tier
    const isTierValid = await checkUserTier(user.id)
    if (!isTierValid) {
      return NextResponse.json({ error: 'You do not have permission to update trading signals.' }, { status: 403 })
    }

    const body = await request.json()
    const { signal_id, ...updateData } = body

    if (!signal_id) {
      return NextResponse.json({ error: 'Signal ID required' }, { status: 400 })
    }

    const supabase = createServiceSupabaseClient()

    // Calculate actual return if closing the signal
    if (updateData.status === 'Closed' && updateData.actual_closed_price && !updateData.actual_return_percentage) {
      // Get the original signal to calculate return
      const { data: originalSignal } = await supabase
        .from('trading_signals')
        .select('entry_price, recommendation')
        .eq('id', signal_id)
        .eq('user_id', user.id)
        .single()

      if (originalSignal) {
        const entryPrice = originalSignal.entry_price
        const closedPrice = parseFloat(updateData.actual_closed_price)
        
        let returnPercentage = 0
        if (originalSignal.recommendation === 'Buy') {
          returnPercentage = ((closedPrice - entryPrice) / entryPrice) * 100
        } else if (originalSignal.recommendation === 'Sell') {
          returnPercentage = ((entryPrice - closedPrice) / entryPrice) * 100
        }
        
        updateData.actual_return_percentage = returnPercentage
      }
    }

    // Update signal
    const { data: updatedSignal, error: updateError } = await supabase
      .from('trading_signals')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', signal_id)
      .eq('user_id', user.id) // Ensure user can only update their own signals
      .select(`
        *,
        user_profile:user_profiles(
          name,
          username,
          avatar_url,
          verified,
          tier,
          location,
          bio
        )
      `)
      .single()

    if (updateError) {
      console.error('Signal update error:', updateError)
      return NextResponse.json({ error: 'Failed to update trading signal' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Trading signal updated successfully',
      signal: updatedSignal 
    })

  } catch (error) {
    console.error('Trading signal PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}