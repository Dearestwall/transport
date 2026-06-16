/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useCallback, useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'

const HIERARCHY: Record<UserRole, number> = {
  superadmin: 100,
  admin: 80,
  operations_manager: 60,
  accountant: 50,
  dispatcher: 40,
  data_entry: 20,
  viewer: 10,
}

const PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['*'],
  admin: ['create', 'read', 'approve_edit', 'export', 'run_salary'],
  operations_manager: ['create', 'read', 'export'],
  accountant: ['read', 'create_invoice', 'run_salary', 'export'],
  dispatcher: ['create_trip', 'read', 'update_trip_status'],
  data_entry: ['create', 'read'],
  viewer: ['read'],
}

export function usePermissions() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRole = useCallback(async () => {
    try {
      const sb = getSupabaseClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) {
        setRole(null)
        setLoading(false)
        return
      }
      const { data } = await sb.from('profiles').select('role').eq('id', user.id).single()
      setRole((data?.role as UserRole) ?? 'viewer')
    } catch {
      setRole('viewer')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRole()
  }, [fetchRole])

  const can = useCallback((permission: string) => {
    if (!role) return false
    const ps = PERMISSIONS[role] ?? []
    return ps.includes('*') || ps.includes(permission)
  }, [role])

  const isAtLeast = useCallback((minRole: UserRole) => {
    return role ? HIERARCHY[role] >= HIERARCHY[minRole] : false
  }, [role])

  return {
    role,
    loading,
    can,
    isAtLeast,
    isSuperAdmin: role === 'superadmin',
    isAdmin: role ? HIERARCHY[role] >= HIERARCHY.admin : false,
  }
}