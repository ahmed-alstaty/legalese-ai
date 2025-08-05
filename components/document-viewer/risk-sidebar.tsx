'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HighlightedSection, UserAnnotation } from '@/types/database'
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  DollarSign, 
  RefreshCw, 
  Brain,
  MessageSquare,
  Eye,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RiskSidebarProps {
  riskAssessment: {
    termination: number
    liability: number
    intellectualProperty: number
    payment: number
    renewal: number
  }
  highlightedSections: HighlightedSection[]
  userAnnotations: UserAnnotation[]
  confidenceScore: number
  onHighlightClick?: (highlight: HighlightedSection) => void
  onAnnotationClick?: (annotation: UserAnnotation) => void
  className?: string
}

const riskCategories = {
  termination: {
    icon: AlertTriangle,
    label: 'Termination',
    color: 'text-red-600 dark:text-red-400',
    description: 'Contract termination risks'
  },
  liability: {
    icon: Shield,
    label: 'Liability',
    color: 'text-orange-600 dark:text-orange-400',
    description: 'Liability and indemnification'
  },
  intellectualProperty: {
    icon: Brain,
    label: 'IP Rights',
    color: 'text-purple-600 dark:text-purple-400',
    description: 'Intellectual property concerns'
  },
  payment: {
    icon: DollarSign,
    label: 'Payment',
    color: 'text-green-600 dark:text-green-400',
    description: 'Payment and financial terms'
  },
  renewal: {
    icon: RefreshCw,
    label: 'Renewal',
    color: 'text-blue-600 dark:text-blue-400',
    description: 'Renewal and extension terms'
  }
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }
}

const getRiskLevel = (score: number) => {
  if (score >= 7) return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-950/20' }
  if (score >= 4) return { level: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20' }
  return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/20' }
}

export default function RiskSidebar({
  riskAssessment,
  highlightedSections,
  userAnnotations,
  confidenceScore,
  onHighlightClick,
  onAnnotationClick,
  className
}: RiskSidebarProps) {
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate overall risk score
  const overallRisk = Object.values(riskAssessment).reduce((sum, risk) => sum + risk, 0) / Object.values(riskAssessment).length

  // Group highlights by severity
  const highlightsBySeverity = highlightedSections.reduce((acc, highlight, index) => {
    const severity = highlight.severity
    if (!acc[severity]) acc[severity] = []
    acc[severity].push({ ...highlight, index })
    return acc
  }, {} as Record<string, Array<HighlightedSection & { index: number }>>)

  // Group highlights by type/category
  const highlightsByType = highlightedSections.reduce((acc, highlight, index) => {
    const type = highlight.type || 'general'
    if (!acc[type]) acc[type] = []
    acc[type].push({ ...highlight, index })
    return acc
  }, {} as Record<string, Array<HighlightedSection & { index: number }>>)

  const handleHighlightClick = (highlight: HighlightedSection, index: number) => {
    if (onHighlightClick) {
      onHighlightClick(highlight)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Overall Risk Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Risk Assessment</span>
            <Badge variant="outline" className="text-xs">
              AI Confidence: {Math.round(confidenceScore * 100)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn('p-4 rounded-lg mb-4', getRiskLevel(overallRisk).bgColor)}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Overall Risk</span>
              <Badge className={cn('font-bold', getRiskLevel(overallRisk).color)}>
                {getRiskLevel(overallRisk).level}
              </Badge>
            </div>
            <Progress value={overallRisk * 10} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {overallRisk.toFixed(1)}/10
            </p>
          </div>

          {/* Individual Risk Categories */}
          <div className="space-y-3">
            {Object.entries(riskAssessment).map(([category, score]) => {
              const config = riskCategories[category as keyof typeof riskCategories]
              const Icon = config.icon
              const riskLevel = getRiskLevel(score)

              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', config.color)} />
                    <div>
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn('text-xs', riskLevel.color)}>
                      {score.toFixed(1)}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="highlights" className="text-xs">Issues</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="overview" className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Issues Found</span>
                  <Badge variant="outline">{highlightedSections.length}</Badge>
                </div>
                
                <div className="space-y-1">
                  {['high', 'medium', 'low'].map(severity => {
                    const count = highlightsBySeverity[severity]?.length || 0
                    return (
                      <div key={severity} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full', {
                            'bg-red-500': severity === 'high',
                            'bg-yellow-500': severity === 'medium',
                            'bg-green-500': severity === 'low'
                          })} />
                          <span className="capitalize">{severity} Risk</span>
                        </div>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-sm">
                    <span>Your Annotations</span>
                    <Badge variant="outline">{userAnnotations.length}</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="highlights" className="space-y-2 max-h-96 overflow-y-auto">
              {['high', 'medium', 'low'].map(severity => {
                const highlights = highlightsBySeverity[severity] || []
                if (highlights.length === 0) return null

                return (
                  <div key={severity} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(severity)}>
                        {severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({highlights.length})
                      </span>
                    </div>

                    {highlights.map((highlight) => (
                      <Button
                        key={highlight.index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => handleHighlightClick(highlight, highlight.index)}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium line-clamp-1">
                              {highlight.type || 'General Issue'}
                            </p>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {highlight.comment || highlight.text}
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                )
              })}

              {highlightedSections.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No issues found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="space-y-2 max-h-96 overflow-y-auto">
              {userAnnotations.length > 0 ? (
                userAnnotations.map((annotation) => (
                  <Button
                    key={annotation.id}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => onAnnotationClick && onAnnotationClick(annotation)}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {annotation.annotation_type}
                        </Badge>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {annotation.comment_text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(annotation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No annotations yet</p>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            <Eye className="h-3 w-3 mr-2" />
            Jump to Next Issue
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
            <TrendingUp className="h-3 w-3 mr-2" />
            Focus High Risk
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}