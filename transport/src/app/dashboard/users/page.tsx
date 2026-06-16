/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSupabaseClient } from '@/lib/supabase/client'
import { deactivateUser, updateUserRole } from '@/actions/auth'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Profile, UserRole } from '@/types'

const ROLES: UserRole[] = [
  'superadmin',
  'admin',
  'operations_manager',
  'accountant',
  'dispatcher',
  'data_entry',
  'viewer',
]

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const sb = getSupabaseClient()
    const { data } = await sb.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers((data ?? []) as Profile[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const res = await updateUserRole(userId, newRole)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('Role updated')
    load()
  }

  const handleDeactivate = async (userId: string, name: string) => {
    if (!window.confirm(`Deactivate ${name}?`)) return
    const res = await deactivateUser(userId)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('User deactivated')
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Users</h1>
          <p className="text-xs text-[var(--color-text-muted)]">{users.length} members</p>
        </div>

        <button
          onClick={load}
          disabled={loading}
          title="Refresh"
          aria-label="Refresh"
          className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-offset)] disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--color-surface-offset)] border-b border-[var(--color-border)]">
            <tr>
              {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-[var(--color-text-muted)] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--color-divider)]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-3 py-2.5">
                      <div className="h-4 rounded bg-[var(--color-surface-offset)] animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-[var(--color-surface-offset)] transition-colors">
                  <td className="px-3 py-2.5 text-xs font-medium whitespace-nowrap">{user.full_name}</td>
                  <td className="px-3 py-2.5 text-xs text-[var(--color-text-muted)] whitespace-nowrap">{user.email}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user.id, e.target.value as UserRole)}
                      className="rounded border border-[var(--color-border)] bg-transparent px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                    >
                      {ROLES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <Badge variant={user.is_active ? 'success' : 'danger'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {user.is_active && (
                      <button
                        onClick={() => handleDeactivate(user.id, user.full_name)}
                        title="Deactivate user"
                        className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <UserX size={11} /> Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}