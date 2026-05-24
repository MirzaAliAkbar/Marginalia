import Link from 'next/link'
import { BookCover } from '@/components/ui/BookCover'
import { demoEssays } from '@/lib/demo-content'
import { LandingAuth } from '@/components/features/LandingAuth'

export default function LandingPage() {
  return (
    <>
      <LandingAuth />
      <Nav />

      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 fade-up">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-ink-strong leading-[1.08] tracking-tight">
                Where
                <br />
                <span className="text-accent">Readers</span>
                <br />
                Write
              </h1>
              <p className="text-lg font-body text-ink-light leading-relaxed max-w-md">
                Marginalia is a beautifully designed space for book lovers to track
                their reading, write literary essays, and build a public intellectual
                portfolio.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  id="get-started-btn"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-accent text-white font-ui font-medium text-base shadow-sm hover:bg-accent-hover hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  Get Started — It&apos;s Free
                </button>
                <Link
                  href="/elara_writes"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-ink-light text-ink-light font-ui font-medium text-base hover:border-accent hover:text-accent transition-colors duration-200"
                >
                  See an Example Profile
                </Link>
              </div>
            </div>

            {/* Hero mockup */}
            <div className="hidden md:flex justify-center fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative w-72">
                <div className="bg-surface rounded-2xl border border-border shadow-lg overflow-hidden">
                  <div className="h-2 bg-accent" />
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-amber flex items-center justify-center text-white font-bold text-sm">
                        E
                      </div>
                      <div>
                        <p className="text-sm font-ui font-semibold text-ink">Elara Chen</p>
                        <p className="text-xs font-ui text-ink-muted">@elara_writes</p>
                      </div>
                    </div>

                    <div className="flex gap-3 mb-4 text-xs font-ui text-ink-muted border-t border-b border-border py-3">
                      <span className="flex-1 text-center"><strong className="text-ink block text-sm">24</strong>Library</span>
                      <span className="flex-1 text-center"><strong className="text-ink block text-sm">18</strong>Read</span>
                      <span className="flex-1 text-center"><strong className="text-ink block text-sm">7</strong>Essays</span>
                    </div>

                    <div className="space-y-3">
                      {demoEssays.slice(0, 2).map((essay) => (
                        <div key={essay.id} className="flex gap-3">
                          <BookCover title={essay.bookTitle} author={essay.bookAuthor} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-ui text-ink-muted truncate">
                              {essay.bookTitle}
                            </p>
                            <p className="text-sm font-display font-semibold text-ink leading-tight line-clamp-2">
                              {essay.title}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 w-64 h-4 bg-accent/10 rounded-full blur-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-surface border-y border-border py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-ink-strong text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '📖',
                  title: 'Add books to your shelf',
                  desc: 'Search any book, add it to your library, and organize it by what you\'ve read, are reading, or want to read.',
                },
                {
                  icon: '✍️',
                  title: 'Write essays about what you read',
                  desc: 'Compose thoughtful literary essays in a distraction-free editor. Every essay is yours — beautifully presented.',
                },
                {
                  icon: '🔗',
                  title: 'Share your reading portfolio',
                  desc: 'Your profile becomes a curated showcase of your reading life and writing. Share it anywhere.',
                },
              ].map((step, i) => (
                <div
                  key={step.title}
                  className="text-center p-6 fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-4xl block mb-4">{step.icon}</span>
                  <h3 className="text-lg font-display font-semibold text-ink mb-2">{step.title}</h3>
                  <p className="text-sm font-body text-ink-light leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Essays / Social Proof */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-ink-strong text-center mb-12">
              Essays from the Community
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {demoEssays.map((essay, i) => (
                <Link
                  key={essay.id}
                  href={`/${essay.username}`}
                  className="group bg-surface rounded-xl border border-border shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 overflow-hidden fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`h-32 bg-gradient-to-br ${essay.gradient} flex items-end p-4`}>
                    <div>
                      <p className="text-xs text-white/70 font-ui">{essay.bookTitle}</p>
                      <p className="text-sm text-white font-display font-bold">{essay.bookAuthor}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-display font-semibold text-ink group-hover:text-accent transition-colors line-clamp-2">
                      {essay.title}
                    </h3>
                    <p className="text-sm font-body text-ink-light mt-1 line-clamp-2">
                      {essay.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-xs font-ui text-ink-muted">{essay.author}</span>
                      <span className="text-xs font-ui text-ink-muted">{essay.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Marginalia */}
        <section className="bg-bg-warm py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-ink-strong text-center mb-12">
              Why Marginalia?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: '🎯',
                  title: 'A dedicated space',
                  desc: 'Not mixed with your work docs or social media. Just your reading life, beautifully organized.',
                },
                {
                  icon: '🎓',
                  title: 'Built for students',
                  desc: 'Build a reading portfolio you can share with universities. Your Marginalia profile is your intellectual resume.',
                },
                {
                  icon: '🔥',
                  title: 'Stay consistent',
                  desc: 'Earn achievements and track streaks that keep you reading. Small habits, big impact.',
                },
                {
                  icon: '✨',
                  title: 'Your words, your way',
                  desc: 'Every essay you write is yours — beautifully presented and always accessible. No algorithms, no ads.',
                },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="bg-surface rounded-xl border border-border p-6 fade-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <span className="text-3xl block mb-3">{item.icon}</span>
                  <h3 className="text-base font-display font-semibold text-ink mb-1">{item.title}</h3>
                  <p className="text-sm font-body text-ink-light leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* University Portfolio Callout */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-accent-soft/20 to-amber-50 rounded-2xl border border-accent-soft/40 p-8 md:p-12 md:flex items-center gap-12">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-3xl font-display font-bold text-ink-strong mb-4">
                  Your Reading Life, On Your Resume
                </h2>
                <p className="text-base font-body text-ink-light leading-relaxed mb-6">
                  Students use Marginalia profiles in college applications to demonstrate intellectual
                  curiosity, writing ability, and consistent reading habits. Your profile becomes
                  a living document of your engagement with ideas.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-ui text-ink-muted">
                  <span className="text-accent font-mono">marginalia.app/</span>
                  <span className="text-ink font-mono font-semibold">yourname</span>
                </div>
              </div>
              <div className="md:w-1/2 bg-surface rounded-xl border border-border shadow-lg p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red" />
                  <div className="w-3 h-3 rounded-full bg-amber" />
                  <div className="w-3 h-3 rounded-full bg-green" />
                  <span className="text-xs font-ui text-ink-muted ml-2">marginalia.app/yourname</span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-amber flex items-center justify-center text-white font-bold text-xs">
                    Y
                  </div>
                  <div>
                    <p className="text-sm font-ui font-semibold text-ink">Your Name</p>
                    <p className="text-xs font-ui text-ink-muted">24 books · 12 essays · 8-week streak</p>
                  </div>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-sm font-body text-ink-light leading-relaxed">
                    &ldquo;Marginalia helped me document my reading journey in a way that
                    admissions officers actually noticed. My profile was mentioned in my
                    interview.&rdquo;
                  </p>
                  <p className="text-xs font-ui text-ink-muted mt-2">— A Marginalia user</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

function Nav() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-2xl font-display font-bold text-ink-strong tracking-tight"
          >
            Marginalia.
          </Link>
          <button
            id="nav-get-started"
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-ui font-medium shadow-sm hover:bg-accent-hover hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="bg-ink-strong text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-display font-bold mb-2">Marginalia.</h3>
            <p className="text-sm font-body text-white/60 leading-relaxed">
              Where readers write. A beautifully designed space for your reading life.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-ui font-semibold text-white/80 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm font-ui text-white/60">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/feed" className="hover:text-white transition-colors">Feed</Link></li>
              <li><Link href="/elara_writes" className="hover:text-white transition-colors">Example Profile</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-ui font-semibold text-white/80 mb-3">Legal</h4>
            <ul className="space-y-2 text-sm font-ui text-white/60">
              <li><span className="hover:text-white transition-colors cursor-pointer">Privacy</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Terms</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Contact</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-ui font-semibold text-white/80 mb-3">Connect</h4>
            <div className="flex gap-3">
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm hover:bg-white/20 transition-colors cursor-pointer">𝕏</span>
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm hover:bg-white/20 transition-colors cursor-pointer">in</span>
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm hover:bg-white/20 transition-colors cursor-pointer">ig</span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-xs font-ui text-white/40">
          Made with love for readers. &copy; {new Date().getFullYear()} Marginalia.
        </div>
      </div>
    </footer>
  )
}
