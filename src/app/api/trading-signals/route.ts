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

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/trading-signals called')
    
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
    console.log('Trading signal data received:', Object.keys(body))

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
      signal_created_at,
      enabled = false // Default to false, can be enabled after blockchain confirmation
    } = body

    // Validate required fields
    if (!asset_name || !asset_type || !pattern_name || !recommendation || 
        !sentiment || confidence === undefined || !entry_price || !reason) {
      return NextResponse.json({ 
        error: 'Missing required fields: asset_name, asset_type, pattern_name, recommendation, sentiment, confidence, entry_price, reason' 
      }, { status: 400 })
    }

    // Validate field values
    if (!['Stock', 'Crypto', 'Forex', 'Commodity', 'Index'].includes(asset_type)) {
      return NextResponse.json({ 
        error: 'Invalid asset_type. Must be one of: Stock, Crypto, Forex, Commodity, Index' 
      }, { status: 400 })
    }

    if (!['Buy', 'Sell', 'Hold'].includes(recommendation)) {
      return NextResponse.json({ 
        error: 'Invalid recommendation. Must be one of: Buy, Sell, Hold' 
      }, { status: 400 })
    }

    if (!['Bullish', 'Bearish', 'Neutral'].includes(sentiment)) {
      return NextResponse.json({ 
        error: 'Invalid sentiment. Must be one of: Bullish, Bearish, Neutral' 
      }, { status: 400 })
    }

    if (confidence < 0 || confidence > 100) {
      return NextResponse.json({ 
        error: 'Invalid confidence. Must be between 0 and 100' 
      }, { status: 400 })
    }

    // Prepare insert data
    const insertData = {
      user_id: user.id,
      analysis_id: analysis_id || null,
      asset_name: asset_name.trim(),
      asset_type,
      pattern_name: pattern_name.trim(),
      recommendation,
      sentiment,
      confidence: parseInt(confidence),
      entry_price: parseFloat(entry_price),
      exit_price: exit_price ? parseFloat(exit_price) : null,
      take_profit: take_profit ? parseFloat(take_profit) : null,
      stop_loss: stop_loss ? parseFloat(stop_loss) : null,
      reason: reason.trim(),
      signal_created_at: signal_created_at || new Date().toISOString(),
      status: 'Open',
      enabled,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Inserting trading signal for user:', user.id)

    // Insert trading signal
    const { data: newSignal, error: insertError } = await supabase
      .from('trading_signals')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error('Trading signal insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create trading signal' }, { status: 500 })
    }

    console.log('Trading signal created successfully:', newSignal.id)
    
    return NextResponse.json({ 
      success: true,
      signal: newSignal,
      message: 'Trading signal created successfully'
    })

  } catch (error) {
    console.error('Trading signals POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/trading-signals called')
    
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assetType = searchParams.get('asset_type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('trading_signals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    
    if (assetType) {
      query = query.eq('asset_type', assetType)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: signals, error: fetchError } = await query

    if (fetchError) {
      console.error('Trading signals fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch trading signals' }, { status: 500 })
    }

    return NextResponse.json({ 
      signals,
      count: signals?.length || 0
    })

  } catch (error) {
    console.error('Trading signals GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/trading-signals called')
    
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
    const { signal_id, ...updateData } = body

    if (!signal_id) {
      return NextResponse.json({ error: 'signal_id is required' }, { status: 400 })
    }

    // Prepare update data
    const allowedUpdates = [
      'status', 'actual_closed_price', 'signal_closed_at', 'enabled',
      'exit_price', 'take_profit', 'stop_loss'
    ]
    
    const filteredUpdates: any = {
      updated_at: new Date().toISOString()
    }

    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updateData[key]
      }
    })

    console.log('Updating trading signal:', signal_id, 'for user:', user.id)

    // Update trading signal (only if it belongs to the user)
    const { data: updatedSignal, error: updateError } = await supabase
      .from('trading_signals')
      .update(filteredUpdates)
      .eq('id', signal_id)
      .eq('user_id', user.id) // Ensure user can only update their own signals
      .select()
      .single()

    if (updateError) {
      console.error('Trading signal update error:', updateError)
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Trading signal not found or unauthorized' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to update trading signal' }, { status: 500 })
    }

    console.log('Trading signal updated successfully:', updatedSignal.id)
    
    return NextResponse.json({ 
      success: true,
      signal: updatedSignal,
      message: 'Trading signal updated successfully'
    })

  } catch (error) {
    console.error('Trading signals PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}