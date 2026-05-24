export { ALL_ACHIEVEMENTS } from './achievement-defs'
export type { Achievement } from './achievement-defs'

export async function checkAchievements(userId: string) {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const newAchievements: string[] = []

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (!profile) return newAchievements

  const { count: bookCount } = await supabase
    .from('user_books')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count: essayCount } = await supabase
    .from('essays')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_published', true)

  const { count: readCount } = await supabase
    .from('user_books')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('shelf', 'read')

  const { count: isbnCount } = await supabase
    .from('user_books')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { data: wordData } = await supabase
    .from('essays')
    .select('word_count')
    .eq('user_id', userId)
    .eq('is_published', true)

  const totalWords = wordData?.reduce((sum, e) => sum + (e.word_count || 0), 0) || 0

  const { data: sessions } = await supabase
    .from('reading_sessions')
    .select('date')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  let longestStreak = 0
  let currentStreak = 0

  if (sessions && sessions.length > 0) {
    const dates = [...new Set(sessions.map(s => s.date))].sort().reverse()
    let streak = 1
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86400000
      if (diff === 1) {
        streak++
      } else {
        break
      }
    }
    currentStreak = streak

    let maxStreak = 1
    let tempStreak = 1
    const sortedAsc = [...dates].sort()
    for (let i = 1; i < sortedAsc.length; i++) {
      const diff = (new Date(sortedAsc[i]).getTime() - new Date(sortedAsc[i - 1]).getTime()) / 86400000
      if (diff === 1) {
        tempStreak++
        maxStreak = Math.max(maxStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }
    longestStreak = maxStreak
  }

  const checks = [
    { badge: 'first_book', condition: (bookCount || 0) >= 1 },
    { badge: 'first_essay', condition: (essayCount || 0) >= 1 },
    { badge: 'bookshelf_builder', condition: (bookCount || 0) >= 10 },
    { badge: 'streak_keeper', condition: currentStreak >= 7 || longestStreak >= 7 },
    { badge: 'ten_k_club', condition: totalWords >= 10000 },
    { badge: 'sharp_eye', condition: (isbnCount || 0) >= 5 },
    { badge: 'century_reader', condition: (readCount || 0) >= 100 },
    { badge: 'deep_thinker', condition: (essayCount || 0) >= 10 },
  ]

  for (const { badge, condition } of checks) {
    if (condition) {
      const { data: existing } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_type', badge)
        .maybeSingle()

      if (!existing) {
        await supabase
          .from('achievements')
          .insert({ user_id: userId, badge_type: badge })
        newAchievements.push(badge)
      }
    }
  }

  return newAchievements
}
