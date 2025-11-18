'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react'

interface UploadedFile {
  file: File
  id: string
  documentId?: string // Store the document ID from database
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'analyzing'
  error?: string
}

export function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [documentCount, setDocumentCount] = useState(0)
  const [userTier, setUserTier] = useState('free')
  const [limitReached, setLimitReached] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkDocumentLimit()
  }, [])

  const checkDocumentLimit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile with lifetime documents
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('subscription_tier, lifetime_documents_created')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserTier(profile.subscription_tier)
        
        // Use lifetime_documents_created for accurate tracking
        const docCount = profile.lifetime_documents_created || 0
        setDocumentCount(docCount)
        
        // Check if limit reached for free tier
        if (profile.subscription_tier === 'free' && docCount >= 3) {
          setLimitReached(true)
        }
      }
    } catch (error) {
      console.error('Error checking document limit:', error)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }, [])

  const handleFiles = async (fileList: File[]) => {
    // Check document limit for free tier
    if (userTier === 'free' && limitReached) {
      alert('You have reached the free trial limit of 3 documents. Please upgrade to continue.')
      return
    }

    if (userTier === 'free' && documentCount + fileList.length > 3) {
      alert(`You can only upload ${3 - documentCount} more document(s) in the free trial.`)
      return
    }

    const validFiles = fileList.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      return validTypes.includes(file.type) && file.size <= maxSize
    })

    if (validFiles.length !== fileList.length) {
      // Show error for invalid files
      alert('Some files were rejected. Only PDF, DOC, and DOCX files under 10MB are allowed.')
    }

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading'
    }))

    setFiles(prev => [...prev, ...newFiles])
    setIsUploading(true)

    // Upload files one by one
    for (const uploadFile of newFiles) {
      await uploadSingleFile(uploadFile)
    }

    setIsUploading(false)
  }

  const uploadSingleFile = async (uploadFile: UploadedFile) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Update progress
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, progress: 25 }
          : f
      ))

      // Upload file to Supabase Storage
      const fileName = `${user.id}/${uploadFile.id}-${uploadFile.file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, uploadFile.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Update progress
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, progress: 50, status: 'processing' }
          : f
      ))

      // Create document record in database
      const { data: documentRecord, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          filename: uploadFile.file.name,
          file_path: fileName,
          file_size: uploadFile.file.size,
          document_type: getDocumentType(uploadFile.file.type),
          status: 'uploaded'
        })
        .select()
        .single()

      if (dbError) throw dbError
      if (!documentRecord) throw new Error('Failed to create document record')

      // Update progress
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, progress: 75 }
          : f
      ))

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mark as completed with document ID
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, progress: 100, status: 'completed', documentId: documentRecord.id }
          : f
      ))

    } catch (error: any) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: error.message }
          : f
      ))
    }
  }

  const getDocumentType = (mimeType: string) => {
    switch (mimeType) {
      case 'application/pdf':
        return 'pdf'
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'word'
      case 'text/plain':
        return 'text'
      default:
        return 'other'
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const analyzeDocument = async (uploadFile: UploadedFile) => {
    if (!uploadFile.documentId) return

    try {
      // Update status to analyzing
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'analyzing' }
          : f
      ))

      // Trigger analysis
      const response = await fetch(`/api/documents/${uploadFile.documentId}/analyze`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || error.error || 'Failed to start analysis')
      }

      const result = await response.json()
      
      // Navigate to the analysis page
      router.push(`/analysis/${result.analysis.id}`)
    } catch (error: any) {
      console.error('Analysis error:', error)
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: error.message }
          : f
      ))
    }
  }


  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...'
      case 'processing':
        return 'Processing...'
      case 'analyzing':
        return 'Analyzing document...'
      case 'completed':
        return 'Ready for analysis'
      case 'error':
        return 'Upload failed'
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload Progress - Show at the top when files are being processed */}
      {files.length > 0 && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {files.some(f => f.status === 'uploading' || f.status === 'processing' || f.status === 'analyzing') ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    Processing Documents
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    Documents Ready
                  </>
                )}
              </CardTitle>
              <span className="text-sm text-gray-600">
                {files.filter(f => f.status === 'completed').length} of {files.length} ready
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {file.status === 'completed' ? (
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    ) : file.status === 'error' ? (
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                    ) : (
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.file.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB • {getDocumentType(file.file.type).toUpperCase()}
                        </p>
                      </div>
                      {file.status === 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => analyzeDocument(file)}
                          className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          Analyze Now
                        </Button>
                      )}
                      {file.status === 'error' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Status or Progress */}
                    {file.status === 'uploading' || file.status === 'processing' ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{getStatusText(file.status)}</span>
                          <span className="text-gray-600 font-medium">{file.progress}%</span>
                        </div>
                        <Progress value={file.progress} className="h-1.5" />
                      </div>
                    ) : file.status === 'analyzing' ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-indigo-100 rounded-full px-3 py-1">
                          <p className="text-xs font-medium text-indigo-700 animate-pulse">
                            AI is analyzing your document...
                          </p>
                        </div>
                      </div>
                    ) : file.status === 'completed' ? (
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 rounded-full px-3 py-1">
                          <p className="text-xs font-medium text-green-700">
                            ✓ Ready for analysis
                          </p>
                        </div>
                      </div>
                    ) : file.status === 'error' && file.error ? (
                      <Alert className="mt-2 py-2">
                        <AlertDescription className="text-xs">{file.error}</AlertDescription>
                      </Alert>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            {userTier === 'free' 
              ? `Free trial: ${3 - documentCount} of 3 documents remaining (lifetime limit)`
              : 'Upload PDF, DOC, or DOCX files for AI analysis. Maximum file size: 10MB.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {limitReached && userTier === 'free' && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Free trial limit reached!</strong> You've used all 3 free documents. 
                Upgrade to continue analyzing documents.
                <Button 
                  size="sm" 
                  className="ml-2 bg-red-600 hover:bg-red-700"
                  onClick={() => router.push('/pricing')}
                >
                  Upgrade Now
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragOver 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop your documents here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse your files
            </p>
            <div className="relative">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                id="file-upload"
                disabled={isUploading || (userTier === 'free' && limitReached)}
              />
              <Button 
                disabled={isUploading || (userTier === 'free' && limitReached)}
                className="relative z-0"
              >
                {userTier === 'free' && limitReached ? 'Limit Reached' : 'Choose Files'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}