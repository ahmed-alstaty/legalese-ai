'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import TipTapEditor, { TipTapEditorRef } from './tiptap-editor'
import RiskSidebar from './risk-sidebar'
import AIComments from './ai-comments'
import AnnotationDialog from './annotation-dialog'
import { HighlightedSection, AIComment, UserAnnotation } from '@/types/database'
import { 
  Download,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquarePlus,
  Menu,
  X,
  Loader2,
  AlertCircle,
  FileDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentViewerProps {
  documentContent: string
  document: {
    id: string
    filename: string
    document_type: string
    created_at: string
  }
  riskAssessment: {
    termination: number
    liability: number
    intellectualProperty: number
    payment: number
    renewal: number
  }
  highlightedSections: HighlightedSection[]
  aiComments: AIComment[]
  userAnnotations: UserAnnotation[]
  confidenceScore: number
  summary?: string
  keyObligations?: string[]
  onAddAnnotation: (textStart: number, textEnd: number, commentText: string, annotationType?: string) => Promise<UserAnnotation | null>
  onUpdateAnnotation: (annotation: UserAnnotation, commentText: string, annotationType?: string) => Promise<UserAnnotation | null>
  onDeleteAnnotation: (annotation: UserAnnotation) => Promise<boolean>
  isLoading?: boolean
  className?: string
}

type SidebarView = 'risk' | 'comments' | 'closed'

export default function DocumentViewer({
  documentContent,
  document,
  riskAssessment,
  highlightedSections,
  aiComments,
  userAnnotations,
  confidenceScore,
  summary,
  keyObligations,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  isLoading = false,
  className
}: DocumentViewerProps) {
  const [sidebarView, setSidebarView] = useState<SidebarView>('risk')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [selectedText, setSelectedText] = useState<{ text: string; from: number; to: number } | null>(null)
  const [selectedAnnotation, setSelectedAnnotation] = useState<UserAnnotation | null>(null)
  const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false)
  const [isAnnotationLoading, setIsAnnotationLoading] = useState(false)
  
  const editorRef = useRef<TipTapEditorRef>(null)
  const { toast } = useToast()

  // Handle text selection for annotations
  const handleTextSelect = useCallback((selection: { from: number; to: number; text: string; event: MouseEvent }) => {
    if (selection.text.trim().length > 0) {
      setSelectedText({
        text: selection.text,
        from: selection.from,
        to: selection.to
      })
      setSelectedAnnotation(null)
      setIsAnnotationDialogOpen(true)
    }
  }, [])

  // Handle highlight clicks
  const handleHighlightClick = useCallback((highlight: HighlightedSection) => {
    // Scroll to highlight and show it in sidebar
    const sectionId = `highlight-${highlightedSections.indexOf(highlight)}`
    editorRef.current?.scrollToHighlight(sectionId)
    
    if (sidebarView === 'closed') {
      setSidebarView('risk')
    }
    
    toast({
      title: 'Highlight Selected',
      description: highlight.comment || 'Navigated to highlighted section',
    })
  }, [highlightedSections, sidebarView, toast])

  // Handle annotation clicks
  const handleAnnotationClick = useCallback((annotation: UserAnnotation) => {
    setSelectedAnnotation(annotation)
    setSelectedText(null)
    setIsAnnotationDialogOpen(true)
    
    editorRef.current?.scrollToAnnotation(annotation.id)
  }, [])

  // Handle AI comment clicks
  const handleAICommentClick = useCallback((comment: AIComment) => {
    // Find corresponding highlight and navigate to it
    const correspondingHighlight = highlightedSections.find(
      section => section.startPosition <= comment.position && section.endPosition >= comment.position
    )
    
    if (correspondingHighlight) {
      handleHighlightClick(correspondingHighlight)
    }
  }, [highlightedSections, handleHighlightClick])

  // Add annotation
  const handleAddAnnotation = async (commentText: string, annotationType: string) => {
    if (!selectedText) return

    setIsAnnotationLoading(true)
    try {
      const annotation = await onAddAnnotation(
        selectedText.from,
        selectedText.to,
        commentText,
        annotationType
      )

      if (annotation) {
        // Add annotation to editor
        editorRef.current?.addUserAnnotation(
          selectedText.from,
          selectedText.to,
          annotation.id,
          annotationType
        )

        toast({
          title: 'Annotation Added',
          description: 'Your annotation has been saved successfully.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add annotation. Please try again.',
      })
    } finally {
      setIsAnnotationLoading(false)
    }
  }

  // Update annotation
  const handleUpdateAnnotation = async (annotation: UserAnnotation, commentText: string, annotationType: string) => {
    setIsAnnotationLoading(true)
    try {
      const updatedAnnotation = await onUpdateAnnotation(annotation, commentText, annotationType)

      if (updatedAnnotation) {
        toast({
          title: 'Annotation Updated',
          description: 'Your annotation has been updated successfully.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update annotation. Please try again.',
      })
    } finally {
      setIsAnnotationLoading(false)
    }
  }

  // Delete annotation
  const handleDeleteAnnotation = async (annotation: UserAnnotation) => {
    setIsAnnotationLoading(true)
    try {
      const success = await onDeleteAnnotation(annotation)

      if (success) {
        // Remove annotation from editor
        editorRef.current?.removeUserAnnotation(annotation.id)

        toast({
          title: 'Annotation Deleted',
          description: 'Your annotation has been removed.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete annotation. Please try again.',
      })
    } finally {
      setIsAnnotationLoading(false)
    }
  }

  // Export functions
  const handleExportPDF = useCallback(async () => {
    try {
      // Dynamic import to avoid SSR issues
      const jsPDF = (await import('jspdf')).default
      const html2canvas = (await import('html2canvas')).default

      // Get the editor content element
      const editorElement = window.document.querySelector('.tiptap-editor-wrapper .ProseMirror')
      if (!editorElement) {
        toast({
          variant: 'destructive',
          title: 'Export Error',
          description: 'Could not find document content to export.',
        })
        return
      }

      toast({
        title: 'Generating PDF',
        description: 'Please wait while we prepare your document...',
      })

      // Create canvas from the editor content
      const canvas = await html2canvas(editorElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: editorElement.scrollWidth,
        height: editorElement.scrollHeight,
      })

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      // Calculate dimensions to fit the page
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Add image to PDF, splitting into multiple pages if necessary
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Add metadata
      pdf.setProperties({
        title: `${document.filename} - Analysis`,
        subject: 'Legal Document Analysis',
        author: 'Legalese AI',
        creator: 'Legalese AI Platform',
      })

      // Save the PDF
      pdf.save(`${document.filename.replace(/\.[^/.]+$/, '')}_analysis.pdf`)

      toast({
        title: 'Export Complete',
        description: 'Document exported as PDF successfully.',
      })
    } catch (error) {
      console.error('PDF export error:', error)
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Failed to generate PDF. Please try again.',
      })
    }
  }, [document.filename, toast])

  const handleExportText = useCallback(() => {
    const text = editorRef.current?.exportAsText()
    if (text) {
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = `${document.filename.replace(/\.[^/.]+$/, '')}_analysis.txt`
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: 'Export Complete',
        description: 'Document exported as text file.',
      })
    }
  }, [document.filename, toast])

  const handleExportHTML = useCallback(() => {
    const html = editorRef.current?.exportAsHtml()
    if (html) {
      const fullHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${document.filename} - Analysis</title>
          <meta charset="utf-8">
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; margin: 2rem; }
            .risk-highlight { padding: 2px 4px; border-radius: 3px; }
            .user-annotation { padding: 2px 4px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <h1>${document.filename} - Analysis</h1>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          ${html}
        </body>
        </html>
      `
      
      const blob = new Blob([fullHTML], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = `${document.filename.replace(/\.[^/.]+$/, '')}_analysis.html`
      window.document.body.appendChild(a)
      a.click()
      window.document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: 'Export Complete',
        description: 'Document exported as HTML file.',
      })
    }
  }, [document.filename, toast])

  const sidebarContent = {
    risk: (
      <RiskSidebar
        riskAssessment={riskAssessment}
        highlightedSections={highlightedSections}
        userAnnotations={userAnnotations}
        confidenceScore={confidenceScore}
        onHighlightClick={handleHighlightClick}
        onAnnotationClick={handleAnnotationClick}
      />
    ),
    comments: (
      <AIComments
        aiComments={aiComments}
        highlightedSections={highlightedSections}
        onCommentClick={handleAICommentClick}
        onHighlightClick={handleHighlightClick}
      />
    )
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center min-h-[400px]', className)}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading document analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex h-full', className)}>
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <div>
                <h1 className="text-lg font-semibold">{document.filename}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{document.document_type}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{new Date(document.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Export dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportText}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Text
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportHTML}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as HTML
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sidebar toggle */}
              <div className="hidden lg:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarView(sidebarView === 'closed' ? 'risk' : 'closed')}
                >
                  {sidebarView === 'closed' ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <Badge variant="outline">
              {highlightedSections.length} Issues Found
            </Badge>
            <Badge variant="outline">
              {userAnnotations.length} Annotations
            </Badge>
            <Badge variant="outline">
              {Math.round(confidenceScore * 100)}% Confidence
            </Badge>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <TipTapEditor
            ref={editorRef}
            content={documentContent}
            highlightedSections={highlightedSections}
            aiComments={aiComments}
            userAnnotations={userAnnotations}
            onHighlightClick={handleHighlightClick}
            onAnnotationClick={handleAnnotationClick}
            onTextSelect={handleTextSelect}
            className="h-full"
          />
        </div>
      </div>

      {/* Sidebar */}
      {sidebarView !== 'closed' && (
        <div className={cn(
          'w-80 border-l bg-background flex flex-col',
          'fixed inset-y-0 right-0 z-50 lg:relative lg:z-auto',
          'transform transition-transform duration-300 ease-in-out',
          isMobileSidebarOpen 
            ? 'translate-x-0' 
            : 'translate-x-full lg:translate-x-0'
        )}>
          {/* Sidebar header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={sidebarView === 'risk' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSidebarView('risk')}
                >
                  Risk
                </Button>
                <Button
                  variant={sidebarView === 'comments' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSidebarView('comments')}
                >
                  AI Comments
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSidebarView('closed')
                  setIsMobileSidebarOpen(false)
                }}
                className="lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-4">
            {sidebarContent[sidebarView]}
          </div>
        </div>
      )}

      {/* Annotation Dialog */}
      <AnnotationDialog
        isOpen={isAnnotationDialogOpen}
        onClose={() => {
          setIsAnnotationDialogOpen(false)
          setSelectedText(null)
          setSelectedAnnotation(null)
        }}
        onSave={handleAddAnnotation}
        onUpdate={handleUpdateAnnotation}
        onDelete={handleDeleteAnnotation}
        selectedText={selectedText?.text}
        existingAnnotation={selectedAnnotation}
        isLoading={isAnnotationLoading}
      />
    </div>
  )
}