import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { StatCard } from '@/components/ui/StatCard'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/?auth=required')
  if (!(await isAdmin(user.id))) redirect('/dashboard')

  const [
    { count: totalUsers },
    { count: totalBooks },
    { count: totalPublishedEssays },
    { count: totalUnpublishedEssays },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('books').select('*', { count: 'exact', head: true }),
    supabase.from('essays').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('essays').select('*', { count: 'exact', head: true }).eq('is_published', false),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('resolved', false),
  ])

  const { data: recentReports } = await supabase
    .from('reports')
    .select('*, profiles!reports_user_id_fkey(username, display_name)')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, username, display_name, created_at, is_admin')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display font-bold text-ink-strong">Admin Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon="👥" value={totalUsers ?? 0} label="Users" />
        <StatCard icon="📚" value={totalBooks ?? 0} label="Books" />
        <StatCard icon="📝" value={totalPublishedEssays ?? 0} label="Published Essays" />
        <StatCard icon="📄" value={totalUnpublishedEssays ?? 0} label="Drafts" />
        <StatCard icon="🚩" value={pendingReports ?? 0} label="Pending Reports" accent />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-ink-strong">Pending Reports</h2>
            <Link href="/admin/reports" className="text-sm font-ui text-accent hover:text-accent-hover">View all</Link>
          </div>
          {recentReports && recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-ui text-ink-light">Reported by </span>
                    <span className="font-ui font-medium text-ink">{report.profiles?.display_name || report.profiles?.username}</span>
                    <span className="font-ui text-ink-muted ml-2">— {report.reason}</span>
                  </div>
                  <span className="text-xs font-ui text-ink-muted">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-ui text-ink-muted">No pending reports</p>
          )}
        </div>

        <div className="bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-ink-strong">Recent Users</h2>
            <Link href="/admin/users" className="text-sm font-ui text-accent hover:text-accent-hover">View all</Link>
          </div>
          {recentUsers && recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-ui font-medium text-ink">{profile.display_name}</span>
                    <span className="font-ui text-ink-muted">@{profile.username}</span>
                    {profile.is_admin && (
                      <span className="text-xs bg-accent-soft/40 text-accent px-1.5 py-0.5 rounded font-ui font-medium">Admin</span>
                    )}
                  </div>
                  <span className="text-xs font-ui text-ink-muted">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm font-ui text-ink-muted">No users yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
