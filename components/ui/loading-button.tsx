import * as React from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
  loadingText?: string
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, children, isLoading, loadingText, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          'relative transition-all duration-200',
          isLoading && 'cursor-not-allowed opacity-80',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        <span
          className={cn(
            'flex items-center justify-center transition-all duration-200',
            isLoading && 'opacity-0'
          )}
        >
          {children}
        </span>
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {loadingText || 'Loading...'}
          </span>
        )}
      </Button>
    )
  }
)

LoadingButton.displayName = 'LoadingButton'

export { LoadingButton }

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = React.useState(initialState)

  const startLoading = React.useCallback(() => setIsLoading(true), [])
  const stopLoading = React.useCallback(() => setIsLoading(false), [])

  const withLoading = React.useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
      try {
        startLoading()
        const result = await asyncFn()
        return result
      } catch (error) {
        console.error('Error during loading:', error)
        throw error
      } finally {
        stopLoading()
      }
    },
    [startLoading, stopLoading]
  )

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  }
}