'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveEditRequest(id: string, reviewNote?: string) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single()
  if (!['superadmin', 'admin'].includes(profile?.role ?? '')) {
    return { error: 'Insufficient permissions' }
  }

  const { data: req, error: fetchErr } = await sb
    .from('edit_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !req) return { error: 'Request not found' }

  const { error: applyErr } = await sb
    .from(req.table_name as string)
    .update(req.changes as Record<string, unknown>)
    .eq('id', req.record_id as string)

  if (applyErr) return { error: applyErr.message }

  const { error } = await sb
    .from('edit_requests')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      applied_at: new Date().toISOString(),
      review_note: reviewNote ?? null,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function rejectEditRequest(id: string, reviewNote: string) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single()
  if (!['superadmin', 'admin'].includes(profile?.role ?? '')) {
    return { error: 'Insufficient permissions' }
  }

  const { error } = await sb
    .from('edit_requests')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}