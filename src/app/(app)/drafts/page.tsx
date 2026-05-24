import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Drafts',
}

export default async function DraftsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: drafts } = await supabase
    .from('essays')
    .select('*, books!inner(title, author)')
    .eq('user_id', user.id)
    .eq('is_published', false)
    .order('updated_at', { ascending: false })

  const { data: published } = await supabase
    .from('essays')
    .select('*, books!inner(title, author)')
    .eq('user_id', user.id)
    .eq('is_published', true)
    .order('updated_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-strong">My Writing</h1>
        <p className="text-sm font-ui text-ink-muted mt-1">
          {drafts?.length || 0} drafts · {published?.length || 0} published
        </p>
      </div>

      {(!drafts || drafts.length === 0) && (!published || published.length === 0) ? (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-lg font-ui text-ink-muted">No essays yet</p>
          <Link href="/write" className="mt-4 inline-block">
            <Button variant="primary">Write your first essay</Button>
          </Link>
        </div>
      ) : (
        <>
          {drafts && drafts.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-bold text-ink-strong mb-4">Drafts</h2>
              <div className="space-y-3">
                {drafts.map((essay) => (
                  <div key={essay.id} className="bg-surface rounded-xl border border-border p-5 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/essays/${essay.id}`}
                        className="text-base font-display font-bold text-ink-strong hover:text-accent transition-colors"
                      >
                        {essay.title || 'Untitled'}
                      </Link>
                      <p className="text-sm font-ui text-ink-light mt-1">
                        {essay.books?.title || 'No book'} · {essay.word_count || 0} words
                      </p>
                      <p className="text-xs font-ui text-ink-muted mt-1">
                        Last edited {new Date(essay.updated_at || essay.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/write?edit=${essay.id}`}>
                        <Button variant="secondary" size="sm">Edit</Button>
                      </Link>
                      <Link href={`/write?edit=${essay.id}&publish=true`}>
                        <Button variant="primary" size="sm">Publish</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {published && published.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-bold text-ink-strong mb-4">Published</h2>
              <div className="space-y-3">
                {published.map((essay) => (
                  <div key={essay.id} className="bg-surface rounded-xl border border-border p-5 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/essays/${essay.id}`}
                        className="text-base font-display font-bold text-ink-strong hover:text-accent transition-colors"
                      >
                        {essay.title}
                      </Link>
                      <p className="text-sm font-ui text-ink-light mt-1">
                        {essay.books?.title || 'No book'}
                      </p>
                      <p className="text-xs font-ui text-ink-muted mt-1">
                        Published {new Date(essay.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/write?edit=${essay.id}`}>
                      <Button variant="secondary" size="sm">Edit</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
