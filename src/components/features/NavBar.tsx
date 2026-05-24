'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { AddBookModal } from './AddBookModal'

export function NavBar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [plusMenuOpen, setPlusMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [addBookOpen, setAddBookOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const plusRef = useRef<HTMLDivElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setIsAdmin(data?.is_admin ?? false))
  }, [user, supabase])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (plusRef.current && !plusRef.current.contains(e.target as Node)) {
        setPlusMenuOpen(false)
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileNavOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setMobileNavOpen(false), 0)
    return () => clearTimeout(timer)
  }, [pathname])

  const navLinks = [
    { href: '/dashboard', label: 'Home', icon: '🏠' },
    { href: '/feed', label: 'Feed', icon: '📰' },
    { href: '/library', label: 'Library', icon: '📚' },
    { href: '/drafts', label: 'Drafts', icon: '✏️' },
    { href: '/stats', label: 'Stats', icon: '📊' },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <><nav className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/dashboard"
            className="text-2xl font-display font-bold text-ink-strong tracking-tight"
          >
            Marginalia.
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-ui font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-soft/30 text-accent'
                      : 'text-ink-light hover:text-ink hover:bg-bg-warm'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <div className="md:hidden relative" ref={mobileRef}>
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-light hover:text-ink hover:bg-bg-warm transition-colors"
                aria-label="Navigation menu"
              >
                <span className="text-xl">{mobileNavOpen ? '✕' : '☰'}</span>
              </button>
              {mobileNavOpen && (
                <div className="absolute right-0 top-12 w-56 bg-surface rounded-xl border border-border shadow-lg py-2 animate-[fade-up_0.2s_ease] z-50">
                  {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href)
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`w-full px-4 py-2.5 text-left text-sm font-ui transition-colors flex items-center gap-3 ${
                          isActive ? 'text-accent font-medium bg-accent-soft/10' : 'text-ink hover:bg-bg-warm'
                        }`}
                      >
                        <span>{link.icon}</span>
                        {link.label}
                      </Link>
                    )
                  })}
                  <hr className="my-1 border-border" />
                  <button
                    onClick={() => { setMobileNavOpen(false); setAddBookOpen(true) }}
                    className="w-full px-4 py-2.5 text-left text-sm font-ui text-ink hover:bg-bg-warm transition-colors flex items-center gap-3"
                  >
                    <span>📖</span>
                    Add a Book
                  </button>
                  <button
                    onClick={() => { setMobileNavOpen(false); router.push('/write') }}
                    className="w-full px-4 py-2.5 text-left text-sm font-ui text-ink hover:bg-bg-warm transition-colors flex items-center gap-3"
                  >
                    <span>✍️</span>
                    Write an Essay
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => { setMobileNavOpen(false); router.push('/admin') }}
                      className="w-full px-4 py-2.5 text-left text-sm font-ui text-ink hover:bg-bg-warm transition-colors flex items-center gap-3"
                    >
                      <span>🛡️</span>
                      Admin
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Plus button (desktop) */}
            <div className="relative hidden md:block" ref={plusRef}>
              <button
                onClick={() => setPlusMenuOpen(!plusMenuOpen)}
                className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-xl font-light shadow-sm hover:bg-accent-hover hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                aria-label="Add new"
              >
                +
              </button>
              {plusMenuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-surface rounded-xl border border-border shadow-lg py-2 animate-[fade-up_0.2s_ease]">
                  <button
                    onClick={() => {
                      setPlusMenuOpen(false)
                      setAddBookOpen(true)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-ui text-ink hover:bg-bg-warm transition-colors flex items-center gap-3"
                  >
                    <span className="text-lg">📖</span>
                    Add a Book
                  </button>
                  <button
                    onClick={() => {
                      setPlusMenuOpen(false)
                      router.push('/write')
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-ui text-ink hover:bg-bg-warm transition-colors flex items-center gap-3"
                  >
                    <span className="text-lg">✍️</span>
                    Write an Essay
                  </button>
                </div>
              )}
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="focus:outline-none"
                aria-label="User menu"
              >
                <Avatar name={user?.user_metadata?.display_name || user?.email || 'User'} size="sm" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-12 w-52 bg-surface rounded-xl border border-border shadow-lg py-2 animate-[fade-up_0.2s_ease]">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      router.push(`/${user?.user_metadata?.username || 'profile'}`)
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-ui text-ink hover:bg-bg-warm transition-colors flex items-center gap-3"
                  >
                    <span className="text-lg">👤</span>
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      router.push('/settings')
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-ui text-ink hover:bg-bg-warm transition-colors flex items-center gap-3"
                  >
                    <span className="text-lg">⚙️</span>
                    Settings
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        router.push('/admin')
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm font-ui text-ink hover:bg-bg-warm transition-colors flex items-center gap-3"
                    >
                      <span className="text-lg">🛡️</span>
                      Admin
                    </button>
                  )}
                  <hr className="my-1 border-border" />
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2.5 text-left text-sm font-ui text-red hover:bg-red/5 transition-colors flex items-center gap-3"
                  >
                    <span className="text-lg">🚪</span>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
      <AddBookModal open={addBookOpen} onClose={() => setAddBookOpen(false)} />
    </>
  )
}
