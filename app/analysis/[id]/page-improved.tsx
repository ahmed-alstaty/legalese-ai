'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AnalysisPageSkeleton } from '@/components/ui/skeleton-loaders'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { useAnalysis } from '@/hooks/use-analysis'
import { useChat } from '@/hooks/use-chat'
import { cn } from '@/lib/utils'
import { MessageV2 } from '@/components/chat/message-v2'
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Clock, 
  Brain, 
  AlertTriangle, 
  RefreshCw,
  MessageSquare,
  Send,
  AlertCircle,
  Info,
  Lightbulb,
  Shield,
  DollarSign,
  FileTerminal,
  RotateCcw,
  Scale,
  Download,
  ChevronRight,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

// Risk level color mapping with better design
const getRiskStyles = (level: number | string) => {
  if (typeof level === 'string') {
    switch(level) {
      case 'high': return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-700 border-red-200',
        icon: 'text-red-500'
      }
      case 'medium': return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: 'text-amber-500'
      }
      case 'low': return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-700 border-green-200',
        icon: 'text-green-500'
      }
      default: return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        badge: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: 'text-gray-500'
      }
    }
  }
  if (level >= 7) return getRiskStyles('high')
  if (level >= 4) return getRiskStyles('medium')
  return getRiskStyles('low')
}

// Get icon for risk type
const getRiskIcon = (type: string) => {
  switch(type) {
    case 'termination': return FileTerminal
    case 'liability': return Shield
    case 'payment': return DollarSign
    case 'intellectual_property': return Lightbulb
    case 'renewal': return RotateCcw
    default: return Scale
  }
}

export default function AnalysisPage({ params }: PageProps) {
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [selectedHighlight, setSelectedHighlight] = useState<number | null>(null)
  const [chatMessage, setChatMessage] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // Get the analysis ID from params
  useEffect(() => {
    params.then((resolvedParams) => {
      setAnalysisId(resolvedParams.id)
    })
  }, [params])

  const {
    data: analysis,
    loading,
    error,
    refetch,
  } = useAnalysis(analysisId, {
    includeContent: true,
    includeAnnotations: true,
    includeChat: false,
  })

  const {
    messages,
    isLoading: chatLoading,
    sendMessage,
    loadMessages,
  } = useChat(analysisId || '')

  // Load chat messages
  useEffect(() => {
    if (analysisId) {
      loadMessages()
    }
  }, [analysisId, loadMessages])

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim() || chatLoading) return
    
    const message = chatMessage.trim()
    setChatMessage('')
    await sendMessage(message)
  }

  const handleHighlightClick = (index: number) => {
    setSelectedHighlight(index)
    // Scroll to the highlighted section in the document
    const element = document.getElementById(`highlight-${index}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  if (loading) {
    return <AnalysisPageSkeleton />
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Analysis not found. Please check the ID and try again.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const highlightedSections = analysis.aiAnnotations || []

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <h1 className="font-semibold text-lg">{analysis.document?.filename || 'Document Analysis'}</h1>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(analysis.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(analysis.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={cn(
                analysis.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                analysis.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-gray-50 text-gray-700 border-gray-200'
              )}
            >
              <span className="flex items-center gap-1">
                {analysis.status === 'completed' ? <CheckCircle className="h-3 w-3" /> :
                 analysis.status === 'processing' ? <RefreshCw className="h-3 w-3 animate-spin" /> :
                 <Clock className="h-3 w-3" />}
                {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
              </span>
            </Badge>
            <Button size="sm" variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Enhanced Chat */}
        <div className="w-96 bg-white border-r flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="font-semibold flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </div>
              AI Legal Assistant
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              Ask questions about your document
            </p>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Start a conversation
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    I can help you understand this document better
                  </p>
                  <div className="space-y-2 text-left">
                    {[
                      "What are the key risks?",
                      "Explain the termination clause",
                      "What are my obligations?",
                      "Summarize payment terms"
                    ].map((question, i) => (
                      <button
                        key={i}
                        onClick={() => setChatMessage(question)}
                        className="w-full text-left px-3 py-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <span className="text-gray-500">Try:</span> <span className="text-gray-700">{question}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageV2 key={message.id} message={message} />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Enhanced Input Form */}
          <form onSubmit={handleChatSubmit} className="p-4 border-t bg-gray-50">
            <div className="relative">
              <Textarea
                ref={chatInputRef}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your question here..."
                className="pr-12 min-h-[80px] resize-none"
                disabled={chatLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleChatSubmit(e)
                  }
                }}
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={chatLoading || !chatMessage.trim()}
                className="absolute bottom-2 right-2"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Shift+Enter for new line
            </p>
          </form>
        </div>

        {/* Middle Panel - Document Viewer with Better Formatting */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Executive Summary */}
          {analysis.summary && (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="max-w-3xl mx-auto">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-indigo-600" />
                  Executive Summary
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
              </div>
            </div>
          )}

          {/* Document Content */}
          <ScrollArea className="flex-1">
            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                <article className="prose prose-gray max-w-none">
                  <DocumentViewer 
                    content={analysis.documentContent || ''}
                    highlights={highlightedSections}
                    selectedHighlight={selectedHighlight}
                    onHighlightClick={handleHighlightClick}
                  />
                </article>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Modern Risk Analysis */}
        <div className="w-96 bg-gray-50 border-l flex flex-col">
          <div className="p-4 bg-white border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Risk Analysis
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {highlightedSections.length} issues identified
            </p>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {highlightedSections.map((section, index) => {
                const riskStyles = getRiskStyles(section.severity)
                const RiskIcon = getRiskIcon(section.type)
                
                return (
                  <Card
                    key={index}
                    className={cn(
                      "cursor-pointer transition-all border overflow-hidden",
                      riskStyles.border,
                      selectedHighlight === index && "ring-2 ring-indigo-500 shadow-lg"
                    )}
                    onClick={() => handleHighlightClick(index)}
                  >
                    <div className={cn("p-4", riskStyles.bg)}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 bg-white rounded-lg", riskStyles.border)}>
                            <RiskIcon className={cn("h-4 w-4", riskStyles.icon)} />
                          </div>
                          <span className={cn("font-medium text-sm capitalize", riskStyles.text)}>
                            {section.type.replace('_', ' ')}
                          </span>
                        </div>
                        <Badge variant="outline" className={riskStyles.badge}>
                          Risk: {section.riskLevel}/10
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {/* Highlighted Text */}
                        <div className="p-2 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 italic line-clamp-2">
                            "{section.text}"
                          </p>
                        </div>

                        {/* Issue */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className={cn("h-3 w-3", riskStyles.icon)} />
                            <span className="text-xs font-medium">Issue</span>
                          </div>
                          <p className="text-xs text-gray-600 pl-4">
                            {section.comment}
                          </p>
                        </div>

                        {/* Suggestion */}
                        {section.suggestion && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Lightbulb className="h-3 w-3 text-blue-500" />
                              <span className="text-xs font-medium">Recommendation</span>
                            </div>
                            <p className="text-xs text-gray-600 pl-4">
                              {section.suggestion}
                            </p>
                          </div>
                        )}

                        {/* View in Document */}
                        <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                          View in document
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

// Enhanced Document Viewer Component
function DocumentViewer({ 
  content, 
  highlights, 
  selectedHighlight, 
  onHighlightClick 
}: {
  content: string
  highlights: any[]
  selectedHighlight: number | null
  onHighlightClick: (index: number) => void
}) {
  // Process and render content with proper formatting
  const renderContent = () => {
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let inList = false
    let listItems: string[] = []

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim()

      // Skip empty lines
      if (!trimmedLine) {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${lineIndex}`} className="list-disc pl-6 mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        elements.push(<div key={`space-${lineIndex}`} className="h-4" />)
        return
      }

      // Headers - ALL CAPS or numbered sections
      if (trimmedLine.match(/^[A-Z\s]+$/) && trimmedLine.length > 3) {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${lineIndex}`} className="list-disc pl-6 mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        elements.push(
          <h2 key={`h2-${lineIndex}`} className="text-xl font-bold mt-6 mb-3 text-gray-900">
            {applyHighlights(trimmedLine, lineIndex, highlights, selectedHighlight, onHighlightClick)}
          </h2>
        )
      }
      // Section numbers
      else if (trimmedLine.match(/^\d+\./)) {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${lineIndex}`} className="list-disc pl-6 mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        elements.push(
          <h3 key={`h3-${lineIndex}`} className="text-lg font-semibold mt-4 mb-2 text-gray-800">
            {applyHighlights(trimmedLine, lineIndex, highlights, selectedHighlight, onHighlightClick)}
          </h3>
        )
      }
      // Bullet points
      else if (trimmedLine.match(/^[\-\*\•]/)) {
        inList = true
        listItems.push(trimmedLine.substring(1).trim())
      }
      // Regular paragraphs
      else {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${lineIndex}`} className="list-disc pl-6 mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700">{item}</li>
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        elements.push(
          <p key={`p-${lineIndex}`} className="mb-3 text-gray-700 leading-relaxed">
            {applyHighlights(trimmedLine, lineIndex, highlights, selectedHighlight, onHighlightClick)}
          </p>
        )
      }
    })

    // Handle remaining list items
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key="list-final" className="list-disc pl-6 mb-4 space-y-1">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-700">{item}</li>
          ))}
        </ul>
      )
    }

    return elements
  }

  // Apply highlights to text
  const applyHighlights = (
    text: string, 
    lineIndex: number, 
    highlights: any[], 
    selectedHighlight: number | null,
    onHighlightClick: (index: number) => void
  ) => {
    // Check if this text contains any highlights
    const relevantHighlights = highlights.filter((h, i) => 
      text.includes(h.text)
    )

    if (relevantHighlights.length === 0) {
      return text
    }

    // Apply highlights
    let result = text
    relevantHighlights.forEach((highlight, i) => {
      const highlightIndex = highlights.indexOf(highlight)
      const riskStyles = getRiskStyles(highlight.severity)
      const isSelected = selectedHighlight === highlightIndex

      const highlightedSpan = `<span 
        id="highlight-${highlightIndex}"
        class="cursor-pointer px-1 py-0.5 rounded transition-all ${
          isSelected 
            ? 'bg-indigo-200 ring-2 ring-indigo-500' 
            : highlight.severity === 'high' 
              ? 'bg-red-100 hover:bg-red-200' 
              : highlight.severity === 'medium'
                ? 'bg-amber-100 hover:bg-amber-200'
                : 'bg-green-100 hover:bg-green-200'
        }"
        onclick="window.handleHighlightClick && window.handleHighlightClick(${highlightIndex})"
      >${highlight.text}</span>`

      result = result.replace(highlight.text, highlightedSpan)
    })

    return <span dangerouslySetInnerHTML={{ __html: result }} />
  }

  // Set up global click handler
  useEffect(() => {
    ;(window as any).handleHighlightClick = onHighlightClick
    return () => {
      delete (window as any).handleHighlightClick
    }
  }, [onHighlightClick])

  return <>{renderContent()}</>
}