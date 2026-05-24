import { EssayCard } from './EssayCard'
import { demoEssays } from '@/lib/demo-content'

export function DemoFeed() {
  const essayList = demoEssays.map(e => ({
    id: e.id,
    title: e.title,
    excerpt: e.excerpt,
    authorName: e.author,
    authorUsername: e.username,
    bookTitle: e.bookTitle,
    bookAuthor: e.bookAuthor,
    coverUrl: null as string | null,
    readTime: e.readTime,
    createdAt: new Date().toISOString(),
  }))

  const [featured, ...rest] = essayList

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-ink-strong">Community Essays</h1>
      </div>

      {featured && <EssayCard {...featured} featured />}

      <div className="grid md:grid-cols-3 gap-6">
        {rest.map((essay) => (
          <EssayCard key={essay.id} {...essay} />
        ))}
      </div>

      <p className="text-center text-sm font-ui text-ink-muted pt-4 border-t border-border">
        No essays published yet. Be the first to share your thoughts!
      </p>
    </div>
  )
}
