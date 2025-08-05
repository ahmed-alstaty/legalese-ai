'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import DocumentViewer from '@/components/document-viewer/document-viewer'
import { ChatWidget } from '@/components/chat/chat-widget'
import { useAnalysis } from '@/hooks/use-analysis'
import { ArrowLeft, FileText, Calendar, Clock, Brain, AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function AnalysisPage({ params }: PageProps) {
  const [analysisId, setAnalysisId] = useState<string | null>(null)
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
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
  } = useAnalysis(analysisId, {
    includeContent: true,
    includeAnnotations: true,
    includeChat: false,
  })

  const handleRetry = () => {
    refetch()
  }

  const handleGoBack = () => {
    router.push('/dashboard')
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // No data state
  if (!analysis) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Analysis not found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Calculate overall risk score
  const overallRisk = Object.values(analysis.riskAssessment).reduce((sum, risk) => sum + risk, 0) / Object.values(analysis.riskAssessment).length

  const getRiskLevel = (score: number) => {
    if (score >= 7) return { level: 'High', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' }
    if (score >= 4) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' }
    return { level: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' }
  }

  const riskLevel = getRiskLevel(overallRisk)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container mx-auto p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleGoBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div className="hidden lg:block w-px h-6 bg-border" />
              
              <div>
                <h1 className="text-2xl font-bold">{analysis.document.filename}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{analysis.document.document_type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{analysis.processingTime}s processing time</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  {analysis.modelUsed}
                </span>
              </div>
              
              <Badge className={riskLevel.color}>
                {riskLevel.level} Risk
              </Badge>
              
              <Badge variant="outline">
                {Math.round(analysis.confidenceScore * 100)}% Confidence
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      {analysis.summary && (
        <div className="border-b bg-muted/30">
          <div className="container mx-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{analysis.summary}</p>
                
                {analysis.keyObligations && analysis.keyObligations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Key Obligations:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {analysis.keyObligations.map((obligation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground mt-1">•</span>
                          <span>{obligation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Document Viewer */}
      <div className="flex-1">
        <DocumentViewer
          documentContent={analysis.documentContent || ''}
          document={analysis.document}
          riskAssessment={analysis.riskAssessment}
          highlightedSections={analysis.highlightedSections || []}
          aiComments={analysis.aiComments || []}
          userAnnotations={analysis.userAnnotations || []}
          confidenceScore={analysis.confidenceScore}
          summary={analysis.summary}
          keyObligations={analysis.keyObligations}
          onAddAnnotation={addAnnotation}
          onUpdateAnnotation={updateAnnotation}
          onDeleteAnnotation={deleteAnnotation}
          className="h-[calc(100vh-200px)]"
        />
      </div>

      {/* Chat Widget */}
      <ChatWidget analysisId={analysisId || ''} />
    </div>
  )
}