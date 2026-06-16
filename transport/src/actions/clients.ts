'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const clientSchema = z.object({
  id: z.string().uuid().optional(),
  company_name: z.string().min(2, 'Company name is required'),
  contact_person: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  gst_number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export async function saveClientAction(formData: FormData): Promise<void> {
  const parsed = clientSchema.safeParse({
    id: formData.get('id') || undefined,
    company_name: formData.get('company_name'),
    contact_person: formData.get('contact_person') || null,
    phone: formData.get('phone') || null,
    email: formData.get('email') || '',
    gst_number: formData.get('gst_number') || null,
    address: formData.get('address') || null,
    city: formData.get('city') || null,
    state: formData.get('state') || null,
    notes: formData.get('notes') || null,
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid client data')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { id, ...payload } = parsed.data

  if (id) {
    const { error } = await supabase
      .from('clients')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase.from('clients').insert({
      ...payload,
      created_by: user?.id ?? null,
    })

    if (error) throw new Error(error.message)
  }

  revalidatePath('/dashboard/clients')
}