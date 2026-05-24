export interface Achievement {
  badge_type: string
  icon: string
  label: string
  description: string
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    badge_type: 'first_book',
    icon: '📖',
    label: 'First Page Turned',
    description: 'Added your first book to your library',
  },
  {
    badge_type: 'first_essay',
    icon: '✍️',
    label: 'Ink Still Wet',
    description: 'Published your first essay',
  },
  {
    badge_type: 'bookshelf_builder',
    icon: '📚',
    label: 'Bookshelf Builder',
    description: 'Added 10+ books to your library',
  },
  {
    badge_type: 'streak_keeper',
    icon: '🔥',
    label: 'Streak Keeper',
    description: 'Maintained a 7+ day reading streak',
  },
  {
    badge_type: 'ten_k_club',
    icon: '📝',
    label: '10K Club',
    description: 'Wrote 10,000+ total words',
  },
  {
    badge_type: 'sharp_eye',
    icon: '🌟',
    label: 'Sharp Eye',
    description: 'Added 5+ books via ISBN',
  },
  {
    badge_type: 'century_reader',
    icon: '🏆',
    label: 'Century Reader',
    description: 'Read 100 books',
  },
  {
    badge_type: 'deep_thinker',
    icon: '✒️',
    label: 'Deep Thinker',
    description: 'Published 10+ essays',
  },
]
