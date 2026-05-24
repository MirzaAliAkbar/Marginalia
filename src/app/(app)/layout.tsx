'use client'

import { useRouter } from 'next/navigation'
import { NavBar } from '@/components/features/NavBar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <>
      <NavBar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-ui text-ink-muted hover:text-accent transition-colors mb-6 md:hidden"
        >
          ← Back
        </button>
        {children}
      </main>
    </>
  )
}
