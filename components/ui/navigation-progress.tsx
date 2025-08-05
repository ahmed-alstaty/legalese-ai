'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(false)
  }, [pathname, searchParams])

  useEffect(() => {
    const handleStart = () => setIsNavigating(true)
    const handleComplete = () => setIsNavigating(false)

    // Listen for route changes
    window.addEventListener('beforeunload', handleStart)
    
    // Simulate navigation start when clicking links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (link && link.href && !link.target && link.href.startsWith(window.location.origin)) {
        setIsNavigating(true)
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('beforeunload', handleStart)
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
          initial={{ scaleX: 0, transformOrigin: 'left' }}
          animate={{ 
            scaleX: 1,
            transition: { duration: 0.5, ease: 'easeInOut' }
          }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.2 }
          }}
        >
          <motion.div
            className="h-full bg-white/30"
            animate={{
              x: ['0%', '100%'],
              transition: {
                repeat: Infinity,
                duration: 1,
                ease: 'linear'
              }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}