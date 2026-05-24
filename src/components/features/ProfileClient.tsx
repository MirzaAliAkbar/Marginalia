'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { BookCard } from '@/components/features/BookCard'
import { FollowButton } from '@/components/features/FollowButton'
import { ALL_ACHIEVEMENTS } from '@/lib/achievement-defs'

interface ProfileData {
  id?: string
  display_name: string
  username: string
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  website: string | null
  twitter_handle: string | null
}

interface ProfileStats {
  library_count: number
  books_read: number
  essays_written: number
  words_written: number
  current_streak: number
}

interface EssaySummary {
  id: string
  title: string
  excerpt: string
  bookTitle: string
  bookAuthor: string
  wordCount: number
  createdAt: string
}

interface BookEntry {
  id: string
  shelf: string
  books: {
    id: string
    title: string
    author: string
    cover_url: string | null
    page_count: number | null
  } | null
}

interface ProfileClientProps {
  profile: ProfileData
  stats: ProfileStats
  achievements: string[]
  essays: EssaySummary[]
  books: BookEntry[]
  isOwnProfile: boolean
  followerCount?: number
  followingCount?: number
  isFollowing?: boolean | null
}

export function ProfileClient({ profile, stats, achievements, essays, books, isOwnProfile, followerCount = 0, followingCount = 0, isFollowing = null }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<'essays' | 'reading'>('essays')
  const [copied, setCopied] = useState(false)
  const [followers, setFollowers] = useState(followerCount)
  const [followingNow, setFollowingNow] = useState(isFollowing ?? false)

  const earnedBadges = ALL_ACHIEVEMENTS.filter(a => achievements.includes(a.badge_type))

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Cover Image */}
      <div className="relative h-40 sm:h-56 rounded-2xl overflow-hidden bg-gradient-to-r from-accent-soft/40 to-amber/20">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-20">📖</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="text-center -mt-16 relative z-10 space-y-4 px-4">
        <Avatar name={profile.display_name} src={profile.avatar_url} size="lg" className="mx-auto ring-4 ring-surface" />
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-strong">{profile.display_name}</h1>
          <p className="text-sm font-ui text-ink-muted">@{profile.username}</p>
        </div>
        {profile.bio && (
          <p className="text-sm font-body text-ink-light italic max-w-md mx-auto leading-relaxed">
            {profile.bio}
          </p>
        )}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {profile.website && (
            <a
              href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-ui text-ink-muted hover:text-accent transition-colors"
            >
              🌐 {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {profile.twitter_handle && (
            <a
              href={`https://twitter.com/${profile.twitter_handle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-ui text-ink-muted hover:text-accent transition-colors"
            >
              𝕏 {profile.twitter_handle}
            </a>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-accent text-white text-sm font-ui font-medium hover:bg-accent-hover transition-colors shadow-sm"
          >
            {copied ? '✓ Copied!' : '🔗 Share Profile'}
          </button>
          {isOwnProfile ? (
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-border text-sm font-ui text-ink-light hover:border-accent hover:text-accent transition-colors"
            >
              ⚙️ Edit Profile
            </Link>
          ) : (
            <FollowButton
              profileId={profile.id || ''}
              isFollowing={followingNow}
              onToggle={(val) => {
                setFollowingNow(val)
                setFollowers(prev => val ? prev + 1 : prev - 1)
              }}
            />
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 py-4 border-y border-border">
        {[
          { label: 'Library', value: stats.library_count },
          { label: 'Read', value: stats.books_read },
          { label: 'Essays', value: stats.essays_written },
          { label: 'Words', value: stats.words_written.toLocaleString() },
          { label: 'Followers', value: followers },
          { label: 'Following', value: followingCount },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-xl font-display font-bold text-ink-strong">{s.value}</p>
            <p className="text-xs font-ui text-ink-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      {earnedBadges.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {earnedBadges.map((badge) => (
            <span
              key={badge.badge_type}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-soft/30 text-sm font-ui text-accent"
              title={badge.description}
            >
              <span>{badge.icon}</span>
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {[
          { key: 'essays' as const, label: 'Essays', count: essays.length },
          { key: 'reading' as const, label: 'Reading List', count: books.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-ui font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-accent'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {tab.label}
            <span className="ml-1 text-xs">({tab.count})</span>
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Essays Tab */}
      {activeTab === 'essays' && (
        <div className="space-y-4">
          {essays.length > 0 ? (
            essays.map((essay) => (
              <a
                key={essay.id}
                href={`/essays/${essay.id}`}
                className="block bg-surface rounded-xl border border-border p-4 hover:shadow-sm transition-shadow"
              >
                <h3 className="text-base font-display font-semibold text-ink">{essay.title}</h3>
                {essay.bookTitle && (
                  <p className="text-xs font-ui text-ink-muted mt-1">
                    {essay.bookTitle} · {essay.bookAuthor}
                  </p>
                )}
                <p className="text-sm font-body text-ink-light mt-2 line-clamp-2">{essay.excerpt}</p>
                <div className="flex items-center gap-3 mt-2 text-xs font-ui text-ink-muted">
                  <span>{new Date(essay.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>{Math.max(1, Math.ceil(essay.wordCount / 200))} min read</span>
                </div>
              </a>
            ))
          ) : (
            <p className="text-center text-sm font-ui text-ink-muted py-12">
              {isOwnProfile ? 'You haven\'t published any essays yet.' : 'No essays published yet.'}
            </p>
          )}
        </div>
      )}

      {/* Reading List Tab */}
      {activeTab === 'reading' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.length > 0 ? (
            books.map((entry) => (
              <BookCard
                key={entry.id}
                id={entry.books?.id || entry.id}
                title={entry.books?.title || 'Unknown'}
                author={entry.books?.author || 'Unknown'}
                coverUrl={entry.books?.cover_url}
                shelf={entry.shelf}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-sm font-ui text-ink-muted">
                {isOwnProfile ? 'Your library is empty. Start adding books!' : 'No books in library yet.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
