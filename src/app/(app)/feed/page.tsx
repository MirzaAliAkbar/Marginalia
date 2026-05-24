import { createClient } from '@/lib/supabase/server'
import { EssayCard } from '@/components/features/EssayCard'
import { DemoFeed } from '@/components/features/DemoFeed'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface SearchParams {
  scope?: string
}

export default async function FeedPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { scope } = await searchParams
  const showFollowing = scope === 'following'

  const { count } = await supabase
    .from('essays')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const hasContent = (count ?? 0) > 0

  if (!hasContent) {
    return <DemoFeed />
  }

  let query = supabase
    .from('essays')
    .select('*, profiles!inner(username, display_name), books!inner(title, author, cover_url)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (showFollowing && user) {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = follows?.map(f => f.following_id) || []
    if (followingIds.length > 0) {
      query = query.in('user_id', followingIds)
    } else {
      query = query.in('user_id', ['']) as typeof query
    }
  }

  const { data: essays } = await query

  const essayList = essays?.map(e => ({
    id: e.id,
    title: e.title,
    excerpt: e.body?.substring(0, 200) || '',
    authorName: e.profiles?.display_name || 'Unknown',
    authorUsername: e.profiles?.username || '',
    bookTitle: e.books?.title || '',
    bookAuthor: e.books?.author || '',
    coverUrl: e.books?.cover_url || null,
    readTime: `${Math.max(1, Math.ceil((e.word_count || 0) / 200))} min read`,
    createdAt: e.created_at,
  })) || []

  const featured = essayList[0]
  const rest = essayList.slice(1)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-ink-strong">Community Essays</h1>
        {user && (
          <div className="flex gap-1 bg-bg-warm rounded-lg p-1">
            <Link
              href="/feed"
              className={`px-3 py-1.5 rounded-md text-sm font-ui font-medium transition-colors ${
                !showFollowing ? 'bg-surface text-ink shadow-sm' : 'text-ink-light hover:text-ink'
              }`}
            >
              All
            </Link>
            <Link
              href="/feed?scope=following"
              className={`px-3 py-1.5 rounded-md text-sm font-ui font-medium transition-colors ${
                showFollowing ? 'bg-surface text-ink shadow-sm' : 'text-ink-light hover:text-ink'
              }`}
            >
              Following
            </Link>
          </div>
        )}
      </div>

      {essayList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <span className="text-4xl mb-4">📝</span>
          <h2 className="text-lg font-display font-semibold text-ink">
            {showFollowing ? 'No essays from followed users' : 'No essays yet'}
          </h2>
          <p className="text-sm font-ui text-ink-light">
            {showFollowing ? 'Follow some readers to see their essays here.' : 'Be the first to publish!'}
          </p>
        </div>
      ) : (
        <>
          {featured && (
            <EssayCard {...featured} featured />
          )}
          {rest.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6">
              {rest.map((essay) => (
                <EssayCard key={essay.id} {...essay} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
