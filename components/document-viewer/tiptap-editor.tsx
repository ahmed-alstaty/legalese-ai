'use client'

import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { RiskHighlight, UserAnnotation, TextSelectionExtension } from '@/lib/tiptap-extensions'
import { HighlightedSection, AIComment, UserAnnotation as UserAnnotationType } from '@/types/database'
import { cn } from '@/lib/utils'

interface TipTapEditorProps {
  content: string
  highlightedSections: HighlightedSection[]
  aiComments: AIComment[]
  userAnnotations: UserAnnotationType[]
  isReadOnly?: boolean
  className?: string
  onHighlightClick?: (highlight: HighlightedSection) => void
  onAnnotationClick?: (annotation: UserAnnotationType) => void
  onTextSelect?: (selection: { from: number; to: number; text: string; event: MouseEvent }) => void
}

export interface TipTapEditorRef {
  scrollToHighlight: (sectionId: string) => void
  scrollToAnnotation: (annotationId: string) => void
  addUserAnnotation: (from: number, to: number, annotationId: string, type?: string) => void
  removeUserAnnotation: (annotationId: string) => void
  exportAsText: () => string
  exportAsHtml: () => string
}

const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(({
  content,
  highlightedSections,
  aiComments,
  userAnnotations,
  isReadOnly = true,
  className,
  onHighlightClick,
  onAnnotationClick,
  onTextSelect
}, ref) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure client-side only rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Document content will appear here...',
      }),
      RiskHighlight,
      UserAnnotation,
      TextSelectionExtension,
    ],
    content: '',
    editable: !isReadOnly,
    immediatelyRender: false, // Fix SSR hydration issue
    onCreate: ({ editor }) => {
      // Apply initial content and highlights
      applyContentAndHighlights()
      setIsInitialized(true)
    },
    onUpdate: ({ editor }) => {
      // Handle content updates if not read-only
    },
  })

  // Apply content and highlights to the editor
  const applyContentAndHighlights = () => {
    if (!editor) return

    // Set the base content
    editor.commands.setContent(content)

    // Apply risk highlights
    highlightedSections.forEach((section, index) => {
      const sectionId = `highlight-${index}`
      
      // Find the text positions in the editor
      const from = section.startPosition
      const to = section.endPosition

      if (from >= 0 && to > from) {
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .setRiskHighlight({
            riskLevel: section.severity,
            sectionId,
            commentId: `comment-${index}`
          })
          .run()
      }
    })

    // Apply user annotations
    userAnnotations.forEach((annotation) => {
      const from = annotation.text_start
      const to = annotation.text_end

      if (from >= 0 && to > from) {
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .setUserAnnotation({
            annotationId: annotation.id,
            type: annotation.annotation_type
          })
          .run()
      }
    })

    // Clear selection
    editor.commands.blur()
  }

  // Re-apply highlights when data changes
  useEffect(() => {
    if (editor && isInitialized) {
      applyContentAndHighlights()
    }
  }, [highlightedSections, userAnnotations, content, editor, isInitialized])

  // Handle highlight clicks
  useEffect(() => {
    const handleHighlightClick = (event: CustomEvent) => {
      const { sectionId, riskLevel } = event.detail
      
      if (onHighlightClick) {
        // Find the corresponding highlighted section
        const sectionIndex = parseInt(sectionId.replace('highlight-', ''))
        const section = highlightedSections[sectionIndex]
        
        if (section) {
          onHighlightClick(section)
        }
      }
    }

    document.addEventListener('highlightClick', handleHighlightClick as EventListener)
    
    return () => {
      document.removeEventListener('highlightClick', handleHighlightClick as EventListener)
    }
  }, [highlightedSections, onHighlightClick])

  // Handle annotation clicks
  useEffect(() => {
    const handleAnnotationClick = (event: CustomEvent) => {
      const { annotationId } = event.detail
      
      if (onAnnotationClick) {
        const annotation = userAnnotations.find(a => a.id === annotationId)
        
        if (annotation) {
          onAnnotationClick(annotation)
        }
      }
    }

    document.addEventListener('annotationClick', handleAnnotationClick as EventListener)
    
    return () => {
      document.removeEventListener('annotationClick', handleAnnotationClick as EventListener)
    }
  }, [userAnnotations, onAnnotationClick])

  // Handle text selection for creating annotations
  useEffect(() => {
    const handleTextSelected = (event: CustomEvent) => {
      const { from, to, text, event: mouseEvent } = event.detail
      
      if (onTextSelect && !isReadOnly) {
        onTextSelect({ from, to, text, event: mouseEvent })
      }
    }

    document.addEventListener('textSelected', handleTextSelected as EventListener)
    
    return () => {
      document.removeEventListener('textSelected', handleTextSelected as EventListener)
    }
  }, [onTextSelect, isReadOnly])

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    scrollToHighlight: (sectionId: string) => {
      const element = document.querySelector(`mark[data-section-id="${sectionId}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add temporary highlight effect
        element.classList.add('ring-2', 'ring-blue-400', 'ring-opacity-50')
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-50')
        }, 2000)
      }
    },

    scrollToAnnotation: (annotationId: string) => {
      const element = document.querySelector(`span[data-annotation-id="${annotationId}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add temporary highlight effect
        element.classList.add('ring-2', 'ring-blue-400', 'ring-opacity-50')
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-50')
        }, 2000)
      }
    },

    addUserAnnotation: (from: number, to: number, annotationId: string, type = 'note') => {
      if (editor) {
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .setUserAnnotation({ annotationId, type })
          .run()
      }
    },

    removeUserAnnotation: (annotationId: string) => {
      if (editor) {
        // Find and remove the annotation mark
        const doc = editor.state.doc
        let foundPos: { from: number; to: number } | null = null

        doc.descendants((node, pos) => {
          if (foundPos) return false
          
          node.marks.forEach(mark => {
            if (mark.type.name === 'userAnnotation' && mark.attrs.annotationId === annotationId) {
              foundPos = { from: pos, to: pos + node.nodeSize }
            }
          })
        })

        if (foundPos) {
          editor.chain()
            .focus()
            .setTextSelection(foundPos)
            .unsetUserAnnotation()
            .run()
        }
      }
    },

    exportAsText: () => {
      return editor?.getText() || ''
    },

    exportAsHtml: () => {
      return editor?.getHTML() || ''
    },
  }))

  // Don't render on server side
  if (!isMounted) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-sm text-muted-foreground">Loading editor...</span>
      </div>
    )
  }

  if (!editor) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-sm text-muted-foreground">Loading editor...</span>
      </div>
    )
  }

  return (
    <div className={cn('tiptap-editor-wrapper', className)}>
      <EditorContent 
        editor={editor} 
        className={cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none',
          'focus:outline-none',
          '[&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:p-4',
          '[&_.ProseMirror]:focus:outline-none',
          // Risk highlight styles are handled by the extensions
          className
        )}
      />
      
      {/* Loading overlay */}
      {!isInitialized && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      )}
    </div>
  )
})

TipTapEditor.displayName = 'TipTapEditor'

export default TipTapEditor