'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookCard } from '@/components/features/BookCard'
import { BookCover } from '@/components/ui/BookCover'
import { EmptyState } from '@/components/ui/EmptyState'
import { AddBookModal } from '@/components/features/AddBookModal'

type Shelf = 'all' | 'read' | 'reading' | 'want_to_read' | 'paused' | 'gave_up'

interface BookEntry {
  id: string
  shelf: string
  is_favorite: boolean
  progress_pages: number
  books: {
    id: string
    title: string
    author: string
    cover_url: string | null
    page_count: number | null
  } | null
}

interface LibraryClientProps {
  books: BookEntry[]
  currentlyReading: BookEntry | null
}

const shelves: { key: Shelf; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'read', label: 'Read' },
  { key: 'reading', label: 'Reading' },
  { key: 'want_to_read', label: 'Want to Read' },
  { key: 'paused', label: 'Paused' },
  { key: 'gave_up', label: 'Gave Up' },
]

export function LibraryClient({ books, currentlyReading }: LibraryClientProps) {
  const [activeShelf, setActiveShelf] = useState<Shelf>('all')
  const [search, setSearch] = useState('')
  const [addBookOpen, setAddBookOpen] = useState(false)
  const searchParams = useSearchParams()

  if (addBookOpen === false && searchParams.get('add') === 'book') {
    setAddBookOpen(true)
  }

  const shelfCounts = useMemo(() => {
    const counts: Record<string, number> = { all: books.length }
    shelves.forEach(s => {
      if (s.key !== 'all') {
        counts[s.key] = books.filter(b => b.shelf === s.key).length
      }
    })
    return counts
  }, [books])

  const filteredBooks = useMemo(() => {
    let filtered = books
    if (activeShelf !== 'all') {
      filtered = filtered.filter(b => b.shelf === activeShelf)
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        b =>
          b.books?.title.toLowerCase().includes(q) ||
          b.books?.author.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [books, activeShelf, search])

  return (
    <><div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-ink-strong">My Library</h1>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-4 py-2 rounded-lg border border-border bg-surface font-ui text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      {currentlyReading && currentlyReading.books && (
        <div className="bg-surface rounded-xl border border-border shadow-sm p-4 md:p-6 flex items-center gap-6">
          <BookCover
            title={currentlyReading.books.title}
            author={currentlyReading.books.author}
            coverUrl={currentlyReading.books.cover_url}
            size="md"
          />
          <div className="flex-1">
            <p className="text-xs font-ui text-ink-muted uppercase tracking-wider">Currently Reading</p>
            <h2 className="text-lg font-display font-bold text-ink mt-1">
              {currentlyReading.books.title}
            </h2>
            <p className="text-sm font-ui text-ink-light">{currentlyReading.books.author}</p>
            {currentlyReading.books.page_count && currentlyReading.books.page_count > 0 && (
              <div className="mt-3">
                <div className="w-full h-2 bg-bg-warm rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue rounded-full"
                    style={{
                      width: `${Math.min(100, ((currentlyReading.progress_pages || 0) / currentlyReading.books.page_count) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs font-ui text-ink-muted mt-1">
                  {currentlyReading.progress_pages || 0} of {currentlyReading.books.page_count} pages
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shelf Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {shelves.map((shelf) => (
          <button
            key={shelf.key}
            onClick={() => setActiveShelf(shelf.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-ui font-medium whitespace-nowrap transition-colors ${
              activeShelf === shelf.key
                ? 'bg-accent text-white'
                : 'bg-bg-warm text-ink-light hover:bg-border-light'
            }`}
          >
            {shelf.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeShelf === shelf.key ? 'bg-white/20' : 'bg-surface'
            }`}>
              {shelfCounts[shelf.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredBooks.map((entry) => (
            <BookCard
              key={entry.id}
              id={entry.books?.id || entry.id}
              title={entry.books?.title || 'Unknown'}
              author={entry.books?.author || 'Unknown'}
              coverUrl={entry.books?.cover_url}
              shelf={entry.shelf}
              progress={entry.progress_pages}
              totalPages={entry.books?.page_count}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📚"
          title={
            activeShelf === 'all' ? 'Your library is empty' : 'Nothing here yet'
          }
          description={
            activeShelf === 'all'
              ? 'Search for books to add them to your library.'
              : activeShelf === 'paused' || activeShelf === 'gave_up'
                ? 'No books here. That is okay — every reader has their own journey.'
                : `No books in "${activeShelf}" shelf yet.`
          }
        />
      )}
    </div>
      <AddBookModal open={addBookOpen} onClose={() => setAddBookOpen(false)} />
    </>
  )
}
