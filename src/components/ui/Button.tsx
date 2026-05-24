'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'pill'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md hover:-translate-y-0.5',
  secondary:
    'bg-bg-warm text-ink border border-border hover:bg-border-light hover:shadow-sm hover:-translate-y-0.5',
  ghost:
    'text-ink-light hover:text-ink hover:bg-bg-warm',
  outline:
    'border border-ink-light text-ink-light hover:border-accent hover:text-accent hover:bg-accent-soft/20',
  pill:
    'rounded-full border border-border text-ink-light hover:border-accent hover:text-accent hover:bg-accent-soft/20',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 rounded-lg font-ui font-medium
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40
          disabled:opacity-50 disabled:pointer-events-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
