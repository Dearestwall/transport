/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, CornerDownLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchDashboardItems } from '@/lib/search/search-utils'
import type { Profile, UserRole } from '@/types'

interface DashboardSearchDialogProps {
  open: boolean
  onClose: () => void
  profile: Profile
}

export default function DashboardSearchDialog({
  open,
  onClose,
  profile,
}: DashboardSearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const results = useMemo(
    () => searchDashboardItems(query, profile.role as UserRole),
    [query, profile.role]
  )

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (open) onClose()
      }
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[70] bg-black/50"
        onClick={onClose}
        aria-label="Close search"
      />
      <div className="fixed left-1/2 top-[12vh] z-[80] w-[min(92vw,42rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-3 border-b border-[var(--color-divider)] px-4 py-3">
          <Search size={18} className="text-[var(--color-text-muted)]" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trips, trucks, invoices, settings..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-faint)]"
          />
          <kbd className="rounded-md border border-[var(--color-border)] px-2 py-1 text-[10px] text-[var(--color-text-muted)]">
            ESC
          </kbd>
        </div>

        <div className="max-h-[26rem] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-text-muted)]">
              No matches found for <span className="font-medium text-[var(--color-text)]">{query}</span>
            </div>
          ) : (
            results.slice(0, 12).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'block rounded-xl px-4 py-3 transition-colors',
                  'hover:bg-[var(--color-surface-offset)]'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{item.description}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
                      {item.group}
                    </p>
                  </div>
                  <CornerDownLeft size={14} className="mt-1 text-[var(--color-text-faint)]" />
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-divider)] px-4 py-3 text-[11px] text-[var(--color-text-muted)]">
          <span>Use Ctrl/⌘ + K to open search</span>
          <button
            type="button"
            onClick={() => {
              onClose()
              router.push(`/dashboard/search?q=${encodeURIComponent(query)}`)
            }}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 hover:bg-[var(--color-surface-offset)]"
          >
            Open full search
          </button>
        </div>
      </div>
    </>
  )
}