import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  async function updateProfile(formData: FormData) {
    'use server'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const displayName = formData.get('display_name') as string
    const bio = formData.get('bio') as string
    const coverUrl = formData.get('cover_url') as string
    const website = formData.get('website') as string
    const twitterHandle = formData.get('twitter_handle') as string
    const readingGoal = parseInt(formData.get('reading_goal') as string) || 12

    await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio,
        cover_url: coverUrl,
        website,
        twitter_handle: twitterHandle,
        reading_goal: readingGoal,
      })
      .eq('id', user.id)

    redirect('/settings?updated=true')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-display font-bold text-ink-strong">Settings</h1>

      <form action={updateProfile} className="bg-surface rounded-xl border border-border p-6 space-y-6">
        <div>
          <label htmlFor="display_name" className="block text-sm font-ui font-medium text-ink-light mb-1.5">
            Display Name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            defaultValue={profile?.display_name || ''}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface font-ui text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-ui font-medium text-ink-light mb-1.5">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={profile?.bio || ''}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface font-ui text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
          />
        </div>

        <div>
          <label htmlFor="cover_url" className="block text-sm font-ui font-medium text-ink-light mb-1.5">
            Cover Image URL
          </label>
          <input
            id="cover_url"
            name="cover_url"
            type="url"
            defaultValue={profile?.cover_url || ''}
            placeholder="https://example.com/cover.jpg"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface font-ui text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="website" className="block text-sm font-ui font-medium text-ink-light mb-1.5">
              Website
            </label>
            <input
              id="website"
              name="website"
              type="url"
              defaultValue={profile?.website || ''}
              placeholder="https://yoursite.com"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface font-ui text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <div>
            <label htmlFor="twitter_handle" className="block text-sm font-ui font-medium text-ink-light mb-1.5">
              Twitter / X Handle
            </label>
            <input
              id="twitter_handle"
              name="twitter_handle"
              type="text"
              defaultValue={profile?.twitter_handle || ''}
              placeholder="@username"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface font-ui text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reading_goal" className="block text-sm font-ui font-medium text-ink-light mb-1.5">
            Annual Reading Goal
          </label>
          <input
            id="reading_goal"
            name="reading_goal"
            type="number"
            min={1}
            max={365}
            defaultValue={profile?.reading_goal || 12}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface font-ui text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-ui font-medium hover:bg-accent-hover transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
}
