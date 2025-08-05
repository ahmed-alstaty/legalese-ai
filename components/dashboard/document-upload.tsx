'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight
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
  const router = useRouter()
  const supabase = createClient()

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
    const validFiles = fileList.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
      const maxSize = 10 * 1024 * 1024 // 10MB
      
      return validTypes.includes(file.type) && file.size <= maxSize
    })

    if (validFiles.length !== fileList.length) {
      // Show error for invalid files
      console.warn('Some files were rejected. Only PDF, DOC, DOCX, and TXT files under 10MB are allowed.')
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

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
      case 'analyzing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
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
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            Upload PDF, DOC, DOCX, or TXT files for AI analysis. Maximum file size: 10MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={isUploading}
            />
            <Button asChild disabled={isUploading}>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file) => (
              <div key={file.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <FileText className="h-8 w-8 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.file.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(file.status)}
                      <span className="text-xs text-gray-500">
                        {getStatusText(file.status)}
                      </span>
                      {file.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => analyzeDocument(file)}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          Analyze Now
                        </Button>
                      )}
                      {file.status !== 'uploading' && file.status !== 'processing' && file.status !== 'analyzing' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{(file.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{file.file.type}</span>
                  </div>
                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <Progress value={file.progress} className="mt-2" />
                  )}
                  {file.status === 'error' && file.error && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{file.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Success Card for Completed Uploads */}
      {files.some(f => f.status === 'completed') && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Upload successful! Your documents are ready for AI analysis.
              </span>
              <Button 
                variant="link"
                onClick={() => router.push('/dashboard')}
                className="text-green-700 hover:text-green-800"
              >
                View All Documents
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <p className="text-sm mt-2 text-green-700">
              Click "Analyze Now" on any document above to start the AI analysis immediately.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}