'use client'

import { useState, useCallback, useMemo } from 'react'
export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface UseChatOptions {
  onError?: (error: string) => void
}

export function useChat(analysisId: string, options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Memoize options to prevent recreating callbacks
  const memoizedOptions = useMemo(() => options, [options.onError])

  const loadMessages = useCallback(async () => {
    try {
      setError(null)
      
      const response = await fetch(`/api/chat/${analysisId}/messages`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load messages')
      }

      const data = await response.json()
      
      // Convert the messages to the expected format
      const formattedMessages: Message[] = data.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }))
      
      setMessages(formattedMessages)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages'
      setError(errorMessage)
      memoizedOptions.onError?.(errorMessage)
    }
  }, [analysisId, memoizedOptions])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    // Add user message immediately
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])

    // Add placeholder assistant message for streaming
    const assistantMessageId = `assistant_${Date.now()}`
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await fetch(`/api/chat/${analysisId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              // Streaming complete
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              )
              break
            }

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantContent += parsed.content
                
                // Update the assistant message with new content
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                )
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      setError(errorMessage)
      memoizedOptions.onError?.(errorMessage)

      // Remove the failed assistant message
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId))
    } finally {
      setIsLoading(false)
    }
  }, [analysisId, isLoading, memoizedOptions])

  const clearMessages = useCallback(async () => {
    try {
      setError(null)
      
      const response = await fetch(`/api/chat/${analysisId}/messages`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clear messages')
      }

      setMessages([])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear messages'
      setError(errorMessage)
      memoizedOptions.onError?.(errorMessage)
    }
  }, [analysisId, memoizedOptions])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadMessages,
    clearMessages,
  }
}