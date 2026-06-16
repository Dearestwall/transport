'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSupabaseClient } from '@/lib/supabase/client'
import { TruckSchema } from '@/lib/validations'
import type { TruckFormData } from '@/lib/validations'
import toast from 'react-hot-toast'
import { X, Loader2 } from 'lucide-react'
import type { Truck } from '@/types'

interface Props {
  truck?:   Truck | null
  onClose:  () => void
  onSaved:  () => void
  canEdit?: boolean
}

const EMPTY: TruckFormData = {
  truck_number: '', owner_type: 'company', fuel_type: 'diesel', status: 'idle',
}

export default function TruckModal({ truck, onClose, onSaved, canEdit = true }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver:      zodResolver(TruckSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    reset(truck ? { ...EMPTY, ...truck } : EMPTY)
  }, [truck, reset])

  async function onSubmit(data: TruckFormData) {
    if (!canEdit) return
    const sb = getSupabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { toast.error('Not authenticated'); return }
    if (truck?.id) {
      const { error } = await sb.from('trucks')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', truck.id)
      if (error) { toast.error(error.message); return }
      toast.success('Truck updated!')
    } else {
      const { error } = await sb.from('trucks')
        .insert({ ...data, created_by: user.id, is_deleted: false, locked: false })
      if (error) { toast.error(error.message); return }
      toast.success('Truck added!')
    }
    onSaved(); onClose()
  }

  const textFields: { name: keyof TruckFormData; label: string; type?: string; span2?: boolean }[] = [
    { name: 'truck_number',     label: 'Truck Number *',   span2: true },
    { name: 'make',             label: 'Make' },
    { name: 'model',            label: 'Model' },
    { name: 'year',             label: 'Year',             type: 'number' },
    { name: 'capacity_tons',    label: 'Capacity (tons)',  type: 'number' },
    { name: 'owner_name',       label: 'Owner Name' },
    { name: 'owner_phone',      label: 'Owner Phone' },
    { name: 'truck_type',       label: 'Truck Type' },
    { name: 'engine_number',    label: 'Engine No.' },
    { name: 'chassis_number',   label: 'Chassis No.' },
    { name: 'insurance_expiry', label: 'Insurance Expiry', type: 'date' },
    { name: 'fitness_expiry',   label: 'Fitness Expiry',   type: 'date' },
    { name: 'permit_expiry',    label: 'Permit Expiry',    type: 'date' },
    { name: 'pollution_expiry', label: 'Pollution Expiry', type: 'date' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-sm font-semibold">{truck ? 'Edit Truck' : 'Add Truck'}</h2>
          <button onClick={onClose} aria-label="Close" className="btn-ghost p-1.5 rounded-lg">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            {textFields.map((f) => (
              <div key={f.name} className={f.span2 ? 'col-span-2' : ''}>
                <label className="label" htmlFor={`tr-${f.name}`}>{f.label}</label>
                <input
                  id={`tr-${f.name}`}
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

            <div>
              <label className="label" htmlFor="tr-owner-type">Owner Type</label>
              <select id="tr-owner-type" {...register('owner_type')} disabled={!canEdit || isSubmitting} className="input">
                <option value="company">Company Owned</option>
                <option value="attached">Attached</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="tr-status">Status</label>
              <select id="tr-status" {...register('status')} disabled={!canEdit || isSubmitting} className="input">
                {(['active', 'idle', 'maintenance', 'retired'] as const).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="tr-fuel">Fuel Type</label>
              <select id="tr-fuel" {...register('fuel_type')} disabled={!canEdit || isSubmitting} className="input">
                {(['diesel', 'petrol', 'cng', 'electric'] as const).map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="label" htmlFor="tr-notes">Notes</label>
              <textarea id="tr-notes" rows={2} {...register('notes')} disabled={!canEdit || isSubmitting} className="input resize-none" />
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2 pt-3 mt-3 border-t border-[var(--color-border)]">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                {isSubmitting ? 'Saving…' : truck ? 'Save Changes' : 'Add Truck'}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}