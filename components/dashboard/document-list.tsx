'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DocumentListSkeleton } from '@/components/ui/skeleton-loaders'
import { 
  FileText, 
  Calendar, 
  Download, 
  Eye, 
  Trash2, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload as UploadIcon
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Document } from '@/types/database'

interface DocumentWithAnalysis extends Document {
  analysis_count?: number
}

export function DocumentList() {
  const [documents, setDocuments] = useState<DocumentWithAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          analyses(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to include analysis count
      const documentsWithAnalysis = data?.map(doc => ({
        ...doc,
        analysis_count: doc.analyses?.[0]?.count || 0
      })) || []

      setDocuments(documentsWithAnalysis)
    } catch (error: any) {
      console.error('Error fetching documents:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? All related analyses will also be deleted.')) return

    try {
      setDeletingId(documentId)
      
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error

      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    } catch (error: any) {
      console.error('Error deleting document:', error)
      setError(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleAnalyze = async (documentId: string) => {
    try {
      setAnalyzingId(documentId)
      setError(null)
      
      // First trigger the analysis
      const response = await fetch(`/api/documents/${documentId}/analyze`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Analysis API error:', error)
        throw new Error(error.message || error.error || 'Failed to start analysis')
      }

      const result = await response.json()
      
      // Then navigate to the analysis page
      router.push(`/analysis/${result.analysis.id}`)
    } catch (error: any) {
      console.error('Error starting analysis:', error)
      setError(error.message)
      setAnalyzingId(null)
    }
  }

  const handleView = async (documentId: string) => {
    try {
      setViewingId(documentId)
      
      // Find the analysis for this document
      const { data: analyses, error } = await supabase
        .from('analyses')
        .select('id')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !analyses) {
        // If no analysis exists, trigger analysis first
        await handleAnalyze(documentId)
      } else {
        // Navigate to the analysis page
        router.push(`/analysis/${analyses.id}`)
      }
    } catch (error) {
      console.error('Error viewing document:', error)
      setError('Failed to view document')
    } finally {
      setViewingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
          <Clock className="h-3 w-3 mr-1" />
          Ready
        </Badge>
      case 'processing':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
          <UploadIcon className="h-3 w-3 mr-1" />
          Processing
        </Badge>
      case 'analyzed':
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Analyzed
        </Badge>
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
          <AlertCircle className="h-3 w-3 mr-1" />
          Error
        </Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDocumentIcon = (type: string) => {
    // You could extend this to show different icons for different document types
    return <FileText className="h-5 w-5 text-gray-400" />
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <DocumentListSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          {error.includes('OpenAI') && (
            <p className="text-sm text-gray-600 mb-4">
              Please ensure you have added your OPENAI_API_KEY to the .env.local file
            </p>
          )}
          <Button onClick={fetchDocuments} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>
            {documents.length === 0 
              ? 'No documents uploaded yet' 
              : `${documents.length} ${documents.length === 1 ? 'document' : 'documents'} uploaded`
            }
          </CardDescription>
        </div>
        <Button onClick={() => window.location.href = '/dashboard?tab=upload'}>
          <UploadIcon className="h-4 w-4 mr-2" />
          Upload New
        </Button>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-500 mb-6">
              Upload your first legal document to get started with AI analysis
            </p>
            <Button onClick={() => window.location.href = '/dashboard?tab=upload'}>
              Upload Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <div key={document.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  {getDocumentIcon(document.document_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {document.filename}
                    </h4>
                    {getStatusBadge(document.status)}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(document.created_at)}
                    </span>
                    <span>{formatFileSize(document.file_size)}</span>
                    <span className="capitalize">{document.document_type}</span>
                    {document.analysis_count && document.analysis_count > 0 && (
                      <span className="text-green-600">
                        {document.analysis_count} analysis{document.analysis_count !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {document.status === 'uploaded' && (
                    <LoadingButton
                      size="sm"
                      onClick={() => handleAnalyze(document.id)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                      isLoading={analyzingId === document.id}
                      loadingText="Analyzing..."
                    >
                      Analyze
                    </LoadingButton>
                  )}
                  
                  {document.status === 'analyzed' && (
                    <LoadingButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(document.id)}
                      isLoading={viewingId === document.id}
                      loadingText="Loading..."
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </LoadingButton>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(document.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(document.id)}
                        className="text-red-600 hover:bg-red-50 focus:bg-red-50"
                        disabled={deletingId === document.id}
                      >
                        {deletingId === document.id ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}