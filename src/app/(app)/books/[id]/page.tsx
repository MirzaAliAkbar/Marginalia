import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BookDetailClient } from '@/components/features/BookDetailClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: book } = await supabase.from('books').select('*').eq('id', id).single()
  if (!book) return { title: 'Book Not Found' }
  return {
    title: `${book.title} by ${book.author}`,
    description: book.description?.substring(0, 160) || `Read ${book.title} and join the discussion on Marginalia.`,
    openGraph: {
      title: `${book.title} — Marginalia`,
      description: book.description?.substring(0, 160) || '',
    },
  }
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: book } = await supabase.from('books').select('*').eq('id', id).single()
  if (!book) return notFound()

  const { data: userBook } = await supabase
    .from('user_books')
    .select('*')
    .eq('user_id', user.id)
    .eq('book_id', id)
    .maybeSingle()

  const { count: readerCount } = await supabase
    .from('user_books')
    .select('*', { count: 'exact', head: true })
    .eq('book_id', id)

  const { data: essays } = await supabase
    .from('essays')
    .select('*, profiles!inner(username, display_name)')
    .eq('book_id', id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]
  const { data: todaySession } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle()

  return (
    <BookDetailClient
      book={book}
      userBook={userBook}
      readerCount={readerCount || 0}
      essayCount={essays?.length || 0}
      essays={essays || []}
      todaySession={todaySession}
    />
  )
}
