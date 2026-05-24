export type BadgeVariant = 'default' | 'read' | 'reading' | 'want_to_read' | 'paused' | 'gave_up' | 'accent'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<string, string> = {
  default: 'bg-bg-warm text-ink-light',
  read: 'bg-green/10 text-green border-green/20',
  reading: 'bg-blue/10 text-blue border-blue/20',
  want_to_read: 'bg-amber/10 text-amber border-amber/20',
  paused: 'bg-ink-muted/10 text-ink-muted border-ink-muted/20',
  gave_up: 'bg-red/10 text-red border-red/20',
  accent: 'bg-accent-soft text-accent border-accent/20',
}

const labelMap: Record<string, string> = {
  read: 'Read',
  reading: 'Reading',
  want_to_read: 'Want to Read',
  paused: 'Paused',
  gave_up: 'Gave Up',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const label = labelMap[String(children)] || String(children)
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-ui font-medium
        border ${variantStyles[variant]} ${className}
      `}
    >
      {label}
    </span>
  )
}
