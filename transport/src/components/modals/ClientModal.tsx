'use client'

import { useEffect, useState, useTransition } from 'react'
import { X, Trash2 } from 'lucide-react'
import { saveClientAction, softDeleteClientAction } from '@/actions/clients'

type ClientRow = {
  id?: string
  company_name?: string | null
  contact_person?: string | null
  phone?: string | null
  email?: string | null
  gst_number?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  notes?: string | null
  status?: 'draft' | 'active' | 'archived'
}

interface ClientModalProps {
  open: boolean
  onClose: () => void
  initialData?: ClientRow | null
  canDelete?: boolean
}

export default function ClientModal({
  open,
  onClose,
  initialData,
  canDelete = false,
}: ClientModalProps) {
  const [isPending, startTransition] = useTransition()
const [confirmDelete, setConfirmDelete] = useState(false)
  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-black/50 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-start justify-center py-4 sm:items-center sm:py-8">
        <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <h2 className="text-base font-semibold sm:text-lg">
                {initialData?.id ? 'Edit client' : 'Add client'}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Save client profile, GST, address, and contact details.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 hover:bg-[var(--color-surface-offset)]"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <form
            id="client-form"
            action={async (formData) => {
              await saveClientAction(formData)
              onClose()
            }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <input type="hidden" name="id" defaultValue={initialData?.id ?? ''} />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Company name</label>
                  <input
                    name="company_name"
                    defaultValue={initialData?.company_name ?? ''}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Contact person</label>
                  <input
                    name="contact_person"
                    defaultValue={initialData?.contact_person ?? ''}
                    className="input"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Phone</label>
                  <input
                    name="phone"
                    defaultValue={initialData?.phone ?? ''}
                    className="input"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={initialData?.email ?? ''}
                    className="input"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">GST number</label>
                  <input
                    name="gst_number"
                    defaultValue={initialData?.gst_number ?? ''}
                    className="input"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Status</label>
                  <select
                    name="status"
                    defaultValue={initialData?.status ?? 'draft'}
                    className="input"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">City</label>
                  <input
                    name="city"
                    defaultValue={initialData?.city ?? ''}
                    className="input"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">State</label>
                  <input
                    name="state"
                    defaultValue={initialData?.state ?? ''}
                    className="input"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Address</label>
                  <textarea
                    name="address"
                    defaultValue={initialData?.address ?? ''}
                    className="textarea"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={initialData?.notes ?? ''}
                    className="textarea"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-col gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
             <div>
  {initialData?.id && canDelete ? (
    !confirmDelete ? (
      <button
        type="button"
        className="btn btn-secondary text-[var(--color-error)]"
        onClick={() => setConfirmDelete(true)}
        disabled={isPending}
      >
        <Trash2 size={15} />
        Delete client
      </button>
    ) : (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span className="text-xs text-[var(--color-error)]">
          Are you sure? This will archive the client and create logs.
        </span>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setConfirmDelete(false)}
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary bg-[var(--color-error)] hover:bg-[var(--color-error)]"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const formData = new FormData()
              formData.set('id', initialData.id!)
              formData.set('delete_reason', 'Deleted by superadmin from client modal')
              await softDeleteClientAction(formData)
              onClose()
            })
          }}
        >
          Confirm delete
        </button>
      </div>
    )
  ) : (
    <span className="text-xs text-[var(--color-text-muted)]">
      Client records are tracked with audit logs.
    </span>
  )}
</div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isPending}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {initialData?.id ? 'Update client' : 'Create client'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}