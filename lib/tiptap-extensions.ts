import { Mark, Extension, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'

// Custom highlight extension with risk levels
export interface RiskHighlightOptions {
  multicolor: boolean
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    riskHighlight: {
      /**
       * Set a risk highlight mark
       */
      setRiskHighlight: (attributes?: { riskLevel: 'low' | 'medium' | 'high', commentId?: string, sectionId?: string }) => ReturnType
      /**
       * Toggle a risk highlight mark
       */
      toggleRiskHighlight: (attributes?: { riskLevel: 'low' | 'medium' | 'high', commentId?: string, sectionId?: string }) => ReturnType
      /**
       * Unset a risk highlight mark
       */
      unsetRiskHighlight: () => ReturnType
    }
  }
}

export const RiskHighlight = Mark.create<RiskHighlightOptions>({
  name: 'riskHighlight',

  addOptions() {
    return {
      multicolor: true,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      riskLevel: {
        default: 'medium',
        parseHTML: element => element.getAttribute('data-risk-level'),
        renderHTML: attributes => {
          if (!attributes.riskLevel) {
            return {}
          }

          return {
            'data-risk-level': attributes.riskLevel,
          }
        },
      },
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.commentId) {
            return {}
          }

          return {
            'data-comment-id': attributes.commentId,
          }
        },
      },
      sectionId: {
        default: null,
        parseHTML: element => element.getAttribute('data-section-id'),
        renderHTML: attributes => {
          if (!attributes.sectionId) {
            return {}
          }

          return {
            'data-section-id': attributes.sectionId,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'mark[data-risk-level]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const riskLevel = HTMLAttributes['data-risk-level'] || 'medium'
    const classes = {
      'low': 'bg-green-200 dark:bg-green-800/30 text-green-900 dark:text-green-100 border-b-2 border-green-400 dark:border-green-600',
      'medium': 'bg-yellow-200 dark:bg-yellow-800/30 text-yellow-900 dark:text-yellow-100 border-b-2 border-yellow-400 dark:border-yellow-600',
      'high': 'bg-red-200 dark:bg-red-800/30 text-red-900 dark:text-red-100 border-b-2 border-red-400 dark:border-red-600'
    }

    return [
      'mark',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          class: `risk-highlight cursor-pointer hover:opacity-80 transition-opacity ${classes[riskLevel as keyof typeof classes] || classes.medium}`,
        }
      ),
      0,
    ]
  },

  addCommands() {
    return {
      setRiskHighlight:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },

      toggleRiskHighlight:
        attributes =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes)
        },

      unsetRiskHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('riskHighlightClick'),
        props: {
          handleDOMEvents: {
            click: (view, event) => {
              const target = event.target as HTMLElement
              const mark = target.closest('mark[data-risk-level]')
              
              if (mark) {
                const commentId = mark.getAttribute('data-comment-id')
                const sectionId = mark.getAttribute('data-section-id')
                const riskLevel = mark.getAttribute('data-risk-level')
                
                // Dispatch custom event for highlight click
                const customEvent = new CustomEvent('highlightClick', {
                  detail: {
                    commentId,
                    sectionId,
                    riskLevel,
                    element: mark,
                  }
                })
                
                document.dispatchEvent(customEvent)
                return true
              }
              
              return false
            },
          },
        },
      }),
    ]
  },
})

// User annotation extension
export interface UserAnnotationOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    userAnnotation: {
      /**
       * Set a user annotation mark
       */
      setUserAnnotation: (attributes?: { annotationId: string, type?: string }) => ReturnType
      /**
       * Toggle a user annotation mark
       */
      toggleUserAnnotation: (attributes?: { annotationId: string, type?: string }) => ReturnType
      /**
       * Unset a user annotation mark
       */
      unsetUserAnnotation: () => ReturnType
    }
  }
}

export const UserAnnotation = Mark.create<UserAnnotationOptions>({
  name: 'userAnnotation',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      annotationId: {
        default: null,
        parseHTML: element => element.getAttribute('data-annotation-id'),
        renderHTML: attributes => {
          if (!attributes.annotationId) {
            return {}
          }

          return {
            'data-annotation-id': attributes.annotationId,
          }
        },
      },
      type: {
        default: 'note',
        parseHTML: element => element.getAttribute('data-annotation-type'),
        renderHTML: attributes => {
          if (!attributes.type) {
            return {}
          }

          return {
            'data-annotation-type': attributes.type,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-annotation-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes['data-annotation-type'] || 'note'
    const classes = {
      'note': 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-b-2 border-blue-400 dark:border-blue-600',
      'question': 'bg-purple-100 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 border-b-2 border-purple-400 dark:border-purple-600',
      'important': 'bg-orange-100 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100 border-b-2 border-orange-400 dark:border-orange-600'
    }

    return [
      'span',
      mergeAttributes(
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          class: `user-annotation cursor-pointer hover:opacity-80 transition-opacity ${classes[type as keyof typeof classes] || classes.note}`,
        }
      ),
      0,
    ]
  },

  addCommands() {
    return {
      setUserAnnotation:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },

      toggleUserAnnotation:
        attributes =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes)
        },

      unsetUserAnnotation:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('userAnnotationClick'),
        props: {
          handleDOMEvents: {
            click: (view, event) => {
              const target = event.target as HTMLElement
              const annotation = target.closest('span[data-annotation-id]')
              
              if (annotation) {
                const annotationId = annotation.getAttribute('data-annotation-id')
                const type = annotation.getAttribute('data-annotation-type')
                
                // Dispatch custom event for annotation click
                const customEvent = new CustomEvent('annotationClick', {
                  detail: {
                    annotationId,
                    type,
                    element: annotation,
                  }
                })
                
                document.dispatchEvent(customEvent)
                return true
              }
              
              return false
            },
          },
        },
      }),
    ]
  },
})

// Text selection plugin for creating annotations
const textSelectionPlugin = new Plugin({
  key: new PluginKey('textSelection'),
  props: {
    handleDOMEvents: {
      mouseup: (view, event) => {
        const selection = view.state.selection
        
        if (!selection.empty) {
          const { from, to } = selection
          const selectedText = view.state.doc.textBetween(from, to)
          
          if (selectedText.trim().length > 0) {
            // Dispatch custom event for text selection
            const customEvent = new CustomEvent('textSelected', {
              detail: {
                from,
                to,
                text: selectedText,
                event
              }
            })
            
            document.dispatchEvent(customEvent)
          }
        }
        
        return false
      },
    },
  },
})

// Text Selection Extension wrapper
export const TextSelectionExtension = Extension.create({
  name: 'textSelection',

  addProseMirrorPlugins() {
    return [textSelectionPlugin]
  },
})