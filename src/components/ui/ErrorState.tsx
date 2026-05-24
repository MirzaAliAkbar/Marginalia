'use client'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-4xl mb-4">⚠️</span>
      <h3 className="text-lg font-display font-semibold text-ink mb-2">Oops!</h3>
      <p className="text-sm font-ui text-ink-light max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-ui font-medium hover:bg-accent-hover transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
