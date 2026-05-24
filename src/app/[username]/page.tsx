import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ProfileClient } from '@/components/features/ProfileClient'
import { demoProfiles, demoEssays } from '@/lib/demo-content'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params

  const demoProfile = demoProfiles.find(p => p.username === username)
  if (demoProfile) {
    return {
      title: `${demoProfile.displayName} (@${demoProfile.username}) — Marginalia`,
      description: demoProfile.bio,
      openGraph: {
        title: `${demoProfile.displayName} (@${demoProfile.username}) — Marginalia`,
        description: demoProfile.bio,
        type: 'profile',
      },
    }
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, bio')
    .eq('username', username)
    .single()

  if (!profile) return { title: 'Profile Not Found' }

  return {
    title: `${profile.display_name} (@${profile.username}) — Marginalia`,
    description: profile.bio || 'A reader on Marginalia.',
    openGraph: {
      title: `${profile.display_name} (@${profile.username}) — Marginalia`,
      description: profile.bio || 'A reader on Marginalia.',
      type: 'profile',
    },
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const demoProfile = demoProfiles.find(p => p.username === username)
  if (demoProfile) {
    const userEssays = demoEssays.filter(e => e.username === username)
    return (
      <ProfileClient
        profile={{
          display_name: demoProfile.displayName,
          username: demoProfile.username,
          bio: demoProfile.bio,
          avatar_url: null,
          cover_url: demoProfile.cover_url || null,
          website: demoProfile.website || null,
          twitter_handle: demoProfile.twitter_handle || null,
        }}
        stats={{ library_count: 24, books_read: 18, essays_written: 7, words_written: 12400, current_streak: 5 }}
        achievements={['first_book', 'first_essay', 'bookshelf_builder', 'ten_k_club']}
        essays={userEssays.map(e => ({
          id: e.id,
          title: e.title,
          excerpt: e.excerpt,
          bookTitle: e.bookTitle,
          bookAuthor: e.bookAuthor,
          wordCount: e.body?.split(/\s+/).length || 50,
          createdAt: new Date().toISOString(),
        }))}
        books={[]}
        isOwnProfile={false}
      />
    )
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) return notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  const [booksResult, essaysResult, achievementsResult, readCountResult, followersResult, followingResult] = await Promise.all([
    supabase.from('user_books').select('*, books(*)').eq('user_id', profile.id).order('created_at', { ascending: false }),
    supabase.from('essays').select('*').eq('user_id', profile.id).eq('is_published', true).order('created_at', { ascending: false }),
    supabase.from('achievements').select('*').eq('user_id', profile.id),
    supabase.from('user_books').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).eq('shelf', 'read'),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
  ])

  let isFollowing: boolean | null = null
  if (user && !isOwnProfile) {
    const { data: followRow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .maybeSingle()
    isFollowing = !!followRow
  }

  const essays = essaysResult.data || []
  const totalWords = essays.reduce((sum, e) => sum + (e.word_count || 0), 0)

  const { data: sessions } = await supabase
    .from('reading_sessions')
    .select('date')
    .eq('user_id', profile.id)
    .order('date', { ascending: false })

  const dates = [...new Set((sessions || []).map(s => s.date))].sort().reverse() as string[]
  let streak = 0
  if (dates.length > 0) {
    streak = 1
    for (let i = 1; i < dates.length; i++) {
      const diff = (new Date(dates[i - 1]).getTime() - new Date(dates[i]).getTime()) / 86400000
      if (diff === 1) streak++
      else break
    }
  }

  return (
    <ProfileClient
      profile={{ ...profile, id: profile.id }}
      stats={{
        library_count: (booksResult.data || []).length,
        books_read: readCountResult.count || 0,
        essays_written: essays.length,
        words_written: totalWords,
        current_streak: streak,
      }}
      achievements={achievementsResult.data?.map(a => a.badge_type) || []}
      essays={essays.map(e => ({
        id: e.id,
        title: e.title,
        excerpt: e.body?.substring(0, 200) || '',
        bookTitle: '',
        bookAuthor: '',
        wordCount: e.word_count || 0,
        createdAt: e.created_at,
      }))}
      books={booksResult.data || []}
      isOwnProfile={isOwnProfile}
      followerCount={followersResult.count || 0}
      followingCount={followingResult.count || 0}
      isFollowing={isFollowing}
    />
  )
}
