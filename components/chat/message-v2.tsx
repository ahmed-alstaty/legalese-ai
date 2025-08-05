'use client'

import { cn } from '@/lib/utils'
import { Bot, User, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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

export function MessageV2({ message, className }: MessageProps) {
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
            'rounded-lg px-4 py-3 text-sm relative group',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted',
            'prose prose-sm max-w-none dark:prose-invert'
          )}
        >
          {message.isStreaming && !message.content ? (
            <div className="flex space-x-1">
              <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="inline-block w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : isUser ? (
            <p className="m-0 text-inherit">{message.content}</p>
          ) : (
            <div className={cn(
              "text-muted-foreground",
              "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
              "[&_p]:leading-relaxed",
              "[&_ul]:list-disc [&_ul]:pl-4",
              "[&_ol]:list-decimal [&_ol]:pl-4",
              "[&_li]:mt-1",
              "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic",
              "[&_code]:bg-gray-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
              "[&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto",
              "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
              "[&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2",
              "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2",
              "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1",
              "[&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-700",
              "[&_table]:border-collapse [&_table]:w-full",
              "[&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left",
              "[&_td]:border [&_td]:border-gray-300 [&_td]:px-2 [&_td]:py-1",
              "[&_hr]:border-gray-200 [&_hr]:my-4",
              "[&_strong]:font-semibold",
              "[&_em]:italic"
            )}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom components for better styling
                  p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({children}) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  li: ({children}) => <li className="mt-1">{children}</li>,
                  h1: ({children}) => <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>,
                  h2: ({children}) => <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>,
                  h3: ({children}) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                  code: ({children, className}) => {
                    const isInline = !className
                    return isInline ? (
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto">
                        {children}
                      </code>
                    )
                  },
                  pre: ({children}) => <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto mb-2">{children}</pre>,
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2">
                      {children}
                    </blockquote>
                  ),
                  a: ({children, href}) => (
                    <a href={href} className="text-blue-600 underline hover:text-blue-700" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  table: ({children}) => <table className="border-collapse w-full my-2">{children}</table>,
                  th: ({children}) => <th className="border border-gray-300 bg-gray-50 px-2 py-1 text-left">{children}</th>,
                  td: ({children}) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
                  hr: () => <hr className="border-gray-200 my-4" />,
                  strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                  em: ({children}) => <em className="italic">{children}</em>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {!message.isStreaming && !isUser && message.content && (
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