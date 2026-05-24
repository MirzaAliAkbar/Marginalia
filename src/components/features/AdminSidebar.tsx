'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/reports', label: 'Reports', icon: '🚩' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/essays', label: 'Essays', icon: '📝' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-ui transition-colors ${
              isActive
                ? 'bg-accent-soft/30 text-accent font-medium'
                : 'text-ink-light hover:text-ink hover:bg-bg-warm'
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        )
      })}
    </aside>
  )
}
