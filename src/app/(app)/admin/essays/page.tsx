import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

async function togglePublish(essayId: string, publish: boolean) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (!(await isAdmin(user.id))) throw new Error('Unauthorized')

  await supabase.from('essays').update({ is_published: publish }).eq('id', essayId)
  revalidatePath('/admin/essays')
}

async function deleteEssay(essayId: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (!(await isAdmin(user.id))) throw new Error('Unauthorized')

  await supabase.from('essays').delete().eq('id', essayId)
  revalidatePath('/admin/essays')
}

interface SearchParams {
  status?: string
  search?: string
}

export default async function AdminEssaysPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/?auth=required')
  if (!(await isAdmin(user.id))) redirect('/dashboard')

  const { status, search } = await searchParams

  let query = supabase
    .from('essays')
    .select('*, profiles!inner(username, display_name), books!inner(title, author)')
    .order('created_at', { ascending: false })

  if (status === 'published') {
    query = query.eq('is_published', true)
  } else if (status === 'drafts') {
    query = query.eq('is_published', false)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,profiles.display_name.ilike.%${search}%`)
  }

  const { data: essays } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-ink-strong">Essays</h1>
        <p className="text-sm font-ui text-ink-muted">{essays?.length || 0} total</p>
      </div>

      <div className="flex gap-3">
        <form className="flex gap-3 flex-1">
          <input
            name="search"
            type="text"
            defaultValue={search || ''}
            placeholder="Search by title or author..."
            className="flex-1 max-w-md px-4 py-2.5 rounded-lg border border-border bg-surface font-ui text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-ui font-medium hover:bg-accent-hover transition-colors"
          >
            Search
          </button>
        </form>
        <div className="flex gap-2">
          <Link
            href="/admin/essays"
            className={`px-3 py-2 rounded-lg text-sm font-ui font-medium transition-colors ${
              !status ? 'bg-accent-soft/30 text-accent' : 'text-ink-light hover:text-ink'
            }`}
          >
            All
          </Link>
          <Link
            href="/admin/essays?status=published"
            className={`px-3 py-2 rounded-lg text-sm font-ui font-medium transition-colors ${
              status === 'published' ? 'bg-accent-soft/30 text-accent' : 'text-ink-light hover:text-ink'
            }`}
          >
            Published
          </Link>
          <Link
            href="/admin/essays?status=drafts"
            className={`px-3 py-2 rounded-lg text-sm font-ui font-medium transition-colors ${
              status === 'drafts' ? 'bg-accent-soft/30 text-accent' : 'text-ink-light hover:text-ink'
            }`}
          >
            Drafts
          </Link>
        </div>
      </div>

      {essays && essays.length > 0 ? (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-warm/50">
                  <th className="text-left px-4 py-3 font-ui font-medium text-ink-light">Title</th>
                  <th className="text-left px-4 py-3 font-ui font-medium text-ink-light">Author</th>
                  <th className="text-left px-4 py-3 font-ui font-medium text-ink-light">Book</th>
                  <th className="text-left px-4 py-3 font-ui font-medium text-ink-light">Status</th>
                  <th className="text-left px-4 py-3 font-ui font-medium text-ink-light">Date</th>
                  <th className="text-right px-4 py-3 font-ui font-medium text-ink-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {essays.map((essay) => (
                  <tr key={essay.id} className="border-b border-border last:border-b-0 hover:bg-bg-warm/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/essays/${essay.id}`}
                        className="font-ui font-medium text-ink hover:text-accent transition-colors"
                      >
                        {essay.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs font-ui text-ink-light">
                      {essay.profiles?.display_name || essay.profiles?.username}
                    </td>
                    <td className="px-4 py-3 text-xs font-ui text-ink-light">
                      {essay.books?.title}
                    </td>
                    <td className="px-4 py-3">
                      {essay.is_published ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-ui font-medium bg-green/10 text-green">Published</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-ui font-medium text-ink-muted border border-border">Draft</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-ui text-ink-muted">
                      {new Date(essay.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <form action={togglePublish.bind(null, essay.id, !essay.is_published)}>
                          <button
                            type="submit"
                            className={`px-3 py-1 rounded-lg text-xs font-ui font-medium transition-colors ${
                              essay.is_published
                                ? 'border border-border text-ink-light hover:text-ink'
                                : 'bg-green/10 text-green hover:bg-green/20'
                            }`}
                          >
                            {essay.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                        </form>
                        <form action={deleteEssay.bind(null, essay.id)}>
                          <button
                            type="submit"
                            className="px-3 py-1 rounded-lg bg-red/10 text-red text-xs font-ui font-medium hover:bg-red/20 transition-colors"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-lg font-ui text-ink-muted">No essays found</p>
        </div>
      )}
    </div>
  )
}
