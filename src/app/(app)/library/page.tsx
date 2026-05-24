import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LibraryClient } from '@/components/features/LibraryClient'

export default async function LibraryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: books } = await supabase
    .from('user_books')
    .select('*, books(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: currentlyReading } = await supabase
    .from('user_books')
    .select('*, books(*)')
    .eq('user_id', user.id)
    .eq('shelf', 'reading')
    .maybeSingle()

  return <LibraryClient books={books || []} currentlyReading={currentlyReading} />
}
