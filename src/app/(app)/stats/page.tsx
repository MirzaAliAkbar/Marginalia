import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { StatsClient } from '@/components/features/StatsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Reading Stats',
  description: 'Your reading analytics and statistics on Marginalia.',
}

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const currentYear = new Date().getFullYear()

  const [
    profileResult,
    booksReadResult,
    libraryResult,
    essaysResult,
    sessionsResult,
    achievementsResult,
    readBooksResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_books').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('shelf', 'read'),
    supabase.from('user_books').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('essays').select('word_count').eq('user_id', user.id).eq('is_published', true),
    supabase.from('reading_sessions').select('*').eq('user_id', user.id).gte('date', String(currentYear) + '-01-01').order('date', { ascending: true }),
    supabase.from('achievements').select('*').eq('user_id', user.id),
    supabase.from('user_books').select('books!inner(page_count)').eq('user_id', user.id).eq('shelf', 'read'),
  ])

  const totalWords = essaysResult.data?.reduce((sum, e) => sum + (e.word_count || 0), 0) || 0
  const sessions = sessionsResult.data || []
  const achievements = achievementsResult.data || []

  const uniqueDays = new Set(sessions.map(s => s.date)).size
  const bookPages = (readBooksResult.data || []).reduce((sum, b) => {
    const book = b.books as unknown as { page_count: number | null } | null
    return sum + (book?.page_count || 0)
  }, 0)
  const totalPages = sessions.reduce((sum, s) => sum + (s.pages_read || 0), 0) + bookPages
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes_read || 0), 0)

  const sortedDates = [...new Set(sessions.map(s => s.date))].sort().reverse() as string[]
  let currentStreak = 0
  let longestStreak = 0
  if (sortedDates.length > 0) {
    currentStreak = 1
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (new Date(sortedDates[i - 1]).getTime() - new Date(sortedDates[i]).getTime()) / 86400000
      if (diff === 1) currentStreak++
      else break
    }
    let temp = 1
    const asc = [...sortedDates].reverse()
    for (let i = 1; i < asc.length; i++) {
      const diff = (new Date(asc[i]).getTime() - new Date(asc[i - 1]).getTime()) / 86400000
      if (diff === 1) { temp++; longestStreak = Math.max(longestStreak, temp) }
      else temp = 1
    }
    longestStreak = Math.max(longestStreak, temp)
  }

  const avgTimePerBook = booksReadResult.count && booksReadResult.count > 0
    ? Math.round(totalMinutes / booksReadResult.count)
    : 0

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthSessions = sessions.filter(s => {
      const d = new Date(s.date)
      return d.getMonth() + 1 === month
    })
    return {
      month: new Date(currentYear, i).toLocaleString('default', { month: 'short' }),
      books: monthSessions.length,
      pages: monthSessions.reduce((sum, s) => sum + (s.pages_read || 0), 0),
    }
  })

  const { count: favoritesCount } = await supabase
    .from('user_books')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_favorite', true)

  const { count: pausedCount } = await supabase
    .from('user_books')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('shelf', 'paused')

  const { count: gaveUpCount } = await supabase
    .from('user_books')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('shelf', 'gave_up')

  const { data: books } = await supabase
    .from('user_books')
    .select('books!inner(genres)')
    .eq('user_id', user.id)

  const genreCounts: Record<string, number> = {}
  books?.forEach(b => {
    const bookData = b.books as { genres?: string[] } | null
    bookData?.genres?.forEach((g: string) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1
    })
  })

  return (
    <StatsClient
      profile={profileResult.data}
      stats={{
        booksRead: booksReadResult.count || 0,
        librarySize: libraryResult.count || 0,
        totalWords,
        totalPages,
        totalMinutes,
        avgTimePerBook,
        currentStreak,
        longestStreak,
        uniqueDays,
        readingGoal: profileResult.data?.reading_goal || 12,
      }}
      monthlyData={monthlyData}
      achievements={achievements}
      collections={{
        favorites: favoritesCount || 0,
        series: 0,
        paused: pausedCount || 0,
        gaveUp: gaveUpCount || 0,
      }}
      genreCounts={genreCounts}
      sessions={sessions.map(s => s.date)}
      year={currentYear}
    />
  )
}
