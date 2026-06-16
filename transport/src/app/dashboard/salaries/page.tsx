/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import DataTable, { type Column } from '@/components/tables/DataTable'
import { salaryStatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { SalaryRun } from '@/types'

export default function SalariesPage() {
  const [records, setRecords] = useState<SalaryRun[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const sb = getSupabaseClient()
    const { data } = await sb
      .from('salary_records')
      .select('*,driver:drivers(full_name)')
      .order('created_at', { ascending: false })

    setRecords((data ?? []) as SalaryRun[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const columns: Column<SalaryRun>[] = [
    { key: 'driver', label: 'Driver', render: row => row.driver?.full_name ?? '—' },
    { key: 'run_month', label: 'Month', sortable: true },
    { key: 'base_salary', label: 'Base Salary', sortable: true, render: row => formatCurrency(row.base_salary) },
    { key: 'trip_bonus', label: 'Trip Bonus', render: row => formatCurrency(row.trip_bonus) },
    { key: 'deductions', label: 'Deductions', render: row => formatCurrency(row.deductions) },
    { key: 'net_salary', label: 'Net Salary', sortable: true, render: row => formatCurrency(row.net_salary) },
    { key: 'payment_status', label: 'Status', render: row => salaryStatusBadge(row.payment_status) },
    { key: 'payment_date', label: 'Paid On', render: row => row.payment_date ? formatDate(row.payment_date) : '—' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Salaries</h1>
          <p className="text-xs text-[var(--color-text-muted)]">{records.length} records</p>
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

      <DataTable
        data={records}
        columns={columns}
        loading={loading}
        emptyMessage="No salary records found."
      />
    </div>
  )
}