import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

async function resolveReport(reportId: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (!(await isAdmin(user.id))) throw new Error('Unauthorized')

  await supabase
    .from('reports')
    .update({ resolved: true, resolved_by: user.id, resolved_at: new Date().toISOString() })
    .eq('id', reportId)

  revalidatePath('/admin/reports')
}

async function deleteReport(reportId: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (!(await isAdmin(user.id))) throw new Error('Unauthorized')

  await supabase.from('reports').delete().eq('id', reportId)
  revalidatePath('/admin/reports')
}

async function hideEssay(essayId: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (!(await isAdmin(user.id))) throw new Error('Unauthorized')

  await supabase.from('essays').update({ is_published: false }).eq('id', essayId)
  revalidatePath('/admin/reports')
}

async function deleteComment(commentId: string) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  if (!(await isAdmin(user.id))) throw new Error('Unauthorized')

  await supabase.from('comments').delete().eq('id', commentId)
  revalidatePath('/admin/reports')
}

export default async function AdminReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/?auth=required')
  if (!(await isAdmin(user.id))) redirect('/dashboard')

  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      profiles!reports_user_id_fkey(username, display_name),
      essays!reports_essay_id_fkey(id, title, user_id, is_published, profiles!essays_user_id_fkey(username, display_name)),
      comments!reports_comment_id_fkey(id, body, user_id, profiles!comments_user_id_fkey(username, display_name))
    `)
    .eq('resolved', false)
    .order('created_at', { ascending: false })

  const { data: resolvedReports } = await supabase
    .from('reports')
    .select(`
      *,
      profiles!reports_user_id_fkey(username, display_name),
      resolved_by_profile:profiles!reports_resolved_by_fkey(username, display_name)
    `)
    .eq('resolved', true)
    .order('resolved_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-ink-strong">Reports</h1>
        <p className="text-sm font-ui text-ink-muted mt-1">{reports?.length || 0} pending</p>
      </div>

      {reports && reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-surface rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-ui">
                    <span className="font-medium text-ink">Reported by {report.profiles?.display_name || report.profiles?.username}</span>
                    <span className="text-ink-muted">•</span>
                    <span className="text-ink-muted">{new Date(report.created_at).toLocaleString()}</span>
                  </div>
                  <div className="inline-flex px-2 py-0.5 rounded text-xs font-ui font-medium bg-red/10 text-red">
                    {report.reason}
                  </div>
                  {report.essays && (
                    <div className="mt-3 p-3 bg-bg-warm rounded-lg">
                      <p className="text-xs font-ui text-ink-muted uppercase tracking-wider">Reported Essay</p>
                      <p className="text-sm font-ui font-medium text-ink mt-1">{report.essays.title}</p>
                      <p className="text-xs font-ui text-ink-light">
                        by {report.essays.profiles?.display_name || report.essays.profiles?.username}
                        {report.essays.is_published ? '' : ' (unpublished)'}
                      </p>
                    </div>
                  )}
                  {report.comments && (
                    <div className="mt-3 p-3 bg-bg-warm rounded-lg">
                      <p className="text-xs font-ui text-ink-muted uppercase tracking-wider">Reported Comment</p>
                      <p className="text-sm font-ui text-ink mt-1">{report.comments.body.substring(0, 200)}</p>
                      <p className="text-xs font-ui text-ink-light">
                        by {report.comments.profiles?.display_name || report.comments.profiles?.username}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {report.essay_id && (
                    <form action={hideEssay.bind(null, report.essay_id)}>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-red/10 text-red text-xs font-ui font-medium hover:bg-red/20 transition-colors"
                      >
                        Hide Essay
                      </button>
                    </form>
                  )}
                  {report.comment_id && (
                    <form action={deleteComment.bind(null, report.comment_id)}>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-red/10 text-red text-xs font-ui font-medium hover:bg-red/20 transition-colors"
                      >
                        Delete Comment
                      </button>
                    </form>
                  )}
                  <form action={resolveReport.bind(null, report.id)}>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-green/10 text-green text-xs font-ui font-medium hover:bg-green/20 transition-colors"
                    >
                      Resolve
                    </button>
                  </form>
                  <form action={deleteReport.bind(null, report.id)}>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg border border-border text-ink-light text-xs font-ui font-medium hover:text-ink transition-colors"
                    >
                      Dismiss
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-lg font-ui text-ink-muted">No pending reports</p>
          <p className="text-sm font-ui text-ink-muted mt-1">Everything looks clean</p>
        </div>
      )}

      {resolvedReports && resolvedReports.length > 0 && (
        <section>
          <h2 className="text-lg font-display font-bold text-ink-strong mb-4">Recently Resolved</h2>
          <div className="space-y-2">
            {resolvedReports.map((report) => (
              <div key={report.id} className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-ui text-ink-muted">{report.reason}</span>
                  <span className="text-xs font-ui text-ink-light">
                    Resolved by {report.resolved_by_profile?.display_name || report.resolved_by_profile?.username}
                  </span>
                </div>
                <span className="text-xs font-ui text-ink-muted">
                  {new Date(report.resolved_at!).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
