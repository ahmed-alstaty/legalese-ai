import { cn } from '@/lib/utils'
import { Bot, User, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface MessageProps {
  message: Message
  className?: string
}

export function Message({ message, className }: MessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        // Handle code blocks
        if (line.startsWith('```')) {
          return null // Handle separately
        }
        
        // Handle bullet points
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return (
            <li key={index} className="ml-4">
              {line.substring(2)}
            </li>
          )
        }
        
        // Handle numbered lists
        const numberedMatch = line.match(/^(\d+)\.\s(.*)/)
        if (numberedMatch) {
          return (
            <li key={index} className="ml-4">
              {numberedMatch[2]}
            </li>
          )
        }
        
        // Handle bold text **text**
        const boldFormatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        
        return (
          <p key={index} className={line.trim() === '' ? 'mb-2' : 'mb-1'}>
            <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
          </p>
        )
      })
      .filter(Boolean)
  }

  return (
    <div
      className={cn(
        'flex w-full gap-3 px-4 py-3',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div
        className={cn(
          'flex flex-col space-y-2 max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-lg px-3 py-2 text-sm relative group',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          <div className="prose prose-sm max-w-none">
            {message.isStreaming && !message.content ? (
              <div className="flex space-x-1">
                <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : typeof message.content === 'string' ? (
              <div className="space-y-1">{formatContent(message.content)}</div>
            ) : (
              <div>{message.content}</div>
            )}
          </div>

          {!message.isStreaming && !isUser && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              onClick={() => copyToClipboard(message.content)}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-muted">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}