import React, { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

const toasts = new Map<string, Toast>()
const listeners = new Set<() => void>()

export function useToast() {
  const [, forceUpdate] = useState({})

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, title, description, variant }
    
    toasts.set(id, newToast)
    listeners.forEach(listener => listener())
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      toasts.delete(id)
      listeners.forEach(listener => listener())
    }, 5000)
    
    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    toasts.delete(id)
    listeners.forEach(listener => listener())
  }, [])

  // Subscribe to changes
  React.useEffect(() => {
    const listener = () => forceUpdate({})
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    toast,
    dismiss,
    toasts: Array.from(toasts.values())
  }
}