interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon = '📚', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-display font-semibold text-ink mb-2">{title}</h3>
      {description && (
        <p className="text-sm font-ui text-ink-light max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}
