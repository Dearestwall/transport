'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const driverSchema = z.object({
  full_name: z.string().min(2, 'Driver name is required'),
  phone: z.string().min(6, 'Phone is required'),
  license_number: z.string().min(4, 'License number is required'),
  license_expiry: z.string().optional().nullable(),
  salary_base: z.coerce.number().min(0).default(0),
  address: z.string().optional().nullable(),
  emergency_contact: z.string().optional().nullable(),
  status: z.enum(['available', 'on_trip', 'on_leave', 'inactive']).default('available'),
  notes: z.string().optional().nullable(),
})

const updateDriverSchema = driverSchema.extend({
  id: z.string().uuid(),
})

export async function createDriverAction(formData: FormData): Promise<void> {
  const parsed = driverSchema.safeParse({
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    license_number: formData.get('license_number'),
    license_expiry: formData.get('license_expiry') || null,
    salary_base: formData.get('salary_base') || 0,
    address: formData.get('address') || null,
    emergency_contact: formData.get('emergency_contact') || null,
    status: formData.get('status') || 'available',
    notes: formData.get('notes') || null,
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid driver data')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payload = {
    ...parsed.data,
    created_by: user?.id ?? null,
  }

  const { error } = await supabase.from('drivers').insert(payload)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/drivers')
}

export async function updateDriverAction(formData: FormData): Promise<void> {
  const parsed = updateDriverSchema.safeParse({
    id: formData.get('id'),
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    license_number: formData.get('license_number'),
    license_expiry: formData.get('license_expiry') || null,
    salary_base: formData.get('salary_base') || 0,
    address: formData.get('address') || null,
    emergency_contact: formData.get('emergency_contact') || null,
    status: formData.get('status') || 'available',
    notes: formData.get('notes') || null,
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid driver update data')
  }

  const supabase = await createClient()
  const { id, ...rest } = parsed.data

  const { error } = await supabase
    .from('drivers')
    .update({
      ...rest,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('is_deleted', false)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/drivers')
  revalidatePath(`/dashboard/drivers/${id}`)
}

export async function saveDriverAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') || '').trim()

  if (id) {
    await updateDriverAction(formData)
    return
  }

  await createDriverAction(formData)
}

export async function softDeleteDriverAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') || '')
  const delete_reason = String(formData.get('delete_reason') || '')

  if (!id) {
    throw new Error('Driver id is required')
  }

  if (!delete_reason.trim()) {
    throw new Error('Delete reason is required')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('drivers')
    .update({
      is_deleted: true,
      deleted_by: user?.id ?? null,
      delete_reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('is_deleted', false)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/drivers')
}

export async function updateDriverStatusAction(
  driverId: string,
  status: 'available' | 'on_trip' | 'on_leave' | 'inactive',
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('drivers')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', driverId)
    .eq('is_deleted', false)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/drivers')
}