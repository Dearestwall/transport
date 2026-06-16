/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useCallback, useEffect, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import DataTable, { type Column } from '@/components/tables/DataTable'
import TripModal from '@/components/modals/TripModal'
import { tripStatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Trip } from '@/types'

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; trip?: Trip | null }>({ open: false })

  const load = useCallback(async () => {
    setLoading(true)
    const sb = getSupabaseClient()
    const { data } = await sb
      .from('trips')
      .select('*,client:clients(company_name),truck:trucks(truck_number),driver:drivers(full_name)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    setTrips((data ?? []) as Trip[])
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const columns: Column<Trip>[] = [
    { key: 'trip_number', label: 'Trip #', sortable: true, width: '120px' },
    { key: 'client', label: 'Client', render: row => row.client?.company_name ?? '—' },
    { key: 'origin', label: 'Origin', sortable: true },
    { key: 'destination', label: 'Destination', sortable: true },
    { key: 'departure_date', label: 'Departure', sortable: true, render: row => formatDate(row.departure_date) },
    { key: 'driver', label: 'Driver', render: row => row.driver?.full_name ?? '—' },
    { key: 'truck', label: 'Truck', render: row => row.truck?.truck_number ?? '—' },
    { key: 'freight_amount', label: 'Freight', render: row => formatCurrency(row.freight_amount) },
    { key: 'status', label: 'Status', render: row => tripStatusBadge(row.status) },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold">Trips</h1>
          <p className="text-xs text-[var(--color-text-muted)]">{trips.length} records</p>
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
            onClick={() => setModal({ open: true, trip: null })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90"
          >
            <Plus size={13} /> New Trip
          </button>
        </div>
      </div>

      <DataTable
        data={trips}
        columns={columns}
        loading={loading}
        emptyMessage="No trips found."
        onRowClick={row => setModal({ open: true, trip: row })}
      />

      {modal.open && (
        <TripModal
          trip={modal.trip}
          onClose={() => setModal({ open: false })}
          onSaved={load}
        />
      )}
    </div>
  )
}