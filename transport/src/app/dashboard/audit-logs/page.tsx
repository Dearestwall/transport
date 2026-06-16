/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import DataTable, { type Column } from '@/components/tables/DataTable'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { AuditLog, EditRequest } from '@/types'

export default function AuditLogsPage() {
  const [tab, setTab] = useState<'audit' | 'requests'>('audit')
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [requests, setRequests] = useState<EditRequest[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const sb = getSupabaseClient()

    const [logsRes, reqRes] = await Promise.all([
      sb
        .from('audit_logs')
        .select('*,user:profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(200),
      sb
        .from('edit_requests')
        .select('*,requester:profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(200),
    ])

    setLogs((logsRes.data ?? []) as AuditLog[])
    setRequests((reqRes.data ?? []) as EditRequest[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const auditColumns: Column<AuditLog>[] = [
    { key: 'created_at', label: 'Date', sortable: true, render: row => formatDate(row.created_at) },
    { key: 'table_name', label: 'Table', sortable: true },
    { key: 'action', label: 'Action', sortable: true, render: row => (
      <Badge
        variant={
          row.action === 'INSERT'
            ? 'success'
            : row.action === 'UPDATE'
            ? 'info'
            : 'danger'
        }
      >
        {row.action}
      </Badge>
    )},
    { key: 'record_id', label: 'Record ID' },
    { key: 'reason', label: 'Reason' },
    { key: 'user', label: 'User', render: row => row.user?.full_name ?? '—' },
  ]

  const requestColumns: Column<EditRequest>[] = [
    { key: 'created_at', label: 'Requested', sortable: true, render: row => formatDate(row.created_at) },
    { key: 'table_name', label: 'Table', sortable: true },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status', render: row => (
      <Badge
        variant={
          row.status === 'approved'
            ? 'success'
            : row.status === 'rejected'
            ? 'danger'
            : 'warning'
        }
      >
        {row.status}
      </Badge>
    )},
    { key: 'requester', label: 'Requester', render: row => row.requester?.full_name ?? row.requested_by },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Audit Logs</h1>
          <p className="text-xs text-[var(--color-text-muted)]">Audit trail and edit requests</p>
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

      <div className="flex gap-2">
        <button
          onClick={() => setTab('audit')}
          className={`px-3 py-1.5 text-xs rounded-lg border ${
            tab === 'audit'
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'border-[var(--color-border)] hover:bg-[var(--color-surface-offset)]'
          }`}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setTab('requests')}
          className={`px-3 py-1.5 text-xs rounded-lg border ${
            tab === 'requests'
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'border-[var(--color-border)] hover:bg-[var(--color-surface-offset)]'
          }`}
        >
          Edit Requests
        </button>
      </div>

      {tab === 'audit' ? (
        <DataTable
          data={logs}
          columns={auditColumns}
          loading={loading}
          emptyMessage="No audit logs found."
        />
      ) : (
        <DataTable
          data={requests}
          columns={requestColumns}
          loading={loading}
          emptyMessage="No edit requests found."
        />
      )}
    </div>
  )
}