// app/api/profile/avatar/route.ts
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

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/profile/avatar called')
    
    const { session, error: sessionError } = await getSessionFromHeader(request)
    
    if (sessionError || !session) {
      return NextResponse.json({ error: sessionError || 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createSupabaseClient()
    
    // Set the session for user authentication
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('avatar') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File received:', { 
      name: file.name, 
      size: file.size, 
      type: file.type 
    })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    console.log('Uploading avatar for user:', user.id, 'to path:', filePath)

    // Convert File to ArrayBuffer for Supabase
    const fileBuffer = await file.arrayBuffer()

    // Use service role client for storage operations (bypasses RLS)
    const serviceSupabase = createServiceSupabaseClient()

    // Upload file to Supabase Storage using service role
    const { data: uploadData, error: uploadError } = await serviceSupabase.storage
      .from('user-uploads')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    console.log('Upload successful:', uploadData.path)

    // Get public URL using service role client
    const { data: { publicUrl } } = serviceSupabase.storage
      .from('user-uploads')
      .getPublicUrl(filePath)

    console.log('Public URL generated:', publicUrl)

    // Update user profile with new avatar URL (use regular client with user session)
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      // Clean up uploaded file if profile update fails
      await serviceSupabase.storage.from('user-uploads').remove([filePath])
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    console.log('Avatar updated successfully for user:', user.id)

    return NextResponse.json({ 
      message: 'Avatar updated successfully',
      avatar_url: publicUrl,
      profile: updatedProfile 
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Optional: DELETE method to remove avatar
export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/profile/avatar called')
    
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

    // Get current profile to find avatar URL
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('user_id', user.id)
      .single()

    // Remove avatar URL from profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Try to delete the file from storage (optional - old avatars will accumulate)
    if (profile?.avatar_url) {
      const pathMatch = profile.avatar_url.match(/avatars\/.*/)
      if (pathMatch) {
        await supabase.storage.from('user-uploads').remove([pathMatch[0]])
      }
    }

    return NextResponse.json({ 
      message: 'Avatar removed successfully',
      profile: updatedProfile 
    })

  } catch (error) {
    console.error('Avatar delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}