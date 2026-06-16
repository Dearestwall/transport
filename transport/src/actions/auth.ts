'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/types'

export async function inviteUser(email: string, role: UserRole, fullName: string) {
  const sb = await createClient()
  const { data: { user: admin } } = await sb.auth.getUser()
  if (!admin) return { error: 'Unauthorized' }

  const { data: profile } = await sb.from('profiles').select('role').eq('id', admin.id).single()
  if (!['superadmin', 'admin'].includes(profile?.role ?? '')) {
    return { error: 'Insufficient permissions' }
  }

  const { data, error } = await sb.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role },
  })
  if (error) return { error: error.message }

  await sb.from('profiles').upsert({
    id: data.user.id,
    email,
    full_name: fullName,
    role,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function updateUserRole(userId: string, role: UserRole) {
  const sb = await createClient()
  const { data: { user: admin } } = await sb.auth.getUser()
  if (!admin) return { error: 'Unauthorized' }

  const { data: profile } = await sb.from('profiles').select('role').eq('id', admin.id).single()
  if (profile?.role !== 'superadmin') return { error: 'Insufficient permissions' }

  const { error } = await sb
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/users')
  return { success: true }
}

export async function deactivateUser(userId: string) {
  const sb = await createClient()
  const { data: { user: admin } } = await sb.auth.getUser()
  if (!admin) return { error: 'Unauthorized' }

  const { data: profile } = await sb.from('profiles').select('role').eq('id', admin.id).single()
  if (!['superadmin', 'admin'].includes(profile?.role ?? '')) {
    return { error: 'Insufficient permissions' }
  }

  const { error } = await sb
    .from('profiles')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/users')
  return { success: true }
}