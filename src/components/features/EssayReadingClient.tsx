'use client'

import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookCover } from '@/components/ui/BookCover'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'
import { getAffiliateLink } from '@/lib/affiliate'
import { ReportButton } from './ReportButton'

interface CommentData {
  id: string
  body: string
  created_at: string
  user_id: string
  authorName: string
  authorUsername: string
}

interface EssayReadingClientProps {
  title: string
  body: string
  flare: string | null
  authorName: string
  authorUsername: string
  bookTitle: string
  bookAuthor: string
  bookId: string
  isbn: string | null
  wordCount: number
  createdAt: string
  essayId: string
  isOwner: boolean
  currentUserId: string | null
  isPublished?: boolean
  comments: CommentData[]
}

const flareLabels: Record<string, string> = {
  review: 'Review',
  opinion: 'Opinion',
  analysis: 'Analysis',
  reflection: 'Reflection',
  experience: 'Experience',
}

export function EssayReadingClient({
  title, body, flare, authorName, authorUsername, bookTitle, bookAuthor,
  bookId, isbn, wordCount, createdAt, essayId, isOwner, currentUserId, isPublished, comments: initialComments,
}: EssayReadingClientProps) {
  const isDemo = essayId.startsWith('demo-')
  const [reactions, setReactions] = useState<Record<string, boolean>>({
    resonated: false,
    insightful: false,
    well_written: false,
  })
  const [user, setUser] = useState<User | null>(null)
  const [comments, setComments] = useState(initialComments)
  const [commentBody, setCommentBody] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const affiliateLink = getAffiliateLink(isbn)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleReaction = async (type: string) => {
    if (!user || isDemo) return
    const isActive = reactions[type]
    try {
      if (isActive) {
        await supabase.from('reactions').delete().eq('essay_id', essayId).eq('user_id', user.id).eq('reaction_type', type)
      } else {
        await supabase.from('reactions').insert({ essay_id: essayId, user_id: user.id, reaction_type: type })
      }
      setReactions(prev => ({ ...prev, [type]: !isActive }))
    } catch {}
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !commentBody.trim() || isDemo) return
    setSubmittingComment(true)
    try {
      const trimBody = commentBody.trim()
      const { data: profile } = await supabase.from('profiles').select('display_name, username').eq('id', user.id).single()

      const { data: newComment, error } = await supabase.from('comments').insert({
        essay_id: essayId,
        user_id: user.id,
        body: trimBody,
      }).select('id, body, created_at, user_id').single()

      if (error) {
        console.error('Insert error:', error.message || JSON.stringify(error))
        throw error
      }
      if (!newComment) throw new Error('No comment returned')

      setComments(prev => [...prev, {
        id: newComment.id,
        body: newComment.body,
        created_at: newComment.created_at,
        user_id: newComment.user_id,
        authorName: profile?.display_name || 'Unknown',
        authorUsername: profile?.username || '',
      }])
      setCommentBody('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Comment failed to save. The comments table may not exist yet — run the migration SQL.'
      console.error(msg)
    }
    setSubmittingComment(false)
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await supabase.from('comments').delete().eq('id', commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch {}
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this essay permanently?')) return
    setDeleting(true)
    try {
      await supabase.from('essays').delete().eq('id', essayId)
      router.push('/dashboard')
    } catch {}
    setDeleting(false)
  }

  const readTime = Math.max(1, Math.ceil(wordCount / 200))
  const date = new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const paragraphs = body.split('\n\n').filter(p => p.trim())
  const flareLabel = flare && flareLabels[flare] ? flareLabels[flare] : flare

  return (
    <>
      <nav className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-sm font-ui text-ink-muted hover:text-accent transition-colors flex items-center gap-1">
                ← Back
              </button>
              <Link href="/" className="text-xl font-display font-bold text-ink-strong tracking-tight">
                Marginalia.
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {bookId && bookId !== 'demo' && (
                <Link href={`/books/${bookId}`} className="text-sm font-ui text-ink-muted hover:text-accent transition-colors">
                  {bookTitle}
                </Link>
              )}
              {user && (
                <Link href={`/${authorUsername}`}>
                  <Avatar name={authorName} size="sm" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {isOwner && !isPublished && (
        <div className="bg-amber/10 border border-amber/30 rounded-xl px-4 py-3 text-sm font-ui text-ink-light mb-6 flex items-center justify-between">
          <span>This essay is a draft — only you can see it.</span>
          <Link href={`/write?edit=${essayId}`} className="text-accent hover:text-accent-hover font-medium">
            Edit →
          </Link>
        </div>
      )}

      {/* Flare + Owner actions */}
      <div className="flex items-center justify-between mt-6 mb-4">
        {flare ? (
          <Badge variant="accent">{flareLabel}</Badge>
        ) : <span />}
        {isOwner && (
          <div className="flex items-center gap-3">
            <Link
              href={`/write?edit=${essayId}`}
              className="text-sm font-ui text-ink-muted hover:text-accent transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm font-ui text-ink-muted hover:text-red transition-colors"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-display font-bold text-ink-strong leading-[1.12] tracking-tight mb-4">
        {title}
      </h1>

      {/* Meta */}
      <div className="flex items-center gap-3 text-sm font-ui text-ink-muted pb-6 border-b border-border mb-8">
        <Link href={`/${authorUsername}`} className="flex items-center gap-2 hover:text-ink transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-amber flex items-center justify-center text-white font-bold text-xs">
            {authorName.charAt(0)}
          </div>
          <span className="text-ink font-medium">{authorName}</span>
        </Link>
        <span>·</span>
        <span>{date}</span>
        <span>·</span>
        <span>{readTime} min read</span>
      </div>

      {/* Body */}
      <div className="font-body text-lg leading-relaxed text-ink space-y-6">
        {paragraphs.map((p, i) => {
          if (i === 0) {
            return (
              <p key={i} className="first-letter:float-left first-letter:text-5xl first-letter:font-display first-letter:text-accent first-letter:leading-[0.8] first-letter:mr-2 first-letter:mt-1">
                {p}
              </p>
            )
          }
          if (p.startsWith('"') || p.startsWith('\u201c') || p.startsWith('What') || p.startsWith('This') || p.startsWith('There')) {
            return (
              <blockquote key={i} className="border-l-[3px] border-accent pl-6 italic text-xl text-ink-light">
                {p}
              </blockquote>
            )
          }
          return <p key={i}>{p}</p>
        })}
      </div>

      {/* Reactions */}
      <div className="flex flex-wrap items-center gap-3 mt-12 pt-8 border-t border-border">
        {isDemo ? (
          <p className="w-full text-sm font-ui text-ink-muted">
            This is a demo essay. <Link href="/write" className="text-accent hover:text-accent-hover">Write your own</Link> to enable reactions.
          </p>
        ) : (
          <>
            {[
              { key: 'resonated', label: '💛 Resonated' },
              { key: 'insightful', label: '📚 Insightful' },
              { key: 'well_written', label: '✍️ Well-written' },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => handleReaction(r.key)}
                className={`px-4 py-2 rounded-full text-sm font-ui font-medium border transition-all ${
                  reactions[r.key]
                    ? 'border-accent text-accent bg-accent-soft/20'
                    : 'border-border text-ink-light hover:border-accent hover:text-accent'
                }`}
              >
                {r.label}
              </button>
            ))}
            <div className="ml-auto">
              {user ? <ReportButton essayId={essayId} /> : null}
            </div>
            {!user && (
              <p className="w-full text-xs font-ui text-ink-muted mt-2">
                <Link href="/" className="text-accent hover:text-accent-hover">Sign in</Link> to react to essays
              </p>
            )}
          </>
        )}
      </div>

      {/* Comments */}
      <section className="mt-12 pt-8 border-t border-border">
        <h2 className="text-lg font-display font-bold text-ink-strong mb-6">
          Comments ({comments.length})
        </h2>

        <div className="space-y-4 mb-8">
          {comments.length === 0 && (
            <p className="text-sm font-ui text-ink-muted">No comments yet. Share your thoughts!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="bg-bg-warm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-amber flex items-center justify-center text-white font-bold text-xs">
                  {c.authorName.charAt(0)}
                </div>
                <Link href={`/${c.authorUsername}`} className="text-sm font-ui font-medium text-ink hover:text-accent transition-colors">
                  {c.authorName}
                </Link>
                <span className="text-xs font-ui text-ink-muted">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {currentUserId === c.user_id && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-xs font-ui text-ink-muted hover:text-red transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <ReportButton commentId={c.id} />
                </div>
              </div>
              <p className="text-sm font-body text-ink-light">{c.body}</p>
            </div>
          ))}
        </div>

        {isDemo ? (
          <p className="text-sm font-ui text-ink-muted">
            This is a demo essay. <Link href="/write" className="text-accent hover:text-accent-hover">Write your own</Link> to enable comments.
          </p>
        ) : user ? (
          <form onSubmit={handleComment} className="flex gap-3">
            <input
              type="text"
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-surface text-sm font-ui text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <Button type="submit" variant="primary" disabled={submittingComment || !commentBody.trim()}>
              {submittingComment ? '...' : 'Post'}
            </Button>
          </form>
        ) : (
          <p className="text-sm font-ui text-ink-muted">
            <Link href="/" className="text-accent hover:text-accent-hover">Sign in</Link> to join the discussion.
          </p>
        )}
      </section>

      {/* Affiliate Card */}
      {affiliateLink && (
        <div className="mt-8 bg-bg-warm rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <BookCover title={bookTitle} author={bookAuthor} size="sm" />
            <div className="flex-1">
              <p className="text-sm font-ui font-medium text-ink">Get This Book</p>
              <p className="text-xs font-ui text-ink-muted">{bookTitle} · {bookAuthor}</p>
              <a
                href={affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm font-ui text-accent hover:text-accent-hover font-medium"
              >
                Buy on Amazon →
              </a>
              <p className="text-xs font-ui text-ink-muted mt-2 italic">
                As an Amazon Associate, Marginalia earns from qualifying purchases.
                This supports the platform at no extra cost to you.
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
    </>
  )
}
