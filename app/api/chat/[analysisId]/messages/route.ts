import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { analysisId } = await params

    // Verify user owns the analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('id')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Get conversation messages
    const { data: conversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .select('messages, created_at, updated_at')
      .eq('analysis_id', analysisId)
      .eq('user_id', user.id)
      .single()

    if (conversationError) {
      // No conversation exists yet
      return NextResponse.json({
        messages: [],
        conversation_created_at: null,
        conversation_updated_at: null,
      })
    }

    // Parse and format messages
    const messages = Array.isArray(conversation.messages) ? conversation.messages : []
    
    // Convert string timestamps to Date objects for consistent formatting
    const formattedMessages = messages.map((message: any) => ({
      ...message,
      timestamp: new Date(message.timestamp),
    }))

    return NextResponse.json({
      messages: formattedMessages,
      conversation_created_at: conversation.created_at,
      conversation_updated_at: conversation.updated_at,
    })
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { analysisId } = await params

    // Verify user owns the analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('id')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Delete conversation
    const { error: deleteError } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('analysis_id', analysisId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete conversation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting chat messages:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}