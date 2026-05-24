'use client'

import Link from 'next/link'
import { BookCover } from '@/components/ui/BookCover'
import { Badge, type BadgeVariant } from '@/components/ui/Badge'

interface BookCardProps {
  id: string
  title: string
  author: string
  coverUrl?: string | null
  shelf?: string | null
  progress?: number
  totalPages?: number | null
}

export function BookCard({ id, title, author, coverUrl, shelf, progress, totalPages }: BookCardProps) {
  return (
    <Link
      href={`/books/${id}`}
      className="group fade-up"
    >
      <BookCover title={title} author={author} coverUrl={coverUrl} size="md" className="mx-auto" />
      <div className="mt-2 text-center">
        <p className="text-sm font-ui font-semibold text-ink group-hover:text-accent transition-colors line-clamp-1">
          {title}
        </p>
        <p className="text-xs font-ui text-ink-muted line-clamp-1">{author}</p>
        {shelf && shelf !== 'all' && (
          <div className="mt-1">
            <Badge variant={shelf as BadgeVariant}>{shelf}</Badge>
          </div>
        )}
        {shelf === 'reading' && totalPages && totalPages > 0 && (
          <div className="mt-2">
            <div className="w-full h-1.5 bg-bg-warm rounded-full overflow-hidden">
              <div
                className="h-full bg-blue rounded-full transition-all"
                style={{ width: `${Math.min(100, ((progress || 0) / totalPages) * 100)}%` }}
              />
            </div>
            <p className="text-xs font-ui text-ink-muted mt-0.5">
              {progress || 0} of {totalPages} pages
            </p>
          </div>
        )}
      </div>
    </Link>
  )
}
