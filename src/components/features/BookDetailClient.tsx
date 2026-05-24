'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookCover } from '@/components/ui/BookCover'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { createClient } from '@/lib/supabase/client'
import { getAffiliateLink } from '@/lib/affiliate'

interface BookData {
  id: string
  title: string
  author: string
  isbn: string | null
  description: string | null
  page_count: number | null
  cover_url: string | null
  genres: string[]
}

type UserBookData = {
  shelf: string
  is_favorite: boolean
  progress_pages: number
} | null

type TodaySessionData = {
  pages_read: number
  minutes_read: number
} | null

interface EssayData {
  id: string
  title: string
  body: string | null
  word_count: number
  created_at: string
  profiles: { username: string; display_name: string } | null
}

interface BookDetailClientProps {
  book: BookData
  userBook: UserBookData
  readerCount: number
  essayCount: number
  essays: EssayData[]
  todaySession: TodaySessionData
}

export function BookDetailClient({ book, userBook, readerCount, essayCount, essays, todaySession }: BookDetailClientProps) {
  const [currentShelf, setCurrentShelf] = useState(userBook?.shelf || null)
  const [isFavorite, setIsFavorite] = useState(userBook?.is_favorite || false)
  const [progressPages, setProgressPages] = useState(userBook?.progress_pages || 0)
  const [loading, setLoading] = useState(false)
  const [sessionPages, setSessionPages] = useState(todaySession?.pages_read?.toString() || '')
  const [sessionMinutes, setSessionMinutes] = useState(todaySession?.minutes_read?.toString() || '')
  const [sessionSaving, setSessionSaving] = useState(false)
  const [sessionSaved, setSessionSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const affiliateLink = getAffiliateLink(book.isbn)
  const isReading = currentShelf === 'reading'
  const pct = book.page_count && book.page_count > 0 ? Math.round((progressPages / book.page_count) * 100) : 0

  const handleShelfChange = async (shelf: string) => {
    setLoading(true)
    try {
      if (currentShelf) {
        await supabase.from('user_books').update({ shelf }).eq('book_id', book.id)
      } else {
        const user = await supabase.auth.getUser()
        if (!user.data.user) return
        await supabase.from('user_books').insert({
          user_id: user.data.user.id,
          book_id: book.id,
          shelf,
        })
      }
      setCurrentShelf(shelf)
      if (shelf !== 'reading') setProgressPages(0)
    } catch {}
    setLoading(false)
  }

  const handleFavoriteToggle = async () => {
    try {
      if (currentShelf) {
        await supabase.from('user_books').update({ is_favorite: !isFavorite }).eq('book_id', book.id)
        setIsFavorite(!isFavorite)
      }
    } catch {}
  }

  const handleLogSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setSessionSaving(true)
    setSessionSaved(false)
    try {
      const pages = parseInt(sessionPages) || 0
      const minutes = parseInt(sessionMinutes) || 0
      if (pages === 0 && minutes === 0) return

      const today = new Date().toISOString().split('T')[0]

      await supabase.from('reading_sessions').upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        date: today,
        pages_read: pages,
        minutes_read: minutes,
      }, { onConflict: 'user_id,date' })

      const newProgress = progressPages + pages
      await supabase.from('user_books').update({ progress_pages: newProgress }).eq('book_id', book.id)
      setProgressPages(newProgress)
      setSessionSaved(true)
    } catch {}
    setSessionSaving(false)
  }

  const shelfOptions = [
    { key: 'read', label: 'Read' },
    { key: 'reading', label: 'Reading' },
    { key: 'want_to_read', label: 'Want to Read' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-[auto_1fr] gap-8">
        <BookCover title={book.title} author={book.author} coverUrl={book.cover_url} size="xl" className="mx-auto md:mx-0" />

        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-ink-strong">{book.title}</h1>
            <p className="text-lg font-ui text-ink-light">{book.author}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {book.genres?.map((genre) => (
              <Badge key={genre} variant="accent">{genre}</Badge>
            ))}
            {book.page_count && (
              <span className="text-sm font-ui text-ink-muted">{book.page_count} pages</span>
            )}
          </div>

          {book.description && (
            <p className="text-sm font-body text-ink-light leading-relaxed">{book.description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {shelfOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleShelfChange(opt.key)}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-ui font-medium border transition-colors ${
                  currentShelf === opt.key
                    ? 'border-accent bg-accent-soft/20 text-accent'
                    : 'border-border text-ink-light hover:border-accent hover:text-accent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleFavoriteToggle}
              className={`text-2xl transition-transform hover:scale-110 ${isFavorite ? 'scale-110' : ''}`}
              aria-label="Toggle favorite"
            >
              {isFavorite ? '★' : '☆'}
            </button>
            <Button variant="primary" onClick={() => router.push(`/write?book=${book.id}`)}>
              Write an Essay
            </Button>
          </div>

          <div className="flex gap-6 text-sm font-ui text-ink-muted pt-4 border-t border-border">
            <span><strong className="text-ink">{readerCount}</strong> readers</span>
            <span><strong className="text-ink">{essayCount}</strong> essays</span>
          </div>
        </div>
      </div>

      {/* Reading Log — only when actively reading */}
      {isReading && (
        <section className="bg-bg-warm rounded-xl border border-border p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-display font-bold text-ink-strong">Reading Progress</h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-ui text-ink-muted">
              <span>{progressPages} of {book.page_count || '?'} pages</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            {pct >= 100 && (
              <p className="text-xs font-ui text-accent font-medium">Finished! Move this book to &quot;Read&quot;.</p>
            )}
          </div>

          <form onSubmit={handleLogSession} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-ui text-ink-muted mb-1">Pages read today</label>
              <input
                type="number"
                min="0"
                value={sessionPages}
                onChange={(e) => { setSessionPages(e.target.value); setSessionSaved(false) }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm font-ui text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="0"
              />
            </div>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-ui text-ink-muted mb-1">Minutes spent</label>
              <input
                type="number"
                min="0"
                value={sessionMinutes}
                onChange={(e) => { setSessionMinutes(e.target.value); setSessionSaved(false) }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm font-ui text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="0"
              />
            </div>
            <Button type="submit" variant="primary" disabled={sessionSaving}>
              {sessionSaving ? 'Saving...' : 'Log Session'}
            </Button>
            {sessionSaved && (
              <span className="text-xs font-ui text-accent font-medium">Saved!</span>
            )}
          </form>
        </section>
      )}

      {/* Essays about this book */}
      {essays.length > 0 && (
        <section>
          <h2 className="text-xl font-display font-bold text-ink-strong mb-4">Essays About This Book</h2>
          <div className="space-y-4">
            {essays.map((essay) => (
              <a
                key={essay.id}
                href={`/essays/${essay.id}`}
                className="block bg-surface rounded-xl border border-border p-4 hover:shadow-sm transition-shadow"
              >
                <h3 className="text-base font-display font-semibold text-ink">{essay.title}</h3>
                <p className="text-sm font-body text-ink-light mt-1 line-clamp-2">
                  {essay.body?.substring(0, 200)}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs font-ui text-ink-muted">
                  <span>{essay.profiles?.display_name || 'Unknown'}</span>
                  <span>·</span>
                  <span>{Math.max(1, Math.ceil((essay.word_count || 0) / 200))} min read</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Affiliate Card */}
      {affiliateLink && (
        <div className="bg-bg-warm rounded-xl border border-border p-4 md:p-6 flex items-center gap-4">
          <BookCover title={book.title} author={book.author} coverUrl={book.cover_url} size="sm" />
          <div className="flex-1">
            <p className="text-sm font-ui font-medium text-ink">Get This Book</p>
            <p className="text-xs font-ui text-ink-muted">{book.title} · {book.author}</p>
            <a
              href={affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm font-ui text-accent hover:text-accent-hover font-medium"
            >
              Buy on Amazon →
            </a>
          </div>
        </div>
      )}
      {affiliateLink && (
        <p className="text-xs font-ui text-ink-muted italic">
          As an Amazon Associate, Marginalia earns from qualifying purchases. This supports the platform at no extra cost to you.
        </p>
      )}
    </div>
  )
}
