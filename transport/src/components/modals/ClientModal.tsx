'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSupabaseClient } from '@/lib/supabase/client'
import { ClientSchema } from '@/lib/validations'
import type { ClientFormData } from '@/lib/validations'
import toast from 'react-hot-toast'
import { X, Loader2 } from 'lucide-react'
import type { Client } from '@/types'

interface Props {
  client?:  Client | null
  onClose:  () => void
  onSaved:  () => void
  canEdit?: boolean
}

const EMPTY: ClientFormData = {
  company_name: '', phone: '', credit_limit: 0, credit_days: 30,
}

const FIELDS: { name: keyof ClientFormData; label: string; type?: string; full?: boolean }[] = [
  { name: 'company_name',   label: 'Company Name *', full: true },
  { name: 'contact_person', label: 'Contact Person' },
  { name: 'phone',          label: 'Phone *' },
  { name: 'email',          label: 'Email',          type: 'email' },
  { name: 'gst_number',     label: 'GST Number' },
  { name: 'credit_limit',   label: 'Credit Limit',   type: 'number' },
  { name: 'credit_days',    label: 'Credit Days',    type: 'number' },
  { name: 'address',        label: 'Address',        full: true },
  { name: 'city',           label: 'City' },
  { name: 'state',          label: 'State' },
]

export default function ClientModal({ client, onClose, onSaved, canEdit = true }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver:      zodResolver(ClientSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    reset(client
      ? { ...EMPTY, ...client, credit_limit: client.credit_limit ?? 0, credit_days: client.credit_days ?? 30 }
      : EMPTY
    )
  }, [client, reset])

  async function onSubmit(data: ClientFormData) {
    if (!canEdit) return
    const sb = getSupabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { toast.error('Not authenticated'); return }
    if (client?.id) {
      const { error } = await sb.from('clients')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', client.id)
      if (error) { toast.error(error.message); return }
      toast.success('Client updated!')
    } else {
      const { error } = await sb.from('clients')
        .insert({ ...data, created_by: user.id, is_deleted: false, locked: false })
      if (error) { toast.error(error.message); return }
      toast.success('Client added!')
    }
    onSaved(); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-sm font-semibold">{client ? 'Edit Client' : 'Add Client'}</h2>
          <button onClick={onClose} aria-label="Close" className="btn-ghost p-1.5 rounded-lg">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map((f) => (
              <div key={f.name} className={f.full ? 'col-span-2' : ''}>
                <label className="label" htmlFor={`cl-${f.name}`}>{f.label}</label>
                <input
                  id={`cl-${f.name}`}
                  type={f.type ?? 'text'}
                  {...register(f.name)}
                  disabled={!canEdit || isSubmitting}
                  className="input"
                />
                {errors[f.name] && (
                  <p className="text-xs text-red-500 mt-1">{String(errors[f.name]?.message ?? '')}</p>
                )}
              </div>
            ))}
          </div>

          {canEdit && (
            <div className="flex gap-2 pt-3 mt-3 border-t border-[var(--color-border)]">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                {isSubmitting ? 'Saving…' : client ? 'Save Changes' : 'Add Client'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}