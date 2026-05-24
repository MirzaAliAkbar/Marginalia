import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { WriteClient } from '@/components/features/WriteClient'

export const metadata: Metadata = {
  title: 'Write an Essay',
  description: 'Write about what you are reading on Marginalia.',
}

interface PageProps {
  searchParams: Promise<{ edit?: string }>
}

export default async function WritePage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { edit } = await searchParams

  const { data: userBooks } = await supabase
    .from('user_books')
    .select('id, book_id, books!inner(id, title, author, cover_url)')
    .eq('user_id', user.id)

  type UserBookJoin = {
    id: string
    book_id: string
    books: { id: string; title: string; author: string; cover_url: string | null } | null
  }
  const entries = (userBooks || []) as unknown as UserBookJoin[]
  const books = entries.map((ub) => ({
    id: ub.books?.id || ub.book_id,
    title: ub.books?.title || '',
    author: ub.books?.author || '',
  }))

  return <WriteClient books={books} editId={edit} />
}
