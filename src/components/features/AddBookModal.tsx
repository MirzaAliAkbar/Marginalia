'use client'

import { useState, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { BookCover } from '@/components/ui/BookCover'
import { createClient } from '@/lib/supabase/client'

interface GoogleBookItem {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    publishedDate?: string
    description?: string
    pageCount?: number
    imageLinks?: { thumbnail?: string }
    categories?: string[]
    industryIdentifiers?: { type: string; identifier: string }[]
  }
}

interface AddBookModalProps {
  open: boolean
  onClose: () => void
}

export function AddBookModal({ open, onClose }: AddBookModalProps) {
  const [tab, setTab] = useState<'search' | 'isbn'>('search')
  const [query, setQuery] = useState('')
  const [isbnInput, setIsbnInput] = useState('')
  const [results, setResults] = useState<GoogleBookItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)

  const searchBooks = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const key = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || ''
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8${key ? `&key=${key}` : ''}`
      )
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(data.items || [])
    } catch {
      setError('Search unavailable. Check your connection.')
      setResults([])
    }
    setLoading(false)
  }, [])

  const lookupISBN = useCallback(async (isbn: string) => {
    const clean = isbn.replace(/[^0-9Xx]/g, '')
    if (clean.length < 10) return
    setLoading(true)
    setError('')
    try {
      const key = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || ''
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}&maxResults=1${key ? `&key=${key}` : ''}`
      )
      if (!res.ok) throw new Error('Lookup failed')
      const data = await res.json()
      setResults(data.items || [])
      if (!data.items || data.items.length === 0) {
        setError('No book found with that ISBN.')
      }
    } catch {
      setError('Lookup unavailable. Check your connection.')
    }
    setLoading(false)
  }, [])

  const addBook = async (item: GoogleBookItem) => {
    setAdding(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const vol = item.volumeInfo
      const isbn = vol.industryIdentifiers?.find(
        id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
      )?.identifier || null

      const { data: existingBook } = await supabase
        .from('books')
        .select('id')
        .eq('google_books_id', item.id)
        .maybeSingle()

      let bookId: string

      if (existingBook) {
        bookId = existingBook.id
      } else {
        const { data: newBook } = await supabase
          .from('books')
          .insert({
            google_books_id: item.id,
            title: vol.title,
            author: vol.authors?.[0] || 'Unknown Author',
            isbn,
            description: vol.description || '',
            page_count: vol.pageCount || null,
            cover_url: vol.imageLinks?.thumbnail?.replace('http:', 'https:') || null,
            genres: vol.categories || [],
          })
          .select('id')
          .single()

        if (!newBook) throw new Error('Failed to save book')
        bookId = newBook.id
      }

      const { error: ubError } = await supabase
        .from('user_books')
        .insert({
          user_id: user.id,
          book_id: bookId,
          shelf: 'want_to_read',
        })

      if (ubError) {
        if (ubError.code === '23505') {
          setAddedIds(prev => new Set(prev).add(item.id))
          return
        }
        throw ubError
      }

      setAddedIds(prev => new Set(prev).add(item.id))
    } catch {}
    setAdding(false)
  }

  return (
    <Modal open={open} onClose={onClose} className="p-0">
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <h2 className="text-lg font-display font-bold text-ink-strong">Add a Book</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-bg-warm transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div className="p-6 pt-4">
        <div className="flex gap-4 mb-6 border-b border-border pb-4">
          <button
            onClick={() => { setTab('search'); setResults([]); setError('') }}
            className={`pb-2 text-sm font-ui font-medium transition-colors relative ${
              tab === 'search' ? 'text-accent' : 'text-ink-muted hover:text-ink'
            }`}
          >
            Search
            {tab === 'search' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
          </button>
          <button
            onClick={() => { setTab('isbn'); setResults([]); setError('') }}
            className={`pb-2 text-sm font-ui font-medium transition-colors relative ${
              tab === 'isbn' ? 'text-accent' : 'text-ink-muted hover:text-ink'
            }`}
          >
            ISBN Scanner
            {tab === 'isbn' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />}
          </button>
        </div>

        {tab === 'search' ? (
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-lg">🔍</span>
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  if (e.target.value.length > 2) searchBooks(e.target.value)
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface font-ui text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>

            {loading && <p className="text-sm font-ui text-ink-muted">Searching...</p>}
            {error && <p className="text-sm font-ui text-red">{error}</p>}

            {!loading && !error && results.length === 0 && query && (
              <p className="text-sm font-ui text-ink-muted">No results found.</p>
            )}

            {!loading && !error && results.length === 0 && !query && (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">📚</span>
                <p className="text-sm font-ui text-ink-muted">Search for any book to add it to your library.</p>
              </div>
            )}

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {results.map((item) => {
                const vol = item.volumeInfo
                const isAdded = addedIds.has(item.id)
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-lg border border-border bg-surface hover:bg-bg-warm transition-colors"
                  >
                    <BookCover
                      title={vol.title}
                      author={vol.authors?.[0] || 'Unknown'}
                      coverUrl={vol.imageLinks?.thumbnail?.replace('http:', 'https:')}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-ui font-semibold text-ink line-clamp-1">{vol.title}</p>
                      <p className="text-xs font-ui text-ink-muted">{vol.authors?.[0] || 'Unknown Author'}</p>
                      {vol.pageCount && (
                        <p className="text-xs font-ui text-ink-muted">{vol.pageCount} pages</p>
                      )}
                      {vol.description && (
                        <p className="text-xs font-body text-ink-light mt-1 line-clamp-2">{vol.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => addBook(item)}
                      disabled={isAdded || adding}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-ui font-medium transition-colors ${
                        isAdded
                          ? 'bg-green/10 text-green border border-green/20'
                          : 'bg-accent text-white hover:bg-accent-hover disabled:opacity-50'
                      }`}
                    >
                      {isAdded ? '✓ Added' : adding ? '...' : '+ Add'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Scanner UI */}
            <div className="relative w-full h-48 bg-ink rounded-xl overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-blue/5" />
              <div className="relative z-10 text-center">
                <div className="w-48 h-32 mx-auto border-2 border-white/30 rounded-lg relative">
                  <div className="absolute inset-x-0 h-0.5 bg-accent shadow-[0_0_8px_rgba(194,65,12,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/50 rounded-tl" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white/50 rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white/50 rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/50 rounded-br" />
                </div>
                <p className="text-white/70 text-sm font-ui mt-3">Point camera at ISBN barcode</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <hr className="flex-1 border-border" />
              <span className="text-xs font-ui text-ink-muted">or enter ISBN manually</span>
              <hr className="flex-1 border-border" />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="978-0-00-000000-0"
                value={isbnInput}
                onChange={(e) => setIsbnInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <Button
                variant="primary"
                onClick={() => lookupISBN(isbnInput)}
                disabled={isbnInput.replace(/[^0-9Xx]/g, '').length < 10}
              >
                Look Up
              </Button>
            </div>

            {loading && <p className="text-sm font-ui text-ink-muted">Searching...</p>}
            {error && <p className="text-sm font-ui text-red">{error}</p>}

            {results.map((item) => {
              const vol = item.volumeInfo
              const isAdded = addedIds.has(item.id)
              return (
                <div key={item.id} className="flex gap-4 p-4 rounded-lg border border-border bg-surface">
                  <BookCover
                    title={vol.title}
                    author={vol.authors?.[0] || 'Unknown'}
                    coverUrl={vol.imageLinks?.thumbnail?.replace('http:', 'https:')}
                    size="md"
                  />
                  <div className="flex-1">
                    <p className="text-base font-display font-semibold text-ink">{vol.title}</p>
                    <p className="text-sm font-ui text-ink-light">{vol.authors?.[0] || 'Unknown'}</p>
                    {vol.description && (
                      <p className="text-xs font-body text-ink-light mt-2 line-clamp-2">{vol.description}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setIsbnInput('')}
                        className="px-3 py-1.5 rounded-lg border border-border text-sm font-ui text-ink-light hover:border-accent hover:text-accent transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => addBook(item)}
                        disabled={isAdded || adding}
                        className={`px-3 py-1.5 rounded-lg text-sm font-ui font-medium transition-colors ${
                          isAdded ? 'bg-green/10 text-green border border-green/20' : 'bg-accent text-white hover:bg-accent-hover'
                        }`}
                      >
                        {isAdded ? '✓ Added' : 'Add to Library'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}
