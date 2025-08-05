'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { UserAnnotation } from '@/types/database'
import { MessageSquare, HelpCircle, AlertTriangle, Trash2, Edit } from 'lucide-react'

interface AnnotationDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (commentText: string, annotationType: string) => Promise<void>
  onUpdate?: (annotation: UserAnnotation, commentText: string, annotationType: string) => Promise<void>
  onDelete?: (annotation: UserAnnotation) => Promise<void>
  selectedText?: string
  existingAnnotation?: UserAnnotation | null
  isLoading?: boolean
}

const annotationTypes = [
  {
    value: 'note',
    label: 'Note',
    icon: MessageSquare,
    description: 'General comment or observation',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
  },
  {
    value: 'question',
    label: 'Question',
    icon: HelpCircle,
    description: 'Something that needs clarification',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
  },
  {
    value: 'important',
    label: 'Important',
    icon: AlertTriangle,
    description: 'Critical point or concern',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
  }
]

export default function AnnotationDialog({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  selectedText,
  existingAnnotation,
  isLoading = false
}: AnnotationDialogProps) {
  const [commentText, setCommentText] = useState('')
  const [annotationType, setAnnotationType] = useState('note')
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>('create')

  const isEditing = mode === 'edit'
  const isViewing = mode === 'view'

  // Reset form when dialog opens/closes or annotation changes
  useEffect(() => {
    if (isOpen) {
      if (existingAnnotation) {
        setCommentText(existingAnnotation.comment_text)
        setAnnotationType(existingAnnotation.annotation_type)
        setMode('view')
      } else {
        setCommentText('')
        setAnnotationType('note')
        setMode('create')
      }
    }
  }, [isOpen, existingAnnotation])

  const handleSave = async () => {
    if (!commentText.trim()) return

    try {
      if (existingAnnotation && onUpdate) {
        await onUpdate(existingAnnotation, commentText.trim(), annotationType)
      } else {
        await onSave(commentText.trim(), annotationType)
      }
      onClose()
    } catch (error) {
      console.error('Error saving annotation:', error)
    }
  }

  const handleDelete = async () => {
    if (existingAnnotation && onDelete) {
      try {
        await onDelete(existingAnnotation)
        onClose()
      } catch (error) {
        console.error('Error deleting annotation:', error)
      }
    }
  }

  const selectedAnnotationType = annotationTypes.find(type => type.value === annotationType)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedAnnotationType && (
              <selectedAnnotationType.icon className="h-5 w-5" />
            )}
            {existingAnnotation ? (
              isEditing ? 'Edit Annotation' : 'View Annotation'
            ) : (
              'Add Annotation'
            )}
          </DialogTitle>
          {selectedText && (
            <DialogDescription>
              <div className="mt-2">
                <Label className="text-sm font-medium">Selected text:</Label>
                <div className="mt-1 p-2 bg-muted rounded-md text-sm italic">
                  "{selectedText.length > 100 ? `${selectedText.substring(0, 100)}...` : selectedText}"
                </div>
              </div>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4">
          {/* Annotation Type */}
          <div>
            <Label htmlFor="annotation-type" className="text-sm font-medium">
              Type
            </Label>
            <Select 
              value={annotationType} 
              onValueChange={setAnnotationType}
              disabled={isViewing && !isEditing}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {annotationTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {selectedAnnotationType && (
              <Badge className={`mt-2 ${selectedAnnotationType.color}`}>
                {selectedAnnotationType.label}
              </Badge>
            )}
          </div>

          {/* Comment Text */}
          <div>
            <Label htmlFor="comment-text" className="text-sm font-medium">
              Comment
            </Label>
            <Textarea
              id="comment-text"
              placeholder="Enter your comment or note..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="mt-1 min-h-[100px]"
              disabled={isViewing && !isEditing}
            />
          </div>

          {/* Existing annotation metadata */}
          {existingAnnotation && (
            <div className="pt-2 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Created: {new Date(existingAnnotation.created_at).toLocaleString()}</div>
                {existingAnnotation.updated_at !== existingAnnotation.created_at && (
                  <div>Updated: {new Date(existingAnnotation.updated_at).toLocaleString()}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex gap-2">
            {existingAnnotation && onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            
            {existingAnnotation ? (
              <>
                {isViewing && (
                  <Button 
                    variant="outline" 
                    onClick={() => setMode('edit')}
                    disabled={isLoading}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                {isEditing && (
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || !commentText.trim()}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={handleSave}
                disabled={isLoading || !commentText.trim()}
              >
                {isLoading ? 'Adding...' : 'Add Annotation'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}