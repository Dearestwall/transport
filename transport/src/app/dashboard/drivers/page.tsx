'use client'

import { useMemo, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import DriverModal from '@/components/modals/DriverModal'

type DriverRow = {
  id: string
  full_name: string | null
  phone: string | null
  license_number: string | null
  salary_base: number | null
  status: 'available' | 'on_trip' | 'on_leave' | 'inactive' | null
  created_at: string
}

const initialDrivers: DriverRow[] = []

export default function DriversPage() {
  const [drivers] = useState<DriverRow[]>(initialDrivers ?? [])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<DriverRow | null>(null)

  const totalDrivers = useMemo(() => drivers.length, [drivers])
  const activeDrivers = useMemo(
    () => drivers.filter((driver) => driver.status === 'available').length,
    [drivers],
  )

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Drivers</p>
          <h1 className="page-title">Driver operations</h1>
          <p className="section-subtitle">
            Manage salary, licenses, and active assignment readiness.
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
          Add driver
        </button>
      </section>

      <section className="analytics-grid-3">
        <div className="card metric-card">
          <p className="metric-label">Total drivers</p>
          <p className="metric-value tabular">{totalDrivers}</p>
        </div>

        <div className="card metric-card">
          <p className="metric-label">Available</p>
          <p className="metric-value tabular">{activeDrivers}</p>
        </div>
      </section>

      <section className="table-card">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>License</th>
                <th>Status</th>
                <th>Salary</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td className="table-cell-strong">{driver.full_name ?? '-'}</td>
                  <td>{driver.phone ?? '-'}</td>
                  <td>{driver.license_number ?? '-'}</td>
                  <td>{driver.status ?? '-'}</td>
                  <td>₹{Number(driver.salary_base ?? 0).toLocaleString('en-IN')}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => {
                        setSelected(driver)
                        setOpen(true)
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[var(--color-text-muted)]">
                    No drivers found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <DriverModal
        open={open}
        onClose={() => setOpen(false)}
        initialData={selected}
      />
    </div>
  )
}