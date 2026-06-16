/* eslint-disable react-hooks/incompatible-library */
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getSupabaseClient } from '@/lib/supabase/client'
import { InvoiceSchema } from '@/lib/validations'
import type { InvoiceFormData } from '@/lib/validations'
import toast from 'react-hot-toast'
import { X, Loader2 } from 'lucide-react'
import type { Invoice, Client, Trip } from '@/types'

interface Props { invoice?: Invoice | null; onClose: () => void; onSaved: () => void }

const EMPTY: InvoiceFormData = {
  client_id: '', invoice_date: '', due_date: '',
  subtotal: 0, tax_rate: 18, advance_adjusted: 0,
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

export default function InvoiceModal({ invoice, onClose, onSaved }: Props) {
  const [clients, setClients] = useState<Pick<Client, 'id' | 'company_name'>[]>([])
  const [trips,   setTrips]   = useState<Pick<Trip, 'id' | 'trip_number'>[]>([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver:      zodResolver(InvoiceSchema),
    defaultValues: EMPTY,
  })

  useEffect(() => {
    reset(invoice
      ? { ...EMPTY, ...invoice, tax_rate: invoice.tax_rate ?? 18, advance_adjusted: invoice.advance_adjusted ?? 0 }
      : EMPTY
    )
  }, [invoice, reset])

  const loadDropdowns = useCallback(async () => {
    const sb = getSupabaseClient()
    const [c, t] = await Promise.all([
      sb.from('clients').select('id,company_name').eq('is_deleted', false).order('company_name'),
      sb.from('trips').select('id,trip_number').eq('is_deleted', false).order('trip_number', { ascending: false }).limit(200),
    ])
    setClients((c.data ?? []) as Pick<Client, 'id' | 'company_name'>[])
    setTrips(  (t.data ?? []) as Pick<Trip, 'id' | 'trip_number'>[])
  }, [])

  useEffect(() => { loadDropdowns() }, [loadDropdowns])

  const vals    = watch()
  const sub     = Number(vals.subtotal         ?? 0)
  const taxRate = Number(vals.tax_rate         ?? 18)
  const adv     = Number(vals.advance_adjusted ?? 0)
  const taxAmt  = (sub * taxRate) / 100
  const total   = sub + taxAmt
  const balance = total - adv

  async function onSubmit(data: InvoiceFormData) {
    const sb = getSupabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { toast.error('Not authenticated'); return }
    const tax_amount     = (data.subtotal * data.tax_rate) / 100
    const total_amount   = data.subtotal + tax_amount
    const balance_amount = total_amount - (data.advance_adjusted ?? 0)
    const payload = {
      ...data,
      tax_amount, total_amount, balance_amount,
      trip_id: data.trip_id || null,
      status: 'draft' as const,
    }
    if (invoice?.id) {
      const { error } = await sb.from('invoices')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', invoice.id)
      if (error) { toast.error(error.message); return }
      toast.success('Invoice updated!')
    } else {
      const { error } = await sb.from('invoices')
        .insert({ ...payload, invoice_number: `INV-${Date.now()}`, created_by: user.id, is_deleted: false })
      if (error) { toast.error(error.message); return }
      toast.success('Invoice added!')
    }
    onSaved(); onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-sm font-semibold">{invoice ? 'Edit Invoice' : 'Add Invoice'}</h2>
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

            <div className="col-span-2">
              <label className="label">Linked Trip (optional)</label>
              <select {...register('trip_id')} disabled={isSubmitting} className="input">
                <option value="">None</option>
                {trips.map((t) => <option key={t.id} value={t.id}>{t.trip_number}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Invoice Date *</label>
              <input type="date" {...register('invoice_date')} disabled={isSubmitting} className="input" />
              {errors.invoice_date && <p className="text-xs text-red-500 mt-1">{errors.invoice_date.message}</p>}
            </div>

            <div>
              <label className="label">Due Date *</label>
              <input type="date" {...register('due_date')} disabled={isSubmitting} className="input" />
              {errors.due_date && <p className="text-xs text-red-500 mt-1">{errors.due_date.message}</p>}
            </div>

            <div>
              <label className="label">Subtotal *</label>
              <input type="number" min="0" step="0.01" {...register('subtotal')} disabled={isSubmitting} className="input" />
              {errors.subtotal && <p className="text-xs text-red-500 mt-1">{errors.subtotal.message}</p>}
            </div>

            <div>
              <label className="label">Tax Rate %</label>
              <input type="number" min="0" max="100" step="0.01" {...register('tax_rate')} disabled={isSubmitting} className="input" />
            </div>

            <div>
              <label className="label">Advance Adjusted</label>
              <input type="number" min="0" step="0.01" {...register('advance_adjusted')} disabled={isSubmitting} className="input" />
            </div>

            <div className="flex items-end">
              <div className="w-full bg-[var(--color-surface-offset)] rounded-xl p-3 text-right">
                <p className="text-[10px] text-[var(--color-text-muted)]">Balance Due</p>
                <p className="text-lg font-bold text-[var(--color-primary)]">{fmt(balance)}</p>
              </div>
            </div>

            <div className="col-span-2 grid grid-cols-3 gap-2 text-center">
              <div className="bg-[var(--color-surface-offset)] rounded-lg p-2">
                <p className="text-[10px] text-[var(--color-text-muted)]">Tax</p>
                <p className="text-xs font-semibold">{fmt(taxAmt)}</p>
              </div>
              <div className="bg-[var(--color-surface-offset)] rounded-lg p-2">
                <p className="text-[10px] text-[var(--color-text-muted)]">Total</p>
                <p className="text-xs font-semibold">{fmt(total)}</p>
              </div>
              <div className="bg-[var(--color-surface-offset)] rounded-lg p-2">
                <p className="text-[10px] text-[var(--color-text-muted)]">Balance</p>
                <p className="text-xs font-semibold">{fmt(balance)}</p>
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
              {invoice ? 'Save Changes' : 'Add Invoice'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}