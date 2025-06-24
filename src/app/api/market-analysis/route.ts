// app/api/market-analysis/route.ts
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

// Create service role client for storage operations
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
    return { session, error: null }
  } catch (parseError) {
    return { session: null, error: 'Invalid session token' }
  }
}

// GET - Fetch user's market analyses
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/market-analysis called')
    
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

    // Parse query parameters
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const status = url.searchParams.get('status') || 'active'
    const asset_type = url.searchParams.get('asset_type')
    const sentiment = url.searchParams.get('sentiment')

    console.log('Fetching analyses for user:', user.id)

    // Build query
    let query = supabase
      .from('market_analysis')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Add filters if provided
    if (asset_type) {
      query = query.eq('asset_type', asset_type)
    }
    if (sentiment) {
      query = query.eq('sentiment', sentiment)
    }

    const { data: analyses, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching analyses:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('market_analysis')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', status)

    if (asset_type) {
      countQuery = countQuery.eq('asset_type', asset_type)
    }
    if (sentiment) {
      countQuery = countQuery.eq('sentiment', sentiment)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error getting count:', countError)
    }

    return NextResponse.json({
      analyses: analyses || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Market analysis GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new market analysis
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/market-analysis called')
    
    const { session, error: sessionError } = await getSessionFromHeader(request)
    
    if (sessionError || !session) {
      return NextResponse.json({ error: sessionError || 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createSupabaseClient()
    const serviceSupabase = createServiceSupabaseClient()
    
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

    // Parse request body
    const body = await request.json()
    console.log('Analysis data received:', Object.keys(body))

    const {
      asset_name,
      asset_type,
      pattern_name,
      sentiment,
      confidence,
      description,
      recommendation,
      recommendation_reason,
      price_targets,
      risk_reward,
      indicators,
      chart_image_base64,
      analysis_timestamp,
      tags = []
    } = body

    // Validate required fields
    if (!asset_name || !asset_type || !pattern_name || !sentiment || !recommendation) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Validate enums
    const validAssetTypes = ['Stock', 'Crypto', 'Forex', 'Commodity', 'Index']
    const validSentiments = ['Bullish', 'Bearish', 'Neutral']
    const validRecommendations = ['Buy', 'Sell', 'Hold']

    if (!validAssetTypes.includes(asset_type)) {
      return NextResponse.json({ error: 'Invalid asset_type' }, { status: 400 })
    }
    if (!validSentiments.includes(sentiment)) {
      return NextResponse.json({ error: 'Invalid sentiment' }, { status: 400 })
    }
    if (!validRecommendations.includes(recommendation)) {
      return NextResponse.json({ error: 'Invalid recommendation' }, { status: 400 })
    }

    let chart_image_url = null

    // Handle chart image upload if provided
    if (chart_image_base64) {
      try {
        console.log('Uploading chart image...')
        
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(chart_image_base64, 'base64')
        const fileName = `analysis_${user.id}_${Date.now()}.jpg`
        const filePath = `charts/${fileName}`

        // Upload to Supabase Storage using service role
        const { data: uploadData, error: uploadError } = await serviceSupabase.storage
          .from('market-analysis')
          .upload(filePath, imageBuffer, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Chart image upload error:', uploadError)
          // Continue without image rather than failing the entire request
        } else {
          // Get public URL
          const { data: { publicUrl } } = serviceSupabase.storage
            .from('market-analysis')
            .getPublicUrl(filePath)
          
          chart_image_url = publicUrl
          console.log('Chart image uploaded successfully:', publicUrl)
        }
      } catch (imageError) {
        console.error('Error processing chart image:', imageError)
        // Continue without image
      }
    }

    // Prepare data for insertion
    const analysisData = {
      user_id: user.id,
      asset_name,
      asset_type,
      pattern_name,
      sentiment,
      confidence: parseInt(confidence) || 75,
      description: description || '',
      recommendation,
      recommendation_reason: recommendation_reason || '',
      price_targets: price_targets || {},
      risk_reward: risk_reward ? parseFloat(risk_reward) : null,
      chart_image_url,
      indicators: indicators || [],
      analysis_timestamp: analysis_timestamp || new Date().toISOString(),
      tags: Array.isArray(tags) ? tags : []
    }

    console.log('Inserting analysis for user:', user.id)

    // Insert into database
    const { data: newAnalysis, error: insertError } = await supabase
      .from('market_analysis')
      .insert(analysisData)
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      
      // Clean up uploaded image if database insert fails
      if (chart_image_url) {
        const pathMatch = chart_image_url.match(/charts\/.*/)
        if (pathMatch) {
          await serviceSupabase.storage.from('market-analysis').remove([pathMatch[0]])
        }
      }
      
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
    }

    console.log('Analysis saved successfully:', newAnalysis.id)

    return NextResponse.json({ 
      message: 'Analysis saved successfully',
      analysis: newAnalysis 
    })

  } catch (error) {
    console.error('Market analysis POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update existing analysis
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/market-analysis called')
    
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

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Analysis ID required' }, { status: 400 })
    }

    // Update analysis
    const { data: updatedAnalysis, error: updateError } = await supabase
      .from('market_analysis')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own analyses
      .select()
      .single()

    if (updateError) {
      console.error('Analysis update error:', updateError)
      return NextResponse.json({ error: 'Failed to update analysis' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Analysis updated successfully',
      analysis: updatedAnalysis 
    })

  } catch (error) {
    console.error('Market analysis PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}