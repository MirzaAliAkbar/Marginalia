interface StatCardProps {
  icon: string
  value: string | number
  label: string
  accent?: boolean
}

export function StatCard({ icon, value, label, accent }: StatCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm p-4 flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className={`text-2xl font-display font-bold ${accent ? 'text-accent' : 'text-ink-strong'}`}>
          {value}
        </p>
        <p className="text-xs font-ui text-ink-muted">{label}</p>
      </div>
    </div>
  )
}
