import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Not Found — Marginalia',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl mb-6">📖</span>
      <h1 className="text-4xl font-display font-bold text-ink-strong mb-3">Page Not Found</h1>
      <p className="text-sm font-ui text-ink-light max-w-md mb-8">
        This page does not exist. The library is vast, but even we have our limits.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-6 py-3 rounded-lg bg-accent text-white font-ui font-medium hover:bg-accent-hover transition-colors"
      >
        Return Home
      </Link>
    </div>
  )
}
