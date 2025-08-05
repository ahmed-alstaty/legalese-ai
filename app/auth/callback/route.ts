import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/login?error=auth_error`)
      }

      if (data.user) {
        // Check if user profile exists, if not create one
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || '',
              company_name: data.user.user_metadata?.company_name || null,
              subscription_tier: 'free',
              subscription_status: 'active',
              analyses_used_this_month: 0
            })

          if (insertError) {
            console.error('Error creating user profile:', insertError)
          }
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(`${origin}/login?error=unexpected_error`)
    }
  }

  // If no code is provided, redirect to login
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}