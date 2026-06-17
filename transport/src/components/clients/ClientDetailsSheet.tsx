'use client'

import { useEffect } from 'react'
import { X, Building2, FileText, Mail, MapPin, Phone } from 'lucide-react'

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

export default function ClientDetailsSheet({
  open,
  onClose,
  client,
  documents,
  canUploadDocs,
}: {
  open: boolean
  onClose: () => void
  client: ClientRow | null
  documents: ClientDocumentRow[]
  canUploadDocs: boolean
  canRestore?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !client) return null

  return (
    <div className="fixed inset-0 z-[85] bg-black/50">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close details" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
          <div>
            <p className="eyebrow">Client details</p>
            <h2 className="text-lg font-semibold">{client.company_name ?? 'Unnamed client'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-[var(--color-surface-offset)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-faint)]">Status</p>
              <p className="mt-2"><span className="badge badge-info">{client.status ?? 'draft'}</span></p>
            </div>
            <div className="card p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--color-text-faint)]">GST</p>
              <p className="mt-2 text-sm font-medium">{client.gst_number ?? '-'}</p>
            </div>
          </div>

          <div className="card p-4 space-y-4">
            <h3 className="text-sm font-semibold">Profile</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Building2 size={16} className="mt-1 text-[var(--color-text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Contact person</p>
                  <p className="text-sm font-medium">{client.contact_person ?? '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-1 text-[var(--color-text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Phone</p>
                  <p className="text-sm font-medium">{client.phone ?? '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-1 text-[var(--color-text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Email</p>
                  <p className="text-sm font-medium break-all">{client.email ?? '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 text-[var(--color-text-muted)]" />
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">Location</p>
                  <p className="text-sm font-medium">
                    {[client.city, client.state].filter(Boolean).join(', ') || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Address</p>
              <p className="mt-1 text-sm">{client.address ?? '-'}</p>
            </div>

            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Notes</p>
              <p className="mt-1 text-sm">{client.notes ?? '-'}</p>
            </div>
          </div>

          <div className="card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Documents</h3>
              {canUploadDocs ? <button type="button" className="btn btn-secondary">Upload document</button> : null}
            </div>

            {documents.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">No documents uploaded.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{doc.file_name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{doc.document_kind}</p>
                    </div>
                    <FileText size={16} className="text-[var(--color-text-muted)]" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}