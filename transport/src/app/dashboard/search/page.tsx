import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { searchDashboardItems } from '@/lib/search/search-utils'
import type { UserRole } from '@/types'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role,full_name,is_active')
    .eq('id', user.id)
    .single()

  if (!profile?.is_active) redirect('/auth/login')

  const results = searchDashboardItems(q, profile.role as UserRole)

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Search</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Global dashboard search with fuzzy matching and keyword recommendations
        </p>
      </div>

      <form className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Try: trips, invoice, payroll, lorry, logs..."
          className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-3 outline-none"
        />
      </form>

      <div className="grid gap-3">
        {results.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
            No results found.
          </div>
        ) : (
          results.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:bg-[var(--color-surface-offset)]"
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.description}</p>
              <p className="mt-2 text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
                {item.group}
              </p>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}