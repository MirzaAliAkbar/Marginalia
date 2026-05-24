interface LoadingStateProps {
  type?: 'card' | 'list' | 'detail'
  count?: number
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-bg-warm ${className}`} />
  )
}

export function LoadingState({ type = 'card', count = 3 }: LoadingStateProps) {
  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border">
            <LoadingSkeleton className="w-12 h-18" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-4 w-3/4" />
              <LoadingSkeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'detail') {
    return (
      <div className="space-y-6">
        <div className="flex gap-8">
          <LoadingSkeleton className="w-48 h-72" />
          <div className="flex-1 space-y-4">
            <LoadingSkeleton className="h-8 w-3/4" />
            <LoadingSkeleton className="h-4 w-1/2" />
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface rounded-xl border border-border p-4 space-y-3">
          <LoadingSkeleton className="w-full h-40" />
          <LoadingSkeleton className="h-4 w-3/4" />
          <LoadingSkeleton className="h-3 w-1/2" />
          <LoadingSkeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  )
}
