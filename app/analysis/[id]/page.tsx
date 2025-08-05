'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AnalysisPageSkeleton } from '@/components/ui/skeleton-loaders'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAnalysis } from '@/hooks/use-analysis'
import { useChat } from '@/hooks/use-chat'
import { cn } from '@/lib/utils'
import { ChatPanel } from '@/components/analysis/chat-panel'
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
  Scale
} from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

// Risk level color mapping
const getRiskColor = (level: number | string) => {
  if (typeof level === 'string') {
    switch(level) {
      case 'high': return 'bg-red-100 border-red-300 text-red-900 hover:bg-red-200'
      case 'medium': return 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
      case 'low': return 'bg-green-100 border-green-300 text-green-900 hover:bg-green-200'
      default: return 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
    }
  }
  if (level >= 7) return 'bg-red-100 border-red-300 text-red-900 hover:bg-red-200'
  if (level >= 4) return 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
  return 'bg-green-100 border-green-300 text-green-900 hover:bg-green-200'
}

// Get icon for risk type
const getRiskIcon = (type: string) => {
  switch(type) {
    case 'termination': return <FileTerminal className="h-4 w-4" />
    case 'liability': return <Shield className="h-4 w-4" />
    case 'payment': return <DollarSign className="h-4 w-4" />
    case 'intellectual_property': return <Lightbulb className="h-4 w-4" />
    case 'renewal': return <RotateCcw className="h-4 w-4" />
    default: return <Scale className="h-4 w-4" />
  }
}

export default function AnalysisPage({ params }: PageProps) {
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [selectedHighlight, setSelectedHighlight] = useState<number | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
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
  }, [analysisId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle highlight selection
  const handleHighlightClick = (index: number) => {
    setSelectedHighlight(index)
    
    // Scroll to the highlighted section in the editor
    const element = document.querySelector(`[data-highlight-index="${index}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      // Add pulse animation
      element.classList.add('animate-pulse')
      setTimeout(() => {
        element.classList.remove('animate-pulse')
      }, 2000)
    }
  }

  // Handle chat submit
  const handleChatSubmit = async (message: string) => {
    await sendMessage(message)
  }

  // Loading state
  if (loading) {
    return <AnalysisPageSkeleton />
  }

  // Error state
  if (error || !analysis) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-center mb-2">Unable to Load Analysis</h3>
            <p className="text-gray-600 text-center mb-4">{error || 'Analysis not found'}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/dashboard')} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <Button onClick={refetch} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const highlightedSections = analysis.highlightedSections || []
  const overallRisk = Object.values(analysis.riskAssessment).reduce((sum, risk) => sum + risk, 0) / Object.values(analysis.riskAssessment).length

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-500" />
            <div>
              <h1 className="font-semibold text-sm">{analysis.document.filename}</h1>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(analysis.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  {analysis.modelUsed}
                </span>
                <Badge variant={overallRisk >= 7 ? 'destructive' : overallRisk >= 4 ? 'secondary' : 'default'}>
                  Risk: {overallRisk.toFixed(1)}/10
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {Math.round(analysis.confidenceScore * 100)}% Confidence
          </Badge>
          <Button size="sm" variant="outline">
            Export PDF
          </Button>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <div className="w-80 bg-white border-r">
          <ChatPanel 
            messages={messages}
            isLoading={chatLoading}
            onSendMessage={handleChatSubmit}
          />
        </div>

        {/* Middle Panel - Document Editor */}
        <div className="flex-1 bg-white flex flex-col">
          {/* Summary Card */}
          {analysis.summary && (
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <h3 className="font-semibold text-sm mb-2">Executive Summary</h3>
              <p className="text-sm text-gray-700">{analysis.summary}</p>
            </div>
          )}

          {/* Document Content with Highlights */}
          <ScrollArea className="flex-1 p-6" ref={editorRef}>
            <div className="max-w-4xl mx-auto prose prose-sm">
              <DocumentRenderer 
                content={analysis.documentContent || ''}
                highlights={highlightedSections}
                selectedHighlight={selectedHighlight}
                onHighlightClick={handleHighlightClick}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - AI Feedback */}
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold">AI Analysis & Feedback</h2>
            <p className="text-xs text-gray-500 mt-1">Click on highlights to see details</p>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {highlightedSections.map((section, index) => (
                <Card
                  key={index}
                  className={cn(
                    "cursor-pointer transition-all border-2",
                    getRiskColor(section.severity),
                    selectedHighlight === index && "ring-2 ring-blue-500"
                  )}
                  onClick={() => handleHighlightClick(index)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getRiskIcon(section.type)}
                        <span className="font-medium text-sm capitalize">
                          {section.type.replace('_', ' ')}
                        </span>
                      </div>
                      <Badge variant={section.severity === 'high' ? 'destructive' : section.severity === 'medium' ? 'secondary' : 'default'}>
                        Risk: {section.riskLevel}/10
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      "{section.text}"
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium">Issue</p>
                          <p className="text-xs text-gray-600">{section.comment}</p>
                        </div>
                      </div>
                      
                      {section.suggestion && (
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium">Suggestion</p>
                            <p className="text-xs text-gray-600">{section.suggestion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

// Document Renderer Component
function DocumentRenderer({ 
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
  // Create a map of positions to highlights
  const highlightMap = new Map()
  highlights.forEach((highlight, index) => {
    for (let i = highlight.startPosition; i < highlight.endPosition; i++) {
      highlightMap.set(i, { ...highlight, index })
    }
  })

  // Process content to preserve formatting
  const processedContent = content
    .split('\n')
    .map(line => {
      // Detect headers (lines that are all caps or start with numbers)
      if (line.match(/^[A-Z\s]+$/) || line.match(/^\d+\./)) {
        return `<h3 class="font-bold text-lg mt-4 mb-2">${line}</h3>`
      }
      // Detect bullet points
      if (line.match(/^[\-\*\•]/)) {
        return `<li class="ml-4">${line.substring(1).trim()}</li>`
      }
      // Regular paragraphs
      if (line.trim()) {
        return `<p class="mb-2">${line}</p>`
      }
      // Empty lines for spacing
      return '<br/>'
    })
    .join('')

  // Apply highlights
  let result = ''
  let currentHighlight = null
  
  for (let i = 0; i < content.length; i++) {
    const highlight = highlightMap.get(i)
    
    if (highlight && highlight !== currentHighlight) {
      if (currentHighlight) {
        result += '</span>'
      }
      const colorClass = getRiskColor(highlight.severity).replace('hover:', '')
      const isSelected = selectedHighlight === highlight.index
      result += `<span 
        data-highlight-index="${highlight.index}"
        class="${colorClass} px-1 rounded cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}"
        onclick="window.handleHighlightClick(${highlight.index})"
        title="${highlight.comment}"
      >`
      currentHighlight = highlight
    } else if (!highlight && currentHighlight) {
      result += '</span>'
      currentHighlight = null
    }
    
    result += content[i]
  }
  
  if (currentHighlight) {
    result += '</span>'
  }

  // Set up global click handler
  useEffect(() => {
    (window as any).handleHighlightClick = onHighlightClick
    return () => {
      delete (window as any).handleHighlightClick
    }
  }, [onHighlightClick])

  return <div dangerouslySetInnerHTML={{ __html: result }} />
}