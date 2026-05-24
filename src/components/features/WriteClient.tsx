'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useAutoSave, loadDraft, clearDraft } from '@/hooks/useAutoSave'

interface BookOption {
  id: string
  title: string
  author: string
}

interface WriteClientProps {
  books: BookOption[]
  editId?: string
}

export function WriteClient({ books, editId }: WriteClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedBook = searchParams.get('book')
  const publishOnSave = searchParams.get('publish') === 'true'

  const flareOptions = [
    { value: 'review', label: 'Review' },
    { value: 'opinion', label: 'Opinion' },
    { value: 'analysis', label: 'Analysis' },
    { value: 'reflection', label: 'Reflection' },
    { value: 'experience', label: 'Experience' },
    { value: 'custom', label: 'Custom' },
  ]

  const DRAFT_KEY = editId ? `essay-${editId}` : 'current-essay'

  const draft = !editId ? loadDraft(DRAFT_KEY) : null

  const [selectedBookId, setSelectedBookId] = useState(
    preSelectedBook || (draft?.bookId && books.some(b => b.id === draft.bookId) ? draft.bookId : '') || (books[0]?.id || '')
  )
  const [title, setTitle] = useState(draft?.title || '')
  const [body, setBody] = useState(draft?.body || '')
  const [flare, setFlare] = useState('review')
  const [flareCustom, setFlareCustom] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showBookSelector, setShowBookSelector] = useState(false)
  const [loading, setLoading] = useState(!!editId)

  const wordCount = body.trim()
    ? body.trim().split(/\s+/).length
    : 0

  useAutoSave(DRAFT_KEY, { title, body, bookId: selectedBookId }, 30000)

  useEffect(() => {
    if (!editId) return

    let cancelled = false
    const supabase = createClient()
    supabase.from('essays').select('*').eq('id', editId).single().then(({ data, error }) => {
      if (cancelled) return
      if (error || !data) {
        router.push('/drafts')
        return
      }
      setTitle(data.title || '')
      setBody(data.body || '')
      setSelectedBookId(data.book_id || '')
      setFlare(data.flare === 'custom' ? 'custom' : (data.flare || 'review'))
      setFlareCustom(data.flare && !flareOptions.some(f => f.value === data.flare) ? data.flare : '')
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [editId])

  const handlePublish = async () => {
    if (!title.trim() || !body.trim() || !selectedBookId) return
    setPublishing(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const finalFlare = flare === 'custom' && flareCustom.trim() ? flareCustom.trim().toLowerCase().replace(/\s+/g, '_') : flare
      const payload = {
        book_id: selectedBookId,
        title: title.trim(),
        body: body.trim(),
        flare: finalFlare,
        word_count: wordCount,
        is_published: publishOnSave || true,
        updated_at: new Date().toISOString(),
      }

      if (editId) {
        const { error } = await supabase.from('essays').update(payload).eq('id', editId).eq('user_id', user.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('essays').insert({
          ...payload,
          user_id: user.id,
        })
        if (error) throw error
      }

      clearDraft(DRAFT_KEY)
      router.push(publishOnSave ? '/feed' : `/essays/${editId || ''}`)
    } catch {
      alert('Failed to publish. Please try again.')
    }
    setPublishing(false)
  }

  const handleSaveDraft = async () => {
    if (!title.trim() || !body.trim() || !selectedBookId) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const finalFlare = flare === 'custom' && flareCustom.trim() ? flareCustom.trim().toLowerCase().replace(/\s+/g, '_') : flare
      const payload = {
        book_id: selectedBookId,
        title: title.trim(),
        body: body.trim(),
        flare: finalFlare,
        word_count: wordCount,
        is_published: false,
        updated_at: new Date().toISOString(),
      }

      if (editId) {
        const { error } = await supabase.from('essays').update(payload).eq('id', editId).eq('user_id', user.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('essays').insert({ ...payload, user_id: user.id })
        if (error) throw error
      }

      clearDraft(DRAFT_KEY)
    } catch {
      alert('Failed to save draft.')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <p className="text-sm font-ui text-ink-muted">Loading essay...</p>
      </div>
    )
  }

  const selectedBook = books.find(b => b.id === selectedBookId)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Book Selector */}
      <div className="relative mb-8">
        <button
          onClick={() => setShowBookSelector(!showBookSelector)}
          className="flex items-center gap-2 text-sm font-ui text-ink-muted hover:text-ink transition-colors"
        >
          <span>Writing about:</span>
          <span className="text-accent font-medium">
            {selectedBook ? `${selectedBook.title} by ${selectedBook.author}` : 'Select a book'}
          </span>
          <span className="text-xs">{showBookSelector ? '▲' : '▼'}</span>
        </button>
        {showBookSelector && (
          <div className="absolute top-8 left-0 w-72 bg-surface rounded-xl border border-border shadow-lg py-2 z-10 max-h-60 overflow-y-auto">
            {books.map((book) => (
              <button
                key={book.id}
                onClick={() => {
                  setSelectedBookId(book.id)
                  setShowBookSelector(false)
                }}
                className={`w-full px-4 py-2 text-left text-sm font-ui hover:bg-bg-warm transition-colors ${
                  book.id === selectedBookId ? 'text-accent font-medium' : 'text-ink'
                }`}
              >
                {book.title}
                <span className="text-ink-muted ml-1">· {book.author}</span>
              </button>
            ))}
            {books.length === 0 && (
              <p className="px-4 py-2 text-sm font-ui text-ink-muted">
                No books in library yet. Add one first!
              </p>
            )}
            <hr className="my-1 border-border" />
            <button
              onClick={() => {
                setShowBookSelector(false)
                router.push('/library?add=book')
              }}
              className="w-full px-4 py-2 text-left text-sm font-ui text-accent hover:bg-bg-warm transition-colors"
            >
              + Add a new book
            </button>
          </div>
        )}
      </div>

      {/* Flare chooser */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-ui text-ink-muted">This is an:</span>
        {flareOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFlare(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-ui font-medium border transition-colors ${
              flare === opt.value
                ? 'border-accent bg-accent-soft/20 text-accent'
                : 'border-border text-ink-light hover:border-accent hover:text-accent'
            }`}
          >
            {opt.label}
          </button>
        ))}
        {flare === 'custom' && (
          <input
            type="text"
            value={flareCustom}
            onChange={(e) => setFlareCustom(e.target.value)}
            placeholder="Custom tag..."
            className="px-3 py-1.5 rounded-lg border border-accent bg-surface text-sm font-ui text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        )}
      </div>

      <hr className="border-border mb-8" />

      {/* Title */}
      <input
        type="text"
        placeholder="Your essay title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-3xl md:text-4xl font-display font-bold text-ink-strong placeholder:text-ink-muted/50 bg-transparent border-none focus:outline-none mb-8"
      />

      {/* Body */}
      <textarea
        placeholder="Start writing your thoughts... What did this book mean to you? What surprised you? What do you disagree with? Write honestly. The best essays come from genuine curiosity."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full min-h-[50vh] font-body text-lg leading-relaxed text-ink placeholder:text-ink-muted/40 bg-transparent border-none focus:outline-none resize-none"
      />

      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-surface/90 backdrop-blur-md border-t border-border mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-ui text-ink-muted">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
          {editId && (
            <Link href="/drafts" className="text-sm font-ui text-ink-muted hover:text-accent transition-colors">
              ← Back to drafts
            </Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleSaveDraft} disabled={saving || !title.trim() || !body.trim() || !selectedBookId}>
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            variant="primary"
            onClick={handlePublish}
            disabled={publishing || !title.trim() || !body.trim() || !selectedBookId}
          >
            {publishing ? 'Publishing...' : editId ? 'Update & Publish' : 'Publish Essay'}
          </Button>
        </div>
      </div>
    </div>
  )
}
