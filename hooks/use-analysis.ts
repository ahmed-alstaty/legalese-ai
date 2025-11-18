'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnalysisResult, UserAnnotation } from '@/types/database'

export interface AnalysisData {
  id: string
  documentId: string
  document: {
    id: string
    filename: string
    document_type: string
    created_at: string
  }
  status?: string
  summary: string
  keyObligations: string[]
  riskAssessment: {
    termination: number
    liability: number
    intellectualProperty: number
    payment: number
    renewal: number
  }
  highlightedSections: any[]
  aiComments: any[]
  documentStructure: any
  documentContent?: string
  userAnnotations?: UserAnnotation[]
  confidenceScore: number
  processingTime: number
  modelUsed: string
  createdAt: string
  chatConversation?: any
}

interface UseAnalysisOptions {
  includeContent?: boolean
  includeAnnotations?: boolean
  includeChat?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseAnalysisReturn {
  data: AnalysisData | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  addAnnotation: (textStart: number, textEnd: number, commentText: string, annotationType?: string) => Promise<UserAnnotation | null>
  updateAnnotation: (annotation: UserAnnotation, commentText: string, annotationType?: string) => Promise<UserAnnotation | null>
  deleteAnnotation: (annotation: UserAnnotation) => Promise<boolean>
  exportAnalysis: () => Promise<Blob | null>
}

export function useAnalysis(analysisId: string | null, options: UseAnalysisOptions = {}): UseAnalysisReturn {
  const {
    includeContent = true,
    includeAnnotations = true,
    includeChat = false,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options

  const [data, setData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalysis = useCallback(async () => {
    if (!analysisId) {
      setData(null)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (includeContent) params.set('include_content', 'true')
      if (includeAnnotations) params.set('include_annotations', 'true')
      if (includeChat) params.set('include_chat', 'true')

      const response = await fetch(`/api/analyses/${analysisId}?${params.toString()}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Analysis not found')
        }
        if (response.status === 401) {
          throw new Error('Unauthorized access')
        }
        throw new Error(`Failed to fetch analysis: ${response.statusText}`)
      }

      const analysisData = await response.json()
      setData(analysisData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Error fetching analysis:', err)
    } finally {
      setLoading(false)
    }
  }, [analysisId, includeContent, includeAnnotations, includeChat])

  // Initial fetch and setup auto-refresh
  useEffect(() => {
    fetchAnalysis()

    let intervalId: NodeJS.Timeout | null = null

    if (autoRefresh && analysisId) {
      intervalId = setInterval(fetchAnalysis, refreshInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [fetchAnalysis, autoRefresh, refreshInterval, analysisId])

  const addAnnotation = useCallback(async (
    textStart: number,
    textEnd: number,
    commentText: string,
    annotationType = 'note'
  ): Promise<UserAnnotation | null> => {
    if (!analysisId) {
      setError('No analysis ID provided')
      return null
    }

    try {
      setError(null)

      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_annotation',
          data: {
            textStart,
            textEnd,
            commentText,
            annotationType,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to add annotation: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success && result.annotation) {
        // Update local data with new annotation
        setData(prevData => {
          if (!prevData) return null
          
          return {
            ...prevData,
            userAnnotations: [
              ...(prevData.userAnnotations || []),
              result.annotation
            ]
          }
        })

        return result.annotation
      }

      throw new Error(result.message || 'Failed to add annotation')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add annotation'
      setError(errorMessage)
      console.error('Error adding annotation:', err)
      return null
    }
  }, [analysisId])

  const updateAnnotation = useCallback(async (
    annotation: UserAnnotation,
    commentText: string,
    annotationType?: string
  ): Promise<UserAnnotation | null> => {
    if (!analysisId) {
      setError('No analysis ID provided')
      return null
    }

    try {
      setError(null)

      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_annotation',
          data: {
            annotationId: annotation.id,
            commentText,
            annotationType,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update annotation: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success && result.annotation) {
        // Update local data
        setData(prevData => {
          if (!prevData) return null
          
          return {
            ...prevData,
            userAnnotations: (prevData.userAnnotations || []).map(ann =>
              ann.id === annotation.id ? result.annotation : ann
            )
          }
        })

        return result.annotation
      }

      throw new Error(result.message || 'Failed to update annotation')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update annotation'
      setError(errorMessage)
      console.error('Error updating annotation:', err)
      return null
    }
  }, [analysisId])

  const deleteAnnotation = useCallback(async (annotation: UserAnnotation): Promise<boolean> => {
    if (!analysisId) {
      setError('No analysis ID provided')
      return false
    }

    try {
      setError(null)

      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_annotation',
          data: {
            annotationId: annotation.id,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete annotation: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Update local data
        setData(prevData => {
          if (!prevData) return null
          
          return {
            ...prevData,
            userAnnotations: (prevData.userAnnotations || []).filter(
              ann => ann.id !== annotation.id
            )
          }
        })

        return true
      }

      throw new Error(result.message || 'Failed to delete annotation')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete annotation'
      setError(errorMessage)
      console.error('Error deleting annotation:', err)
      return false
    }
  }, [analysisId])

  const exportAnalysis = useCallback(async (): Promise<Blob | null> => {
    if (!data) {
      setError('No analysis data to export')
      return null
    }

    try {
      setError(null)

      // Create a comprehensive export object
      const exportData = {
        document: data.document,
        analysis: {
          id: data.id,
          summary: data.summary,
          keyObligations: data.keyObligations,
          riskAssessment: data.riskAssessment,
          confidenceScore: data.confidenceScore,
          processingTime: data.processingTime,
          modelUsed: data.modelUsed,
          createdAt: data.createdAt,
        },
        highlightedSections: data.highlightedSections,
        aiComments: data.aiComments,
        userAnnotations: data.userAnnotations,
        documentStructure: data.documentStructure,
        documentContent: data.documentContent,
        exportedAt: new Date().toISOString(),
      }

      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })

      return blob
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export analysis'
      setError(errorMessage)
      console.error('Error exporting analysis:', err)
      return null
    }
  }, [data])

  return {
    data,
    loading,
    error,
    refetch: fetchAnalysis,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    exportAnalysis,
  }
}