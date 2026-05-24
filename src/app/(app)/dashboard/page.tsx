import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BookCover } from '@/components/ui/BookCover'
import { EssayCard } from '@/components/features/EssayCard'
import { StatCard } from '@/components/ui/StatCard'
import { demoEssays } from '@/lib/demo-content'
import { ProfileLinkCard } from '@/components/features/ProfileLinkCard'

async function getDashboardData(userId: string) {
  const supabase = await createClient()
  const [
    profileResult,
    booksReadResult,
    librarySizeResult,
    essaysWrittenResult,
    currentBookResult,
    essaysResult,
    publishedCountResult,
    sessionsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_books').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('shelf', 'read'),
    supabase.from('user_books').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('essays').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_published', true),
    supabase.from('user_books').select('*, books(*)').eq('user_id', userId).eq('shelf', 'reading').maybeSingle(),
    supabase.from('essays').select('*, profiles!inner(username, display_name), books!inner(title, author, cover_url)').eq('is_published', true).order('created_at', { ascending: false }).limit(9),
    supabase.from('essays').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('reading_sessions').select('date').eq('user_id', userId).order('date', { ascending: false }),
  ])

  const sessions = sessionsResult.data || []
  const uniqueDates = [...new Set(sessions.map(s => s.date))].sort().reverse() as string[]
  let currentStreak = 0
  if (uniqueDates.length > 0) {
    currentStreak = 1
    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = (new Date(uniqueDates[i - 1]).getTime() - new Date(uniqueDates[i]).getTime()) / 86400000
      if (diff === 1) currentStreak++
      else break
    }
  }

  return {
    profile: profileResult.data,
    stats: {
      books_read: booksReadResult.count ?? 0,
      library_size: librarySizeResult.count ?? 0,
      current_streak: currentStreak,
      essays_written: essaysWrittenResult.count ?? 0,
    },
    currentBook: currentBookResult.data,
    essays: essaysResult.data,
    hasRealContent: (publishedCountResult.count ?? 0) > 0,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const data = await getDashboardData(user.id)

  const displayEssays = data.hasRealContent && data.essays && data.essays.length > 0
    ? data.essays.map(e => ({
        id: e.id,
        title: e.title,
        excerpt: e.body?.substring(0, 150) || '',
        authorName: e.profiles?.display_name || 'Unknown',
        authorUsername: e.profiles?.username || '',
        bookTitle: e.books?.title || '',
        bookAuthor: e.books?.author || '',
        coverUrl: e.books?.cover_url || null,
        readTime: `${Math.max(1, Math.ceil((e.word_count || 0) / 200))} min read`,
        createdAt: e.created_at,
        featured: false,
      }))
    : demoEssays.map(e => ({
        id: `demo-${e.id}`,
        title: e.title,
        excerpt: e.excerpt,
        authorName: e.author,
        authorUsername: e.username,
        bookTitle: e.bookTitle,
        bookAuthor: e.bookAuthor,
        coverUrl: null,
        readTime: e.readTime,
        createdAt: new Date().toISOString(),
        featured: false,
      }))

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-ink-strong rounded-2xl p-6 md:p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          Welcome back, {data.profile?.display_name || user.email?.split('@')[0] || 'Reader'}
        </h1>
        <p className="text-white/70 font-ui text-sm mt-1">
          What book did you read today?
        </p>
        <div className="flex gap-3 mt-4">
          <Link
            href="/library?add=book"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-ui font-medium hover:bg-accent-hover transition-colors"
          >
            <span>+</span> Add a Book
          </Link>
          <Link
            href="/write"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-white text-sm font-ui font-medium hover:bg-white/10 transition-colors"
          >
            <span>✍️</span> Write an Essay
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="📖" value={data.stats.books_read} label="Books Read" />
        <StatCard icon="📚" value={data.stats.library_size} label="Library Size" />
        <StatCard icon="🔥" value={data.stats.current_streak} label="Current Streak" accent />
        <StatCard icon="✍️" value={data.stats.essays_written} label="Essays Written" />
      </div>

      {/* Profile Link Card */}
      {data.profile && (
        <ProfileLinkCard username={data.profile.username} displayName={data.profile.display_name} />
      )}

      {/* Currently Reading */}
      {data.currentBook && (
        <div className="bg-surface rounded-xl border border-border shadow-sm p-4 md:p-6 flex items-center gap-6">
          <BookCover
            title={data.currentBook.books?.title || ''}
            author={data.currentBook.books?.author || ''}
            coverUrl={data.currentBook.books?.cover_url}
            size="lg"
          />
          <div className="flex-1">
            <p className="text-xs font-ui text-ink-muted uppercase tracking-wider">Currently Reading</p>
            <h2 className="text-xl font-display font-bold text-ink mt-1">
              {data.currentBook.books?.title}
            </h2>
            <p className="text-sm font-ui text-ink-light">{data.currentBook.books?.author}</p>
            {data.currentBook.books?.page_count && data.currentBook.books.page_count > 0 && (
              <div className="mt-4">
                <div className="w-full h-2 bg-bg-warm rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, ((data.currentBook.progress_pages || 0) / data.currentBook.books.page_count) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs font-ui text-ink-muted mt-1">
                  {data.currentBook.progress_pages || 0} of {data.currentBook.books.page_count} pages
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Community Essays */}
      <section>
        <h2 className="text-xl font-display font-bold text-ink-strong mb-6">
          Recent Community Essays
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {displayEssays.map((essay) => (
            <EssayCard key={essay.id} {...essay} />
          ))}
        </div>
      </section>
    </div>
  )
}
