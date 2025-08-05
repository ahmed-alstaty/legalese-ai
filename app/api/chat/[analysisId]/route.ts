import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai, OPENAI_MODEL } from '@/lib/openai'
import OpenAI from 'openai'

export async function POST(request: NextRequest, { params }: { params: Promise<{ analysisId: string }> }) {
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
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get analysis data
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single()

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Get existing conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('analysis_id', analysisId)
      .eq('user_id', user.id)
      .single()

    let existingMessages: any[] = []
    if (conversation && conversation.messages) {
      existingMessages = Array.isArray(conversation.messages) ? conversation.messages : []
    }

    // Prepare context from analysis
    const analysisContext = {
      summary: analysis.summary,
      keyObligations: analysis.key_obligations,
      riskAssessment: analysis.risk_assessment,
      highlightedSections: analysis.highlighted_sections,
      documentContent: analysis.document_content.substring(0, 8000), // Limit context size
    }

    // Build system message with context
    const systemMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'system',
      content: `You are a legal AI assistant helping users understand their document analysis. You have access to the following analysis data:

**Document Summary:**
${analysisContext.summary || 'No summary available'}

**Key Obligations:**
${Array.isArray(analysisContext.keyObligations) ? analysisContext.keyObligations.join('\n- ') : 'No obligations identified'}

**Risk Assessment:**
${analysisContext.riskAssessment ? JSON.stringify(analysisContext.riskAssessment, null, 2) : 'No risk assessment available'}

**Document Content (excerpt):**
${analysisContext.documentContent}

Instructions:
- Answer questions about the document analysis in a helpful, professional manner
- Reference specific parts of the document when relevant
- Explain legal concepts in plain English
- If asked about something not in the analysis, politely indicate you can only discuss what's in the provided analysis
- Keep responses concise but informative
- Use bullet points and clear formatting when appropriate
- Always be accurate and never make up information not present in the analysis`
    }

    // Build conversation history
    const conversationMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      systemMessage,
      ...existingMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ]

    // Create streaming response
    const stream = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: conversationMessages,
      temperature: 0.3,
      max_tokens: 1000,
      stream: true,
    })

    // Set up streaming response
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    let fullResponse = ''

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              const data = JSON.stringify({ content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Save conversation to database
          const newUserMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: message,
            timestamp: new Date().toISOString(),
          }

          const newAssistantMessage = {
            id: `assistant_${Date.now()}`,
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date().toISOString(),
          }

          const updatedMessages = [
            ...existingMessages,
            newUserMessage,
            newAssistantMessage,
          ]

          if (conversation) {
            // Update existing conversation
            await supabase
              .from('chat_conversations')
              .update({
                messages: updatedMessages,
                updated_at: new Date().toISOString(),
              })
              .eq('id', conversation.id)
          } else {
            // Create new conversation
            await supabase
              .from('chat_conversations')
              .insert({
                analysis_id: analysisId,
                user_id: user.id,
                messages: updatedMessages,
              })
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
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