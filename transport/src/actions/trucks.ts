'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const truckSchema = z.object({
  truck_number: z.string().min(3, 'Truck number is required'),
  model: z.string().optional().nullable(),
  capacity_tons: z.coerce.number().min(0).default(0),
  insurance_expiry: z.string().optional().nullable(),
  permit_expiry: z.string().optional().nullable(),
  fitness_expiry: z.string().optional().nullable(),
  service_due_date: z.string().optional().nullable(),
  status: z.enum(['active', 'maintenance', 'inactive']).default('active'),
  notes: z.string().optional().nullable(),
})

const updateTruckSchema = truckSchema.extend({
  id: z.string().uuid(),
})

export async function createTruckAction(formData: FormData): Promise<void> {
  const parsed = truckSchema.safeParse({
    truck_number: formData.get('truck_number'),
    model: formData.get('model') || null,
    capacity_tons: formData.get('capacity_tons') || 0,
    insurance_expiry: formData.get('insurance_expiry') || null,
    permit_expiry: formData.get('permit_expiry') || null,
    fitness_expiry: formData.get('fitness_expiry') || null,
    service_due_date: formData.get('service_due_date') || null,
    status: formData.get('status') || 'active',
    notes: formData.get('notes') || null,
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid truck data')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const payload = {
    ...parsed.data,
    created_by: user?.id ?? null,
  }

  const { error } = await supabase.from('trucks').insert(payload)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/trucks')
}

export async function updateTruckAction(formData: FormData): Promise<void> {
  const parsed = updateTruckSchema.safeParse({
    id: formData.get('id'),
    truck_number: formData.get('truck_number'),
    model: formData.get('model') || null,
    capacity_tons: formData.get('capacity_tons') || 0,
    insurance_expiry: formData.get('insurance_expiry') || null,
    permit_expiry: formData.get('permit_expiry') || null,
    fitness_expiry: formData.get('fitness_expiry') || null,
    service_due_date: formData.get('service_due_date') || null,
    status: formData.get('status') || 'active',
    notes: formData.get('notes') || null,
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid truck update data')
  }

  const supabase = await createClient()
  const { id, ...rest } = parsed.data

  const { error } = await supabase
    .from('trucks')
    .update({
      ...rest,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('is_deleted', false)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/trucks')
  revalidatePath(`/dashboard/trucks/${id}`)
}

export async function saveTruckAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') || '').trim()

  if (id) {
    await updateTruckAction(formData)
    return
  }

  await createTruckAction(formData)
}

export async function softDeleteTruckAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') || '')
  const delete_reason = String(formData.get('delete_reason') || '')

  if (!id) {
    throw new Error('Truck id is required')
  }

  if (!delete_reason.trim()) {
    throw new Error('Delete reason is required')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('trucks')
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

  revalidatePath('/dashboard/trucks')
}

export async function updateTruckStatusAction(
  truckId: string,
  status: 'active' | 'maintenance' | 'inactive',
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('trucks')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', truckId)
    .eq('is_deleted', false)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/trucks')
}