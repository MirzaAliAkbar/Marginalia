'use client'

import { useState, useMemo } from 'react'
import { StatCard } from '@/components/ui/StatCard'

interface StatsClientProps {
  profile: { reading_goal?: number } | null
  stats: {
    booksRead: number
    librarySize: number
    totalWords: number
    totalPages: number
    totalMinutes: number
    avgTimePerBook: number
    currentStreak: number
    longestStreak: number
    uniqueDays: number
    readingGoal: number
  }
  monthlyData: { month: string; books: number; pages: number }[]
  achievements: { badge_type: string; earned_at: string }[]
  collections: { favorites: number; series: number; paused: number; gaveUp: number }
  genreCounts: Record<string, number>
  sessions: string[]
  year: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function StatsClient({ stats, monthlyData, genreCounts, collections, sessions }: StatsClientProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const todaySessions = sessions.filter(s => s === todayStr).length

  const readingGoalProgress = Math.min(100, (stats.booksRead / stats.readingGoal) * 100)
  const maxMonthlyBooks = Math.max(...monthlyData.map(m => m.books), 1)

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = (firstDay.getDay() + 6) % 7

    const days: { date: string; day: number; active: boolean; isToday: boolean }[] = []

    for (let i = 0; i < startDayOfWeek; i++) {
      const d = new Date(currentYear, currentMonth, -startDayOfWeek + i + 1)
      days.push({ date: d.toISOString().split('T')[0], day: d.getDate(), active: false, isToday: false })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(currentYear, currentMonth, i)
      const dateStr = d.toISOString().split('T')[0]
      days.push({
        date: dateStr,
        day: i,
        active: sessions.includes(dateStr),
        isToday: dateStr === todayStr,
      })
    }

    const remaining = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i)
      days.push({ date: d.toISOString().split('T')[0], day: d.getDate(), active: false, isToday: false })
    }

    return days
  }, [currentMonth, currentYear, sessions, todayStr])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-ink-strong">Your {currentYear} Reading Year</h1>
        <select
          value={currentYear}
          onChange={(e) => setCurrentYear(parseInt(e.target.value))}
          className="px-3 py-1.5 rounded-lg border border-border bg-surface text-sm font-ui text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {[2025, 2026, 2027].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="📖" value={stats.booksRead} label="Books Read" />
        <StatCard icon="📄" value={stats.totalPages} label="Pages Read" />
        <StatCard icon="✍️" value={stats.totalWords} label="Words Written" />
        <StatCard icon="⏱️" value={stats.avgTimePerBook} label="Avg Min / Book" />
      </div>

      {/* Reading Goal */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-display font-semibold text-ink">Reading Goal</h2>
          <span className="text-sm font-ui text-ink-muted">{stats.booksRead} of {stats.readingGoal} books</span>
        </div>
        <div className="w-full h-3 bg-bg-warm rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-amber rounded-full transition-all"
            style={{ width: `${readingGoalProgress}%` }}
          />
        </div>
        <p className="text-xs font-ui text-ink-muted mt-2">
          {readingGoalProgress.toFixed(0)}% complete
        </p>
      </div>

      {/* Monthly Chart */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-display font-semibold text-ink mb-4">Monthly Reading</h2>
        <div className="space-y-2">
          {monthlyData.map((m) => (
            <div key={m.month} className="flex items-center gap-3">
              <span className="text-xs font-ui text-ink-muted w-8 text-right">{m.month}</span>
              <div className="flex-1 h-6 bg-bg-warm rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${(m.books / maxMonthlyBooks) * 100}%` }}
                />
              </div>
              <span className="text-xs font-ui text-ink-muted w-6">{m.books}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reading Calendar */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) }
              else setCurrentMonth(currentMonth - 1)
            }}
            className="text-ink-muted hover:text-ink transition-colors"
          >
            ←
          </button>
          <h2 className="text-lg font-display font-semibold text-ink">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={() => {
              if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) }
              else setCurrentMonth(currentMonth + 1)
            }}
            className="text-ink-muted hover:text-ink transition-colors"
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-xs font-ui text-ink-muted py-1">{d}</div>
          ))}
          {calendarDays.map((day, i) => (
            <div
              key={i}
              className={`py-1.5 text-sm font-ui rounded-lg ${
                day.isToday
                  ? 'ring-2 ring-accent ring-inset'
                  : day.active
                    ? 'bg-accent/20 text-accent font-medium'
                    : 'text-ink-light'
              }`}
            >
              {day.day}
            </div>
          ))}
        </div>
      </div>

      {/* Streak */}
      <div className="bg-bg-warm rounded-xl border border-border p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-display font-bold text-accent">{stats.currentStreak}</p>
            <p className="text-xs font-ui text-ink-muted">🔥 Current Streak</p>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-ink-strong">{stats.longestStreak}</p>
            <p className="text-xs font-ui text-ink-muted">🏆 Longest Streak</p>
          </div>
          <div>
            <p className="text-3xl font-display font-bold text-ink-strong">{stats.uniqueDays}</p>
            <p className="text-xs font-ui text-ink-muted">📅 Days Read This Year</p>
          </div>
        </div>
      </div>

      {/* Tag Cloud */}
      {Object.keys(genreCounts).length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-lg font-display font-semibold text-ink mb-4">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(genreCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([genre, count]) => (
                <span
                  key={genre}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-bg-warm text-sm font-ui text-ink-light"
                >
                  #{genre} <span className="text-xs text-ink-muted">{count}</span>
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Collections Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <span className="text-2xl">⭐</span>
          <p className="text-xl font-display font-bold text-ink-strong">{collections.favorites}</p>
          <p className="text-xs font-ui text-ink-muted">Favorites</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <span className="text-2xl">📚</span>
          <p className="text-xl font-display font-bold text-ink-strong">{collections.series}</p>
          <p className="text-xs font-ui text-ink-muted">Series</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <span className="text-2xl">⏸️</span>
          <p className="text-xl font-display font-bold text-ink-strong">{collections.paused}</p>
          <p className="text-xs font-ui text-ink-muted">Paused</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <span className="text-2xl">🚫</span>
          <p className="text-xl font-display font-bold text-ink-strong">{collections.gaveUp}</p>
          <p className="text-xs font-ui text-ink-muted">Gave Up</p>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-display font-semibold text-ink mb-4">Today</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-display font-bold text-ink-strong">{todaySessions > 0 ? '✓' : '0'}</p>
            <p className="text-xs font-ui text-ink-muted">Pages Read</p>
          </div>
          <div>
            <p className="text-xl font-display font-bold text-ink-strong">{todaySessions > 0 ? '✓' : '0'}</p>
            <p className="text-xs font-ui text-ink-muted">Minutes Read</p>
          </div>
          <div>
            <p className="text-xl font-display font-bold text-ink-strong">0</p>
            <p className="text-xs font-ui text-ink-muted">Words Written</p>
          </div>
        </div>
      </div>
    </div>
  )
}
