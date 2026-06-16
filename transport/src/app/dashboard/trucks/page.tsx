'use client'

import { useMemo, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import TruckModal from '@/components/modals/TruckModal'

type TruckRow = {
  id: string
  truck_number: string | null
  model: string | null
  capacity_tons: number | null
  insurance_expiry: string | null
  service_due_date: string | null
  status: 'active' | 'maintenance' | 'inactive' | null
  created_at: string
}

const initialTrucks: TruckRow[] = []

export default function TrucksPage() {
  const [trucks] = useState<TruckRow[]>(initialTrucks ?? [])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<TruckRow | null>(null)

  const totalTrucks = useMemo(() => trucks.length, [trucks])
  const activeTrucks = useMemo(
    () => trucks.filter((truck) => truck.status === 'active').length,
    [trucks],
  )

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Trucks</p>
          <h1 className="page-title">Fleet management</h1>
          <p className="section-subtitle">
            Track truck identity, compliance dates, capacity, and service status.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setSelected(null)
            setOpen(true)
          }}
        >
          <Plus size={16} />
          Add truck
        </button>
      </section>

      <section className="analytics-grid-3">
        <div className="card metric-card">
          <p className="metric-label">Total trucks</p>
          <p className="metric-value tabular">{totalTrucks}</p>
        </div>

        <div className="card metric-card">
          <p className="metric-label">Active</p>
          <p className="metric-value tabular">{activeTrucks}</p>
        </div>
      </section>

      <section className="table-card">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Truck no.</th>
                <th>Model</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Service due</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {trucks.map((truck) => (
                <tr key={truck.id}>
                  <td className="table-cell-strong">{truck.truck_number ?? '-'}</td>
                  <td>{truck.model ?? '-'}</td>
                  <td>{truck.capacity_tons ?? 0} tons</td>
                  <td>{truck.status ?? '-'}</td>
                  <td>{truck.service_due_date ?? '-'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => {
                        setSelected(truck)
                        setOpen(true)
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {trucks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[var(--color-text-muted)]">
                    No trucks found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <TruckModal
        open={open}
        onClose={() => setOpen(false)}
        initialData={selected}
      />
    </div>
  )
}