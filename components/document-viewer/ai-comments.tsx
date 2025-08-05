'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AIComment, HighlightedSection } from '@/types/database'
import { AlertTriangle, Info, Lightbulb, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AICommentsProps {
  aiComments: AIComment[]
  highlightedSections: HighlightedSection[]
  className?: string
  onCommentClick?: (comment: AIComment) => void
  onHighlightClick?: (highlight: HighlightedSection) => void
}

const commentTypeConfig = {
  warning: {
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  info: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  suggestion: {
    icon: Lightbulb,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  }
}

const severityConfig = {
  high: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    label: 'High Risk'
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    label: 'Medium Risk'
  },
  low: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    label: 'Low Risk'
  }
}

export default function AIComments({
  aiComments,
  highlightedSections,
  className,
  onCommentClick,
  onHighlightClick
}: AICommentsProps) {
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())
  const [visibleComments, setVisibleComments] = useState<Set<number>>(new Set())
  const [filterBySeverity, setFilterBySeverity] = useState<string>('all')
  const [filterByType, setFilterByType] = useState<string>('all')
  const commentRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Auto-show comments based on visible highlights
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const commentId = entry.target.getAttribute('data-comment-id')
          if (commentId) {
            const id = parseInt(commentId)
            setVisibleComments(prev => {
              const newSet = new Set(prev)
              if (entry.isIntersecting) {
                newSet.add(id)
              } else {
                newSet.delete(id)
              }
              return newSet
            })
          }
        })
      },
      { threshold: 0.1 }
    )

    // Observe all highlight elements
    const highlights = document.querySelectorAll('mark[data-comment-id]')
    highlights.forEach(highlight => observer.observe(highlight))

    return () => observer.disconnect()
  }, [])

  const toggleExpanded = (index: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const handleCommentClick = (comment: AIComment, index: number) => {
    if (onCommentClick) {
      onCommentClick(comment)
    }

    // Find corresponding highlighted section
    const correspondingHighlight = highlightedSections.find(
      section => section.startPosition <= comment.position && section.endPosition >= comment.position
    )

    if (correspondingHighlight && onHighlightClick) {
      onHighlightClick(correspondingHighlight)
    }
  }

  // Filter comments
  const filteredComments = aiComments.filter(comment => {
    if (filterBySeverity !== 'all' && comment.severity !== filterBySeverity) {
      return false
    }
    if (filterByType !== 'all' && comment.type !== filterByType) {
      return false
    }
    return true
  })

  // Group comments by severity for better organization
  const groupedComments = filteredComments.reduce((acc, comment, index) => {
    const severity = comment.severity
    if (!acc[severity]) {
      acc[severity] = []
    }
    acc[severity].push({ comment, originalIndex: index })
    return acc
  }, {} as Record<string, Array<{ comment: AIComment; originalIndex: number }>>)

  const severityOrder = ['high', 'medium', 'low']

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
        <h3 className="text-lg font-semibold">AI Analysis ({filteredComments.length})</h3>
        
        <div className="flex gap-2 text-sm">
          <select
            value={filterBySeverity}
            onChange={(e) => setFilterBySeverity(e.target.value)}
            className="px-2 py-1 rounded border bg-background"
          >
            <option value="all">All Severities</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
          
          <select
            value={filterByType}
            onChange={(e) => setFilterByType(e.target.value)}
            className="px-2 py-1 rounded border bg-background"
          >
            <option value="all">All Types</option>
            <option value="warning">Warnings</option>
            <option value="info">Information</option>
            <option value="suggestion">Suggestions</option>
          </select>
        </div>
      </div>

      {/* Comments grouped by severity */}
      <div className="space-y-6">
        {severityOrder.map(severity => {
          const commentsInSeverity = groupedComments[severity] || []
          if (commentsInSeverity.length === 0) return null

          return (
            <div key={severity} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={severityConfig[severity as keyof typeof severityConfig].color}>
                  {severityConfig[severity as keyof typeof severityConfig].label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({commentsInSeverity.length} comment{commentsInSeverity.length !== 1 ? 's' : ''})
                </span>
              </div>

              <div className="space-y-2">
                {commentsInSeverity.map(({ comment, originalIndex }) => {
                  const config = commentTypeConfig[comment.type]
                  const Icon = config.icon
                  const isExpanded = expandedComments.has(originalIndex)
                  const isVisible = visibleComments.has(originalIndex)
                  const isLongComment = comment.text.length > 150

                  return (
                    <Card
                      key={originalIndex}
                      ref={(el) => {
                        if (el) commentRefs.current.set(originalIndex, el)
                      }}
                      className={cn(
                        'transition-all duration-200 cursor-pointer hover:shadow-md',
                        config.borderColor,
                        config.bgColor,
                        isVisible && 'ring-2 ring-blue-200 dark:ring-blue-800'
                      )}
                      onClick={() => handleCommentClick(comment, originalIndex)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Icon className={cn('h-4 w-4', config.color)} />
                            <span className="capitalize">{comment.type}</span>
                            {isVisible && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Eye className="h-3 w-3 text-blue-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Currently visible in document</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          
                          {isLongComment && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpanded(originalIndex)
                              }}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <p className="text-sm leading-relaxed">
                          {isLongComment && !isExpanded
                            ? `${comment.text.substring(0, 150)}...`
                            : comment.text
                          }
                        </p>

                        {/* Position indicator */}
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground">
                            Position: {comment.position}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {filteredComments.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No AI comments match the current filters.</p>
        </div>
      )}
    </div>
  )
}