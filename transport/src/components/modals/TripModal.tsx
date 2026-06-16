/* eslint-disable react-hooks/incompatible-library */
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSupabaseClient } from '@/lib/supabase/client'
import { TripSchema } from '@/lib/validations'
import type { TripFormData } from '@/lib/validations'
import toast from 'react-hot-toast'
import { X, Loader2 } from 'lucide-react'
import type { Trip, Client, Truck, Driver } from '@/types'

interface Props { trip?: Trip | null; onClose: () => void; onSaved: () => void }

const EMPTY: TripFormData = {
  client_id: '', truck_id: '', driver_id: '',
  origin: '', destination: '',
  departure_date: '',
  freight_amount: 0, advance_paid: 0,
  status: 'planned',
}

export default function TripModal({ trip, onClose, onSaved }: Props) {
  const [clients, setClients] = useState<Pick<Client, 'id' | 'company_name'>[]>([])
  const [trucks,  setTrucks]  = useState<Pick<Truck,  'id' | 'truck_number'>[]>([])
  const [drivers, setDrivers] = useState<Pick<Driver, 'id' | 'full_name'>[]>([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver:      zodResolver(TripSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    reset(trip ? { ...EMPTY, ...trip, advance_paid: trip.advance_paid ?? 0 } : EMPTY)
  }, [trip, reset])

  const loadDropdowns = useCallback(async () => {
    const sb = getSupabaseClient()
    const [c, t, d] = await Promise.all([
      sb.from('clients').select('id,company_name').eq('is_deleted', false).order('company_name'),
      sb.from('trucks').select('id,truck_number').eq('is_deleted', false).in('status', ['active', 'idle']).order('truck_number'),
      sb.from('drivers').select('id,full_name').eq('is_deleted', false).order('full_name'),
    ])
    setClients((c.data ?? []) as Pick<Client, 'id' | 'company_name'>[])
    setTrucks( (t.data ?? []) as Pick<Truck,  'id' | 'truck_number'>[])
    setDrivers((d.data ?? []) as Pick<Driver, 'id' | 'full_name'>[])
  }, [])

  useEffect(() => { loadDropdowns() }, [loadDropdowns])

  const vals    = watch()
  const freight = Number(vals.freight_amount ?? 0)
  const advance = Number(vals.advance_paid   ?? 0)

  async function onSubmit(data: TripFormData) {
    const sb = getSupabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { toast.error('Not authenticated'); return }
    const payload = { ...data, balance_due: data.freight_amount - (data.advance_paid ?? 0) }
    if (trip?.id) {
      const { error } = await sb.from('trips')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', trip.id)
      if (error) { toast.error(error.message); return }
      toast.success('Trip updated!')
    } else {
      const { error } = await sb.from('trips')
        .insert({ ...payload, created_by: user.id, is_deleted: false, locked: false })
      if (error) { toast.error(error.message); return }
      toast.success('Trip added!')
    }
    onSaved(); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-sm font-semibold">{trip ? 'Edit Trip' : 'Add Trip'}</h2>
          <button onClick={onClose} aria-label="Close" className="btn-ghost p-1.5 rounded-lg">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-4" noValidate>
          <div className="grid grid-cols-2 gap-3">

            <div className="col-span-2">
              <label className="label">Client *</label>
              <select {...register('client_id')} disabled={isSubmitting} className="input">
                <option value="">Select client…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
              {errors.client_id && <p className="text-xs text-red-500 mt-1">{errors.client_id.message}</p>}
            </div>

            <div>
              <label className="label">Truck *</label>
              <select {...register('truck_id')} disabled={isSubmitting} className="input">
                <option value="">Select truck…</option>
                {trucks.map((t) => <option key={t.id} value={t.id}>{t.truck_number}</option>)}
              </select>
              {errors.truck_id && <p className="text-xs text-red-500 mt-1">{errors.truck_id.message}</p>}
            </div>

            <div>
              <label className="label">Driver *</label>
              <select {...register('driver_id')} disabled={isSubmitting} className="input">
                <option value="">Select driver…</option>
                {drivers.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
              </select>
              {errors.driver_id && <p className="text-xs text-red-500 mt-1">{errors.driver_id.message}</p>}
            </div>

            <div>
              <label className="label">Origin *</label>
              <input {...register('origin')} disabled={isSubmitting} className="input" />
              {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin.message}</p>}
            </div>

            <div>
              <label className="label">Destination *</label>
              <input {...register('destination')} disabled={isSubmitting} className="input" />
              {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination.message}</p>}
            </div>

            <div>
              <label className="label">Departure Date *</label>
              <input type="date" {...register('departure_date')} disabled={isSubmitting} className="input" />
              {errors.departure_date && <p className="text-xs text-red-500 mt-1">{errors.departure_date.message}</p>}
            </div>

            <div>
              <label className="label">Arrival Date</label>
              <input type="date" {...register('arrival_date')} disabled={isSubmitting} className="input" />
            </div>

            <div>
              <label className="label">Status</label>
              <select {...register('status')} disabled={isSubmitting} className="input">
                {(['planned', 'in_transit', 'delivered', 'cancelled', 'on_hold'] as const).map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Freight Amount *</label>
              <input type="number" min="0" step="0.01" {...register('freight_amount')} disabled={isSubmitting} className="input" />
              {errors.freight_amount && <p className="text-xs text-red-500 mt-1">{errors.freight_amount.message}</p>}
            </div>

            <div>
              <label className="label">Advance Paid</label>
              <input type="number" min="0" step="0.01" {...register('advance_paid')} disabled={isSubmitting} className="input" />
            </div>

            <div className="flex items-end">
              <div className="w-full bg-[var(--color-surface-offset)] rounded-xl p-3 text-right">
                <p className="text-[10px] text-[var(--color-text-muted)]">Balance Due</p>
                <p className="text-lg font-bold text-[var(--color-primary)]">
                  ₹{(freight - advance).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea rows={2} {...register('notes')} disabled={isSubmitting} className="input resize-none" />
            </div>

          </div>

          <div className="flex gap-2 pt-3 mt-3 border-t border-[var(--color-border)]">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting && <Loader2 size={13} className="animate-spin" />}
              {trip ? 'Save Changes' : 'Add Trip'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}