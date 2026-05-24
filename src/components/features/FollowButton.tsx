'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface FollowButtonProps {
  profileId: string
  isFollowing: boolean
  onToggle?: (following: boolean) => void
}

export function FollowButton({ profileId, isFollowing: initial, onToggle }: FollowButtonProps) {
  const [following, setFollowing] = useState(initial)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/?auth=required')
        return
      }

      if (following) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profileId)
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: profileId })
      }

      setFollowing(!following)
      onToggle?.(!following)
    } catch {}
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-ui font-medium transition-all duration-200 ${
        following
          ? 'border border-border text-ink-light hover:border-red hover:text-red hover:bg-red/5'
          : 'bg-accent text-white hover:bg-accent-hover shadow-sm'
      }`}
    >
      {loading ? '...' : following ? 'Following' : 'Follow'}
    </button>
  )
}
