'use client'

import React, { useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface HighlightSection {
  text: string
  highlighted_text?: string
  severity?: string | number
  riskLevel?: number
  type?: string
  comment?: string
  suggestion?: string
}

interface DocumentViewerProps {
  content: string
  highlights: HighlightSection[]
  selectedHighlight: number | null
  onHighlightClick: (index: number) => void
}

export function DocumentViewer({ 
  content, 
  highlights = [], 
  selectedHighlight, 
  onHighlightClick 
}: DocumentViewerProps) {
  
  // Create highlighted content
  const highlightedContent = useMemo(() => {
    if (!content || highlights.length === 0) {
      return content
    }

    let processedContent = content
    const highlightMap = new Map<string, { index: number; severity: string | number }>()

    // Build a map of text to highlight info
    highlights.forEach((highlight, index) => {
      const text = highlight.text || highlight.highlighted_text || ''
      if (text) {
        highlightMap.set(text, { 
          index, 
          severity: highlight.severity || highlight.riskLevel || 'medium' 
        })
      }
    })

    // Sort highlights by length (longest first) to avoid partial replacements
    const sortedTexts = Array.from(highlightMap.keys()).sort((a, b) => b.length - a.length)

    // Replace each highlight text with marked version
    sortedTexts.forEach(text => {
      const info = highlightMap.get(text)
      if (!info) return

      const { index, severity } = info
      const isSelected = selectedHighlight === index

      // Determine color based on severity
      let colorClass = 'bg-yellow-200'
      if (typeof severity === 'string') {
        if (severity === 'high') colorClass = 'bg-red-200'
        else if (severity === 'medium') colorClass = 'bg-amber-200'
        else if (severity === 'low') colorClass = 'bg-green-200'
      } else if (typeof severity === 'number') {
        if (severity >= 7) colorClass = 'bg-red-200'
        else if (severity >= 4) colorClass = 'bg-amber-200'
        else colorClass = 'bg-green-200'
      }

      if (isSelected) {
        colorClass = 'bg-indigo-300 ring-2 ring-indigo-500'
      }

      // Create a unique marker for this highlight
      const marker = `{{HIGHLIGHT_${index}_START}}`
      const endMarker = `{{HIGHLIGHT_${index}_END}}`

      // Escape special regex characters in the text
      const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escapedText, 'gi')

      // Replace all occurrences
      processedContent = processedContent.replace(regex, (match) => {
        return `${marker}${match}${endMarker}`
      })
    })

    // Now replace markers with actual spans
    highlights.forEach((highlight, index) => {
      const marker = `{{HIGHLIGHT_${index}_START}}`
      const endMarker = `{{HIGHLIGHT_${index}_END}}`
      const severity = highlight.severity || highlight.riskLevel || 'medium'
      const isSelected = selectedHighlight === index

      let colorClass = 'bg-yellow-200 hover:bg-yellow-300'
      if (typeof severity === 'string') {
        if (severity === 'high') colorClass = 'bg-red-200 hover:bg-red-300'
        else if (severity === 'medium') colorClass = 'bg-amber-200 hover:bg-amber-300'
        else if (severity === 'low') colorClass = 'bg-green-200 hover:bg-green-300'
      } else if (typeof severity === 'number') {
        if (severity >= 7) colorClass = 'bg-red-200 hover:bg-red-300'
        else if (severity >= 4) colorClass = 'bg-amber-200 hover:bg-amber-300'
        else colorClass = 'bg-green-200 hover:bg-green-300'
      }

      if (isSelected) {
        colorClass = 'bg-indigo-300 ring-2 ring-indigo-500'
      }

      const markerRegex = new RegExp(`${marker}([^{]*)${endMarker}`, 'g')
      processedContent = processedContent.replace(markerRegex, (match, text) => {
        return `<mark id="highlight-${index}" class="cursor-pointer px-0.5 rounded transition-all ${colorClass}" data-highlight-index="${index}">${text}</mark>`
      })
    })

    return processedContent
  }, [content, highlights, selectedHighlight])

  // Handle click events on highlights
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target && target.dataset && target.dataset.highlightIndex) {
        const index = parseInt(target.dataset.highlightIndex)
        if (!isNaN(index)) {
          onHighlightClick(index)
        }
      }
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [onHighlightClick])

  // Parse and render the content with proper formatting
  const renderContent = () => {
    if (!highlightedContent) return null

    const lines = highlightedContent.split('\n')
    const elements: React.ReactElement[] = []
    let inList = false
    let listItems: string[] = []

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim()

      // Skip empty lines but add spacing
      if (!trimmedLine) {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${lineIndex}`} className="list-disc pl-6 mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700" dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        elements.push(<div key={`space-${lineIndex}`} className="h-4" />)
        return
      }

      // Headers - ALL CAPS or numbered sections
      if (trimmedLine.match(/^[A-Z\s]+$/) && trimmedLine.length > 3) {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${lineIndex}`} className="list-disc pl-6 mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700" dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        elements.push(
          <h2 
            key={`h2-${lineIndex}`} 
            className="text-xl font-bold mt-6 mb-3 text-gray-900"
            dangerouslySetInnerHTML={{ __html: line }}
          />
        )
      }
      // Section numbers
      else if (trimmedLine.match(/^\d+\./)) {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${lineIndex}`} className="list-disc pl-6 mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700" dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        elements.push(
          <h3 
            key={`h3-${lineIndex}`} 
            className="text-lg font-semibold mt-4 mb-2 text-gray-800"
            dangerouslySetInnerHTML={{ __html: line }}
          />
        )
      }
      // Bullet points
      else if (trimmedLine.match(/^[\-\*\•]/)) {
        inList = true
        listItems.push(line.substring(1).trim())
      }
      // Regular paragraphs
      else {
        if (inList && listItems.length > 0) {
          elements.push(
            <ul key={`list-${lineIndex}`} className="list-disc pl-6 mb-4 space-y-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-gray-700" dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          )
          listItems = []
          inList = false
        }
        elements.push(
          <p 
            key={`p-${lineIndex}`} 
            className="mb-3 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: line }}
          />
        )
      }
    })

    // Handle remaining list items
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key="list-final" className="list-disc pl-6 mb-4 space-y-1">
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-700" dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      )
    }

    return elements
  }

  return <>{renderContent()}</>
}