import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/admin'

async function toggleAdmin(userId: string, makeAdmin: boolean) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (!(await isAdmin(user.id))) throw new Error('Unauthorized')

  await supabase.from('profiles').update({ is_admin: makeAdmin }).eq('id', userId)
  revalidatePath('/admin/users')
}

interface SearchParams {
  search?: string
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/?auth=required')
  if (!(await isAdmin(user.id))) redirect('/dashboard')

  const { search } = await searchParams

  let query = supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url, is_admin, created_at, suspended')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`)
  }

  const { data: profiles } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-ink-strong">Users</h1>
        <p className="text-sm font-ui text-ink-muted">{profiles?.length || 0} total</p>
      </div>

      <form className="flex gap-3">
        <input
          name="search"
          type="text"
          defaultValue={search || ''}
          placeholder="Search by name or username..."
          className="flex-1 max-w-md px-4 py-2.5 rounded-lg border border-border bg-surface font-ui text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <button
          type="submit"
          className="px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-ui font-medium hover:bg-accent-hover transition-colors"
        >
          Search
        </button>
      </form>

      {profiles && profiles.length > 0 ? (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-bg-warm/50">
                  <th className="text-left px-4 py-3 font-ui font-medium text-ink-light">User</th>
                  <th className="text-left px-4 py-3 font-ui font-medium text-ink-light">Role</th>
                  <th className="text-left px-4 py-3 font-ui font-medium text-ink-light">Joined</th>
                  <th className="text-right px-4 py-3 font-ui font-medium text-ink-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border-b border-border last:border-b-0 hover:bg-bg-warm/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-ui font-medium text-ink">{profile.display_name}</p>
                        <p className="font-ui text-ink-muted text-xs">@{profile.username}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {profile.is_admin ? (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-ui font-medium bg-accent-soft/40 text-accent">Admin</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-ui font-medium text-ink-muted border border-border">User</span>
                      )}
                      {profile.suspended && (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-ui font-medium bg-red/10 text-red ml-1">Suspended</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-ui text-ink-muted">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {profile.id !== user.id && (
                        <form
                          action={toggleAdmin.bind(null, profile.id, !profile.is_admin)}
                          className="inline"
                        >
                          <button
                            type="submit"
                            className={`px-3 py-1 rounded-lg text-xs font-ui font-medium transition-colors ${
                              profile.is_admin
                                ? 'border border-border text-ink-light hover:text-ink'
                                : 'bg-accent-soft/40 text-accent hover:bg-accent-soft/60'
                            }`}
                          >
                            {profile.is_admin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-lg font-ui text-ink-muted">No users found</p>
          {search && <p className="text-sm font-ui text-ink-muted mt-1">Try a different search term</p>}
        </div>
      )}
    </div>
  )
}
