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
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  notes: z.string().optional().nullable(),
})

const bulkClientRowSchema = z.object({
  company_name: z.string().min(2),
  contact_person: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  gst_number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  status: z.enum(['draft', 'active', 'archived']).optional().default('draft'),
  notes: z.string().optional().nullable(),
})

async function addAuditLog(args: {
  supabase: Awaited<ReturnType<typeof createClient>>
  table_name: string
  record_id?: string | null
  action: 'insert' | 'update' | 'delete' | 'soft_delete' | 'restore'
  performed_by?: string | null
  old_values?: Record<string, unknown> | null
  new_values?: Record<string, unknown> | null
  notes?: string | null
}) {
  await args.supabase.from('audit_logs').insert({
    table_name: args.table_name,
    record_id: args.record_id ?? null,
    action: args.action,
    performed_by: args.performed_by ?? null,
    old_values: args.old_values ?? null,
    new_values: args.new_values ?? null,
    notes: args.notes ?? null,
  })
}

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
    status: formData.get('status') || 'draft',
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
    const { data: existing } = await supabase.from('clients').select('*').eq('id', id).single()

    const { error } = await supabase
      .from('clients')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw new Error(error.message)

    await addAuditLog({
      supabase,
      table_name: 'clients',
      record_id: id,
      action: 'update',
      performed_by: user?.id ?? null,
      old_values: existing,
      new_values: payload,
      notes: 'Client updated from modal form',
    })
  } else {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...payload,
        created_by: user?.id ?? null,
      })
      .select('id')
      .single()

    if (error) throw new Error(error.message)

    await addAuditLog({
      supabase,
      table_name: 'clients',
      record_id: data?.id ?? null,
      action: 'insert',
      performed_by: user?.id ?? null,
      new_values: payload,
      notes: 'Client created from modal form',
    })
  }

  revalidatePath('/dashboard/clients')
}

export async function bulkImportClientsAction(formData: FormData): Promise<void> {
  const rawRows = formData.get('rows')
  const parsedRows = z.array(bulkClientRowSchema).safeParse(
    typeof rawRows === 'string' ? JSON.parse(rawRows) : []
  )

  if (!parsedRows.success || parsedRows.data.length === 0) {
    throw new Error('No valid client rows provided for import')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const rows = parsedRows.data.map((row) => ({
    ...row,
    created_by: user?.id ?? null,
    import_source: 'csv',
  }))

  const { error } = await supabase.from('clients').insert(rows)

  if (error) throw new Error(error.message)

  await addAuditLog({
    supabase,
    table_name: 'clients',
    action: 'insert',
    performed_by: user?.id ?? null,
    new_values: { imported_rows: rows.length, import_source: 'csv' },
    notes: 'Bulk imported clients',
  })

  revalidatePath('/dashboard/clients')
}

export async function softDeleteClientAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') || '')
  const delete_reason = String(formData.get('delete_reason') || '').trim()

  if (!id) throw new Error('Client id is required')
  if (!delete_reason) throw new Error('Delete reason is required')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: existing } = await supabase.from('clients').select('*').eq('id', id).single()

  const { error } = await supabase
  .from('clients')
  .update({
    is_deleted: true,
    deleted_by: user?.id ?? null,
    delete_reason,
    updated_at: new Date().toISOString(),
    status: 'archived',
  })
  .eq('id', id)

 if (error) {
  throw new Error(`Failed to update client: ${error.message}`)
}

  await supabase.from('deletion_logs').insert({
    table_name: 'clients',
    record_id: id,
    record_snapshot: existing,
    deleted_by: user?.id ?? null,
    delete_reason,
  })

  await addAuditLog({
    supabase,
    table_name: 'clients',
    record_id: id,
    action: 'soft_delete',
    performed_by: user?.id ?? null,
    old_values: existing,
    notes: delete_reason,
  })

  revalidatePath('/dashboard/clients')
}