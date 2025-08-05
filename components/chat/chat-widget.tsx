'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
// import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageV2 as Message } from './message-v2'
import { useChat } from '@/hooks/use-chat'
import { cn } from '@/lib/utils'

interface ChatWidgetProps {
  analysisId: string
  className?: string
  defaultOpen?: boolean
}

export function ChatWidget({ analysisId, className, defaultOpen = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [input, setInput] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    loadMessages,
  } = useChat(analysisId)

  // Load messages when widget opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadMessages()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when new messages arrive or when streaming
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollToBottom = () => {
        scrollAreaRef.current!.scrollTo({
          top: scrollAreaRef.current!.scrollHeight,
          behavior: 'smooth'
        })
      }
      
      // Use requestAnimationFrame for smoother scrolling during streaming
      requestAnimationFrame(scrollToBottom)
    }
  }, [messages])

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    try {
      await sendMessage(userMessage)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50',
          className
        )}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        'fixed bottom-4 right-4 w-96 h-[600px] shadow-xl z-50 flex flex-col',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold">AI Assistant</h3>
          <p className="text-sm text-muted-foreground">
            Ask questions about your document
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div ref={scrollAreaRef} className="h-full px-4 overflow-y-auto">
          {messages.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center space-y-2">
                <MessageCircle className="h-12 w-12 mx-auto opacity-50" />
                <p className="text-sm">
                  Start a conversation about your document analysis
                </p>
                <p className="text-xs">
                  Ask questions like "What are the key risks?" or "Explain clause 5"
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 py-4">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg mx-4">
                  Error: {error}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your document..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}