'use client'

import Link from 'next/link'
import { BookCover } from '@/components/ui/BookCover'

interface EssayCardProps {
  id: string
  title: string
  excerpt: string
  authorName: string
  authorUsername: string
  bookTitle: string
  bookAuthor: string
  coverUrl?: string | null
  readTime: string
  createdAt: string
  featured?: boolean
}

export function EssayCard({
  id, title, excerpt, authorName,
  bookTitle, bookAuthor, coverUrl, readTime, featured,
}: EssayCardProps) {
  if (featured) {
    return (
      <Link
        href={`/essays/${id}`}
        className="group bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden grid md:grid-cols-2 fade-up"
      >
        <div className="h-48 md:h-full bg-gradient-to-br from-accent-soft/30 to-bg-warm flex items-center justify-center p-6">
          <BookCover title={bookTitle} author={bookAuthor} coverUrl={coverUrl} size="xl" />
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-ui font-medium bg-accent-soft text-accent border border-accent/20 mb-3 w-fit">
            Featured Essay
          </span>
          <h2 className="text-xl md:text-2xl font-display font-bold text-ink group-hover:text-accent transition-colors line-clamp-2">
            {title}
          </h2>
          <p className="text-sm font-body text-ink-light mt-2 line-clamp-3">
            {excerpt}
          </p>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-amber flex items-center justify-center text-white font-bold text-xs">
              {authorName.charAt(0)}
            </div>
            <div className="text-sm font-ui">
              <span className="text-ink font-medium">{authorName}</span>
              <span className="text-ink-muted mx-1">·</span>
              <span className="text-ink-muted">{readTime}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/essays/${id}`}
      className="group bg-surface rounded-xl border border-border shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 overflow-hidden fade-up"
    >
      <div className="h-32 bg-gradient-to-br from-accent-soft/20 to-bg-warm flex items-end p-4">
        <BookCover title={bookTitle} author={bookAuthor} coverUrl={coverUrl} size="sm" />
      </div>
      <div className="p-4">
        <p className="text-xs font-ui text-ink-muted truncate mb-1">{bookTitle} · {bookAuthor}</p>
        <h3 className="text-base font-display font-semibold text-ink group-hover:text-accent transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-sm font-body text-ink-light mt-1 line-clamp-2">
          {excerpt}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="text-xs font-ui text-ink-muted">{authorName}</span>
          <span className="text-xs font-ui text-ink-muted">{readTime}</span>
        </div>
      </div>
    </Link>
  )
}
