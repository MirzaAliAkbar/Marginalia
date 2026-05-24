interface BookCoverProps {
  title: string
  author: string
  coverUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeStyles = {
  sm: 'w-12 h-18',
  md: 'w-24 h-36',
  lg: 'w-32 h-48',
  xl: 'w-48 h-72',
}

const coverGradients = [
  'from-amber-800/80 to-amber-900/90',
  'from-blue-800/80 to-blue-900/90',
  'from-green-800/80 to-green-900/90',
  'from-red-800/80 to-red-900/90',
  'from-purple-800/80 to-purple-900/90',
  'from-teal-800/80 to-teal-900/90',
]

function hashGradient(title: string) {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return coverGradients[Math.abs(hash) % coverGradients.length]
}

export function BookCover({ title, author, coverUrl, size = 'md', className = '' }: BookCoverProps) {
  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt={`${title} by ${author}`}
        className={`rounded-lg object-cover shadow-sm ${sizeStyles[size]} ${className}`}
      />
    )
  }

  const gradient = hashGradient(title)

  return (
    <div
      className={`
        relative rounded-lg bg-gradient-to-br ${gradient}
        flex flex-col items-center justify-end p-2 text-center
        shadow-sm overflow-hidden
        ${sizeStyles[size]} ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="relative z-10 text-white">
        <p className="text-xs font-display font-bold leading-tight line-clamp-2">
          {title}
        </p>
        <p className="text-[10px] text-white/80 mt-0.5 truncate">
          {author}
        </p>
      </div>
    </div>
  )
}
