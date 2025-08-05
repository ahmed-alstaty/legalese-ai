import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Sign out the user
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json(
        { error: 'Failed to logout' }, 
        { status: 500 }
      )
    }

    // Create response with success message
    const response = NextResponse.json(
      { message: 'Logged out successfully' }, 
      { status: 200 }
    )

    // Clear any additional cookies if needed
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')

    return response
  } catch (error) {
    console.error('Unexpected logout error:', error)
    return NextResponse.json(
      { error: 'Unexpected error during logout' }, 
      { status: 500 }
    )
  }
}

// Handle GET requests by returning method not allowed
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}