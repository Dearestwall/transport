import type { Metadata } from 'next'
import { Bell, Cpu, Globe, ImageIcon, Palette, ReceiptText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { saveSettingsAction } from '@/actions/settings'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Configure branding, SEO metadata, theme behavior, performance options, and notification settings.',
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  const settings = data ?? {
    id: '',
    site_name: 'TransportMS',
    site_tagline: 'Smart transport agency operations',
    logo_url: '',
    favicon_url: '',
    default_theme: 'system',
    meta_title: 'TransportMS — Agency Management',
    meta_description:
      'Complete transport agency management system with trips, drivers, trucks, invoicing and analytics.',
    meta_keywords: 'transport,fleet,drivers,trucks,invoices,analytics',
    support_email: '',
    support_phone: '',
    company_address: '',
    invoice_prefix: 'INV',
    currency_code: 'INR',
    timezone: 'Asia/Kolkata',
    performance_mode: 'balanced',
    allow_push_notifications: true,
    allow_email_notifications: true,
  }

  return (
    <div className="section-stack">
      <section>
        <p className="eyebrow">Settings</p>
        <h1 className="page-title">Workspace settings</h1>
        <p className="section-subtitle">
          Control site branding, SEO, theme defaults, invoice identity, notifications, and performance behavior.
        </p>
      </section>

      <section className="analytics-grid-3">
        <div className="card">
          <div className="cluster">
            <div className="badge badge-info">
              <Globe size={14} />
            </div>
            <div>
              <h2 className="section-title">SEO and branding</h2>
              <p className="section-subtitle !mt-1">Title, description, logo, favicon, and public identity.</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cluster">
            <div className="badge badge-warning">
              <Palette size={14} />
            </div>
            <div>
              <h2 className="section-title">Theme and UI</h2>
              <p className="section-subtitle !mt-1">Default mode and dashboard visual behavior.</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="cluster">
            <div className="badge badge-success">
              <Cpu size={14} />
            </div>
            <div>
              <h2 className="section-title">Performance</h2>
              <p className="section-subtitle !mt-1">Balance smoothness, power usage, and background features.</p>
            </div>
          </div>
        </div>
      </section>

      <form action={saveSettingsAction}>
        <input type="hidden" name="id" value={settings.id ?? ''} />

        <section className="grid-auto">
          <div className="col-span-6 card section-stack">
            <div>
              <h2 className="section-title">Brand identity</h2>
              <p className="section-subtitle">Primary site and company presentation settings.</p>
            </div>

            <div className="form-grid">
              <div className="field">
                <label className="label">Site name</label>
                <input name="site_name" className="input" defaultValue={settings.site_name ?? ''} />
              </div>

              <div className="field">
                <label className="label">Tagline</label>
                <input name="site_tagline" className="input" defaultValue={settings.site_tagline ?? ''} />
              </div>

              <div className="field">
                <label className="label">Logo URL</label>
                <input name="logo_url" className="input" defaultValue={settings.logo_url ?? ''} />
              </div>

              <div className="field">
                <label className="label">Favicon URL</label>
                <input name="favicon_url" className="input" defaultValue={settings.favicon_url ?? ''} />
              </div>

              <div className="field full">
                <label className="label">Company address</label>
                <textarea
                  name="company_address"
                  className="textarea"
                  defaultValue={settings.company_address ?? ''}
                />
              </div>
            </div>
          </div>

          <div className="col-span-6 card section-stack">
            <div>
              <h2 className="section-title">SEO metadata</h2>
              <p className="section-subtitle">Search engine metadata used across the app and public pages.</p>
            </div>

            <div className="form-grid">
              <div className="field full">
                <label className="label">Meta title</label>
                <input name="meta_title" className="input" defaultValue={settings.meta_title ?? ''} />
              </div>

              <div className="field full">
                <label className="label">Meta description</label>
                <textarea
                  name="meta_description"
                  className="textarea"
                  defaultValue={settings.meta_description ?? ''}
                />
              </div>

              <div className="field full">
                <label className="label">Meta keywords</label>
                <input
                  name="meta_keywords"
                  className="input"
                  defaultValue={settings.meta_keywords ?? ''}
                />
              </div>
            </div>
          </div>

          <div className="col-span-6 card section-stack">
            <div>
              <h2 className="section-title">Theme and invoice settings</h2>
              <p className="section-subtitle">Operational defaults for UI and financial identity.</p>
            </div>

            <div className="form-grid">
              <div className="field">
                <label className="label">Default theme</label>
                <select
                  name="default_theme"
                  className="select"
                  defaultValue={settings.default_theme ?? 'system'}
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div className="field">
                <label className="label">Invoice prefix</label>
                <input
                  name="invoice_prefix"
                  className="input"
                  defaultValue={settings.invoice_prefix ?? 'INV'}
                />
              </div>

              <div className="field">
                <label className="label">Currency code</label>
                <input
                  name="currency_code"
                  className="input"
                  defaultValue={settings.currency_code ?? 'INR'}
                />
              </div>

              <div className="field">
                <label className="label">Timezone</label>
                <input
                  name="timezone"
                  className="input"
                  defaultValue={settings.timezone ?? 'Asia/Kolkata'}
                />
              </div>
            </div>
          </div>

          <div className="col-span-6 card section-stack">
            <div>
              <h2 className="section-title">Support and performance</h2>
              <p className="section-subtitle">Contact channels, performance mode, and delivery features.</p>
            </div>

            <div className="form-grid">
              <div className="field">
                <label className="label">Support email</label>
                <input
                  name="support_email"
                  type="email"
                  className="input"
                  defaultValue={settings.support_email ?? ''}
                />
              </div>

              <div className="field">
                <label className="label">Support phone</label>
                <input
                  name="support_phone"
                  className="input"
                  defaultValue={settings.support_phone ?? ''}
                />
              </div>

              <div className="field full">
                <label className="label">Performance mode</label>
                <select
                  name="performance_mode"
                  className="select"
                  defaultValue={settings.performance_mode ?? 'balanced'}
                >
                  <option value="balanced">Balanced</option>
                  <option value="high_performance">High performance</option>
                  <option value="power_saver">Power saver</option>
                </select>
              </div>
            </div>

            <div className="section-stack">
              <label className="surface-2 rounded-[var(--radius-lg)] p-4 flex items-center justify-between gap-4">
                <div className="cluster">
                  <div className="badge badge-info">
                    <Bell size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Push notifications</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Web push alerts for trips and approvals.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="allow_push_notifications"
                  defaultChecked={settings.allow_push_notifications ?? true}
                />
              </label>

              <label className="surface-2 rounded-[var(--radius-lg)] p-4 flex items-center justify-between gap-4">
                <div className="cluster">
                  <div className="badge badge-warning">
                    <ImageIcon size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Email notifications</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Important workflow alerts and billing notifications.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="allow_email_notifications"
                  defaultChecked={settings.allow_email_notifications ?? true}
                />
              </label>
            </div>
          </div>
        </section>

        <div className="stack-sm">
          <button type="submit" className="btn btn-primary">
            <ReceiptText size={15} />
            Save settings
          </button>
        </div>
      </form>
    </div>
  )
}