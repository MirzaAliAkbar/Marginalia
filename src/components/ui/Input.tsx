'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-ui font-medium text-ink-light mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg border bg-surface font-ui text-sm text-ink
            placeholder:text-ink-muted
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent
            ${error ? 'border-red' : 'border-border'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red font-ui">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
