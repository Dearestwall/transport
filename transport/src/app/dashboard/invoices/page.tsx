/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useCallback, useEffect, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import DataTable, { type Column } from '@/components/tables/DataTable'
import InvoiceModal from '@/components/modals/InvoiceModal'
import { invoiceStatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/types'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; invoice?: Invoice | null }>({ open: false })

  const load = useCallback(async () => {
    setLoading(true)
    const sb = getSupabaseClient()
    const { data } = await sb
      .from('invoices')
      .select('*,client:clients(company_name)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    setInvoices((data ?? []) as Invoice[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const columns: Column<Invoice>[] = [
    { key: 'invoice_number', label: 'Invoice #', sortable: true, width: '120px' },
    { key: 'client', label: 'Client', render: row => row.client?.company_name ?? '—' },
    { key: 'invoice_date', label: 'Invoice Date', sortable: true, render: row => formatDate(row.invoice_date) },
    { key: 'due_date', label: 'Due Date', sortable: true, render: row => formatDate(row.due_date) },
    { key: 'total_amount', label: 'Total', render: row => formatCurrency(row.total_amount) },
    { key: 'balance_amount', label: 'Balance', render: row => formatCurrency(row.balance_amount) },
    { key: 'status', label: 'Status', render: row => invoiceStatusBadge(row.status) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Invoices</h1>
          <p className="text-xs text-[var(--color-text-muted)]">{invoices.length} records</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            title="Refresh"
            aria-label="Refresh"
            className="p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-offset)] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setModal({ open: true, invoice: null })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90"
          >
            <Plus size={13} /> New Invoice
          </button>
        </div>
      </div>

      <DataTable
        data={invoices}
        columns={columns}
        loading={loading}
        emptyMessage="No invoices found."
        onRowClick={row => setModal({ open: true, invoice: row })}
      />

      {modal.open && (
        <InvoiceModal
          invoice={modal.invoice}
          onClose={() => setModal({ open: false })}
          onSaved={load}
        />
      )}
    </div>
  )
}