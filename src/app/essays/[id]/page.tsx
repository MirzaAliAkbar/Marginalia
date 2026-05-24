import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { EssayReadingClient } from '@/components/features/EssayReadingClient'
import { demoEssays } from '@/lib/demo-content'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params

  if (id.startsWith('demo-')) {
    const demo = demoEssays.find(e => e.id === id)
    if (!demo) return { title: 'Essay Not Found' }
    return {
      title: `${demo.title} — Marginalia`,
      description: demo.excerpt,
      openGraph: {
        title: `${demo.title} — Marginalia`,
        description: demo.excerpt,
        type: 'article',
      },
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: essay } = await supabase
    .from('essays')
    .select('*, profiles!inner(display_name, username), books!inner(title, author)')
    .eq('id', id)
    .or(`is_published.eq.true,and(is_published.eq.false,user_id.eq.${user?.id || 'none'})`)
    .single()

  if (!essay) return { title: 'Essay Not Found' }

  return {
    title: `${essay.title} — Marginalia`,
    description: essay.body?.substring(0, 160) || '',
    authors: essay.profiles?.display_name || '',
    openGraph: {
      title: `${essay.title} — Marginalia`,
      description: essay.body?.substring(0, 160) || '',
      type: 'article',
      authors: [essay.profiles?.display_name || ''],
    },
  }
}

export default async function EssayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (id.startsWith('demo-')) {
    const demo = demoEssays.find(e => e.id === id)
    if (!demo) return notFound()
    return (
      <EssayReadingClient
        title={demo.title}
        body={demo.body || demo.excerpt}
        authorName={demo.author}
        authorUsername={demo.username}
        bookTitle={demo.bookTitle}
        bookAuthor={demo.bookAuthor}
        bookId="demo"
        isbn={null}
        wordCount={demo.body?.split(/\s+/).length || 50}
        createdAt={new Date().toISOString()}
        essayId={id}
        flare={null}
        isOwner={false}
        currentUserId={null}
        isPublished={false}
        comments={[]}
      />
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: essay } = await supabase
    .from('essays')
    .select('*, profiles!inner(display_name, username), books!inner(title, author, isbn)')
    .eq('id', id)
    .or(`is_published.eq.true,and(is_published.eq.false,user_id.eq.${user?.id || 'none'})`)
    .single()

  if (!essay) return notFound()

  const essayBooks = essay.books as { title: string; author: string; id: string; isbn: string | null } | null

  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles!inner(display_name, username)')
    .eq('essay_id', id)
    .order('created_at', { ascending: true })

  const isOwner = user?.id === essay.user_id

  return (
    <EssayReadingClient
      title={essay.title}
      body={essay.body}
      flare={essay.flare}
      authorName={essay.profiles?.display_name || 'Unknown'}
      authorUsername={essay.profiles?.username || ''}
      bookTitle={essayBooks?.title || ''}
      bookAuthor={essayBooks?.author || ''}
      bookId={essayBooks?.id || ''}
      isbn={essayBooks?.isbn || null}
      wordCount={essay.word_count || 0}
      createdAt={essay.created_at}
      essayId={essay.id}
      isOwner={isOwner}
      currentUserId={user?.id || null}
      isPublished={essay.is_published}
      comments={(comments || []).map(c => ({
        id: c.id,
        body: c.body,
        created_at: c.created_at,
        user_id: c.user_id,
        authorName: (c.profiles as { display_name: string } | null)?.display_name || 'Unknown',
        authorUsername: (c.profiles as { username: string } | null)?.username || '',
      }))}
    />
  )
}
