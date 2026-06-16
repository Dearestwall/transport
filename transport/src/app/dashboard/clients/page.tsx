'use client'

import { useMemo, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import ClientModal from '@/components/modals/ClientModal'

type ClientRow = {
  id: string
  company_name: string | null
  contact_person: string | null
  phone: string | null
  email: string | null
  gst_number: string | null
  city: string | null
  state: string | null
  created_at: string
}

const initialClients: ClientRow[] = []

export default function ClientsPage() {
  const [clients] = useState<ClientRow[]>(initialClients ?? [])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<ClientRow | null>(null)

  const totalClients = useMemo(() => clients.length, [clients])

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="eyebrow">Clients</p>
          <h1 className="page-title">Client management</h1>
          <p className="section-subtitle">
            Manage companies, contacts, GST details, and billing-ready profiles.
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
          Add client
        </button>
      </section>

      <section className="analytics-grid-3">
        <div className="card metric-card">
          <p className="metric-label">Total clients</p>
          <p className="metric-value tabular">{totalClients}</p>
        </div>
      </section>

      <section className="table-card">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="table-cell-strong">{client.company_name ?? '-'}</td>
                  <td>{client.contact_person ?? '-'}</td>
                  <td>{client.phone ?? '-'}</td>
                  <td>{client.email ?? '-'}</td>
                  <td>{client.city ?? '-'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => {
                        setSelected(client)
                        setOpen(true)
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[var(--color-text-muted)]">
                    No clients found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <ClientModal
        open={open}
        onClose={() => setOpen(false)}
        initialData={selected}
      />
    </div>
  )
}