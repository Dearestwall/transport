'use client'

import { useMemo, useState } from 'react'
import { Download, FileSpreadsheet, Pencil, Plus, Upload, Copy, Eye } from 'lucide-react'
import Papa from 'papaparse'
import ClientModal from '@/components/modals/ClientModal'
import ClientBulkImportModal from '@/components/clients/ClientBulkImportModal'
import { cn } from '@/lib/utils'
import type { Profile, UserRole } from '@/types'
import ClientDetailsSheet from './ClientDetailsSheet'

type ClientRow = {
  id: string
  company_name: string | null
  contact_person: string | null
  phone: string | null
  email: string | null
  gst_number: string | null
  address?: string | null
  city: string | null
  state: string | null
  status?: 'draft' | 'active' | 'archived'
  notes?: string | null
  created_at: string
}

type ClientDocumentRow = {
  id: string
  client_id: string
  file_name: string
  document_kind: string
  created_at: string
  is_deleted: boolean
}

const ROLE_WEIGHT: Record<UserRole, number> = {
  superadmin: 100,
  admin: 80,
  operations_manager: 60,
  accountant: 50,
  dispatcher: 40,
  data_entry: 20,
  viewer: 10,
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ClientsTablePage({
  profile,
  initialClients,
  initialDocuments,
}: {
  profile: Profile
  initialClients: ClientRow[]
  initialDocuments: ClientDocumentRow[]
}) {
  const [clients] = useState<ClientRow[]>(initialClients)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'draft' | 'active' | 'archived'>('all')
  const [open, setOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [selected, setSelected] = useState<ClientRow | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsClient, setDetailsClient] = useState<ClientRow | null>(null)

  const canCreate = ROLE_WEIGHT[profile.role as UserRole] >= ROLE_WEIGHT.data_entry
  const canImport = ROLE_WEIGHT[profile.role as UserRole] >= ROLE_WEIGHT.data_entry
  const canEdit = ROLE_WEIGHT[profile.role as UserRole] >= ROLE_WEIGHT.admin
  const canExport = ROLE_WEIGHT[profile.role as UserRole] >= ROLE_WEIGHT.data_entry
  const canDelete = ROLE_WEIGHT[profile.role as UserRole] >= ROLE_WEIGHT.superadmin
  const canRestore = ROLE_WEIGHT[profile.role as UserRole] >= ROLE_WEIGHT.superadmin
  const canUploadDocs = ROLE_WEIGHT[profile.role as UserRole] >= ROLE_WEIGHT.data_entry

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      const matchesStatus = status === 'all' ? true : (client.status ?? 'draft') === status
      const haystack = [
        client.company_name,
        client.contact_person,
        client.phone,
        client.email,
        client.gst_number,
        client.city,
        client.state,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesStatus && haystack.includes(query.toLowerCase())
    })
  }, [clients, query, status])

  const totalClients = clients.length
  const activeClients = clients.filter((c) => (c.status ?? 'draft') === 'active').length
  const draftClients = clients.filter((c) => (c.status ?? 'draft') === 'draft').length

  const exportRows = filtered.map((client) => ({
    company_name: client.company_name ?? '',
    contact_person: client.contact_person ?? '',
    phone: client.phone ?? '',
    email: client.email ?? '',
    gst_number: client.gst_number ?? '',
    city: client.city ?? '',
    state: client.state ?? '',
    status: client.status ?? 'draft',
  }))

  const copyRows = async () => {
    const csv = Papa.unparse(exportRows)
    await navigator.clipboard.writeText(csv)
  }

  const downloadTemplate = () => {
    const template = Papa.unparse([
      {
        company_name: 'Acme Logistics Pvt Ltd',
        contact_person: 'Raj Sharma',
        phone: '9876543210',
        email: 'accounts@acme.com',
        gst_number: '03ABCDE1234F1Z5',
        address: 'Industrial Area, Ludhiana',
        city: 'Ludhiana',
        state: 'Punjab',
        status: 'draft',
        notes: 'Preferred client',
      },
    ])
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clients-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="eyebrow">Clients</p>
          <h1 className="page-title">Client management</h1>
          <p className="section-subtitle">
            Manage companies, contacts, GST details, documents, imports, and billing-ready profiles.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canExport && (
            <>
              <button type="button" className="btn btn-secondary" onClick={downloadTemplate}>
                <FileSpreadsheet size={16} />
                Template
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => downloadCsv('clients-export.csv', exportRows)}
              >
                <Download size={16} />
                Export
              </button>
              <button type="button" className="btn btn-secondary" onClick={copyRows}>
                <Copy size={16} />
                Copy CSV
              </button>
            </>
          )}

          {canImport && (
            <button type="button" className="btn btn-secondary" onClick={() => setImportOpen(true)}>
              <Upload size={16} />
              Import
            </button>
          )}

          {canCreate && (
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
          )}
        </div>
      </section>

      <section className="analytics-grid-3">
        <div className="card metric-card">
          <p className="metric-label">Total clients</p>
          <p className="metric-value tabular">{totalClients}</p>
        </div>
        <div className="card metric-card">
          <p className="metric-label">Active</p>
          <p className="metric-value tabular">{activeClients}</p>
        </div>
        <div className="card metric-card">
          <p className="metric-label">Draft</p>
          <p className="metric-value tabular">{draftClients}</p>
        </div>
      </section>

      <section className="table-card space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company, GST, phone, city..."
            className="input w-full lg:max-w-sm"
          />

          <div className="flex flex-wrap gap-2">
            {(['all', 'draft', 'active', 'archived'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={cn(
                  'btn btn-secondary',
                  status === value && 'border-[var(--color-primary)] text-[var(--color-primary)]'
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Status</th>
                <th>Docs</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((client) => {
                const docCount = initialDocuments.filter((d) => d.client_id === client.id).length

                return (
                  <tr key={client.id}>
                    <td className="table-cell-strong">{client.company_name ?? '-'}</td>
                    <td>{client.contact_person ?? '-'}</td>
                    <td>{client.phone ?? '-'}</td>
                    <td>{client.email ?? '-'}</td>
                    <td>{client.city ?? '-'}</td>
                    <td>
                      <span className="badge badge-info">{client.status ?? 'draft'}</span>
                    </td>
                    <td>{docCount}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          title="View details"
                          onClick={() => {
                            setDetailsClient(client)
                            setDetailsOpen(true)
                          }}
                        >
                          <Eye size={15} />
                        </button>

                        {canEdit ? (
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
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-[var(--color-text-muted)]">
                    No clients found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <ClientModal
        key={selected?.id ?? 'new-client'}
        open={open}
        onClose={() => setOpen(false)}
        initialData={selected}
        canDelete={canDelete}
      />

      <ClientBulkImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />

      <ClientDetailsSheet
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        client={detailsClient}
        documents={detailsClient ? initialDocuments.filter((d) => d.client_id === detailsClient.id) : []}
        canUploadDocs={canUploadDocs}
        canRestore={canRestore}
      />
    </div>
  )
}