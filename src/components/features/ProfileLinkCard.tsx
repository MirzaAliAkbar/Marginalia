'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ProfileLinkCardProps {
  username: string
  displayName: string
}

export function ProfileLinkCard({ username, displayName }: ProfileLinkCardProps) {
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const profileUrl = `${origin}/${username}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-amber flex items-center justify-center text-white font-bold text-lg shrink-0">
          {displayName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-ui font-medium text-ink">Your Profile</p>
          <p className="text-xs font-ui text-ink-muted">
            {profileUrl}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-lg border border-border text-sm font-ui text-ink-light hover:text-ink hover:border-accent transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
        <Link
          href={`/${username}`}
          className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-ui font-medium hover:bg-accent-hover transition-colors text-center"
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}
