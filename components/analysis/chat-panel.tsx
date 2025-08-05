'use client'

import { useRef, useEffect } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageV2 } from '@/components/chat/message-v2'
import { cn } from '@/lib/utils'
import type { Message } from '@/hooks/use-chat'

interface ChatPanelProps {
  messages: Message[]
  isLoading: boolean
  onSendMessage: (message: string) => Promise<void>
  className?: string
}

export function ChatPanel({ messages, isLoading, onSendMessage, className }: ChatPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Auto-scroll to bottom when messages change or during streaming
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }

    // Use a small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100)
    
    return () => clearTimeout(timeoutId)
  }, [messages])

  // Focus input after sending message
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const message = formData.get('message') as string
    
    if (!message?.trim() || isLoading) return
    
    // Clear input immediately for better UX
    if (formRef.current) {
      formRef.current.reset()
    }
    
    await onSendMessage(message.trim())
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          AI Assistant
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Ask questions about this document
        </p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                Start a conversation about your document
              </p>
              <div className="mt-4 space-y-2 text-xs">
                <p className="text-gray-500">Try asking:</p>
                <div className="space-y-1">
                  <p className="italic">"What are the key risks in this document?"</p>
                  <p className="italic">"Explain the termination clause"</p>
                  <p className="italic">"What are my obligations?"</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageV2 key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Form */}
      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className="p-4 border-t bg-white"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            name="message"
            placeholder="Ask about the document..."
            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
            autoComplete="off"
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={isLoading}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}