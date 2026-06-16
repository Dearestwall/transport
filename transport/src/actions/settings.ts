'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const settingsSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  site_name: z.string().min(2, 'Site name is required'),
  site_tagline: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  favicon_url: z.string().optional().nullable(),
  default_theme: z.enum(['light', 'dark', 'system']).default('system'),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  meta_keywords: z.string().optional().nullable(),
  support_email: z.string().email().optional().or(z.literal('')),
  support_phone: z.string().optional().nullable(),
  company_address: z.string().optional().nullable(),
  invoice_prefix: z.string().optional().nullable(),
  currency_code: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  performance_mode: z.enum(['balanced', 'high_performance', 'power_saver']).default('balanced'),
  allow_push_notifications: z.boolean().default(true),
  allow_email_notifications: z.boolean().default(true),
})

export async function saveSettingsAction(formData: FormData): Promise<void> {
  const parsed = settingsSchema.safeParse({
    id: formData.get('id') || null,
    site_name: formData.get('site_name'),
    site_tagline: formData.get('site_tagline') || null,
    logo_url: formData.get('logo_url') || null,
    favicon_url: formData.get('favicon_url') || null,
    default_theme: formData.get('default_theme') || 'system',
    meta_title: formData.get('meta_title') || null,
    meta_description: formData.get('meta_description') || null,
    meta_keywords: formData.get('meta_keywords') || null,
    support_email: formData.get('support_email') || '',
    support_phone: formData.get('support_phone') || null,
    company_address: formData.get('company_address') || null,
    invoice_prefix: formData.get('invoice_prefix') || 'INV',
    currency_code: formData.get('currency_code') || 'INR',
    timezone: formData.get('timezone') || 'Asia/Kolkata',
    performance_mode: formData.get('performance_mode') || 'balanced',
    allow_push_notifications: formData.get('allow_push_notifications') === 'on',
    allow_email_notifications: formData.get('allow_email_notifications') === 'on',
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid settings data')
  }

  const supabase = await createClient()
  const { id, ...rest } = parsed.data

  if (id) {
    const { error } = await supabase
      .from('site_settings')
      .update({
        ...rest,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  } else {
    const { error } = await supabase.from('site_settings').insert({
      ...rest,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  revalidatePath('/dashboard/settings')
}