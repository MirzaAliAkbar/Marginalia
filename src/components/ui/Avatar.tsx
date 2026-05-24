interface AvatarProps {
  name?: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
}

const gradients = [
  'from-accent to-amber',
  'from-blue to-green',
  'from-amber to-accent',
  'from-green to-blue',
]

function hashColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

export function Avatar({ name = '', src, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizeStyles[size]} ${className}`}
      />
    )
  }

  const initial = name ? name.charAt(0).toUpperCase() : '?'
  const gradient = hashColor(name || '?')

  return (
    <div
      className={`
        rounded-full bg-gradient-to-br ${gradient}
        flex items-center justify-center text-white font-display font-bold
        ${sizeStyles[size]} ${className}
      `}
    >
      {initial}
    </div>
  )
}
