'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ReportButtonProps {
  essayId?: string
  commentId?: string
}

const reasons = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'plagiarism', label: 'Plagiarism' },
  { value: 'offensive', label: 'Offensive' },
  { value: 'other', label: 'Other' },
]

export function ReportButton({ essayId, commentId }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('reports').insert({
        essay_id: essayId || null,
        comment_id: commentId || null,
        user_id: user.id,
        reason: selected,
      })

      if (essayId) {
        const { count } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('essay_id', essayId)

        if (count && count >= 10) {
          await supabase.from('essays').update({ is_published: false }).eq('id', essayId)
        }
      }

      setDone(true)
    } catch {}
    setSubmitting(false)
  }

  if (done) {
    return <span className="text-xs font-ui text-green">Report sent</span>
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs font-ui text-ink-muted hover:text-red transition-colors"
      >
        Report
      </button>
      {open && (
        <div className="absolute bottom-6 right-0 w-56 bg-surface rounded-xl border border-border shadow-lg p-3 z-10 animate-[fade-up_0.15s_ease]">
          <p className="text-xs font-ui font-medium text-ink mb-2">Why are you reporting this?</p>
          <div className="space-y-1 mb-3">
            {reasons.map((r) => (
              <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="report-reason"
                  value={r.value}
                  checked={selected === r.value}
                  onChange={(e) => setSelected(e.target.value)}
                  className="accent-accent"
                />
                <span className="text-xs font-ui text-ink-light">{r.label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-border text-xs font-ui text-ink-light hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              className="flex-1 px-3 py-1.5 rounded-lg bg-red text-white text-xs font-ui font-medium hover:bg-red/80 transition-colors disabled:opacity-50"
            >
              {submitting ? '...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
