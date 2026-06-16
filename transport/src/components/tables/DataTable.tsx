'use client'
import { useMemo, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  pageSize?: number
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
}

function getValue<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  pageSize = 20,
  loading = false,
  emptyMessage = 'No records found.',
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return data
    return data.filter(row =>
      columns.some(col => String(getValue(row, col.key) ?? '').toLowerCase().includes(q))
    )
  }, [data, search, columns])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = getValue(a, sortKey)
      const bv = getValue(b, sortKey)
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        placeholder="Search…"
        value={search}
        onChange={e => {
          setSearch(e.target.value)
          setPage(1)
        }}
        className="w-full max-w-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      />

      <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-surface-offset)] border-b border-[var(--color-border)]">
              {columns.map(col => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  className={cn(
                    'px-3 py-2.5 text-left text-xs font-semibold text-[var(--color-text-muted)] whitespace-nowrap select-none',
                    col.sortable && 'cursor-pointer hover:text-[var(--color-text)]'
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--color-divider)]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={col.key} className="px-3 py-2.5">
                      <div className="h-4 rounded bg-[var(--color-surface-offset)] animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[var(--color-text-muted)] text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => (
                <tr
                  key={(row as { id?: string }).id ?? i}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'hover:bg-[var(--color-surface-offset)] transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map(col => (
                    <td key={col.key} className="px-3 py-2.5 text-xs text-[var(--color-text)] whitespace-nowrap">
                      {col.render ? col.render(row) : String(getValue(row, col.key) ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>{sorted.length} record{sorted.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-1">
          <button
            title="Previous page"
            aria-label="Previous page"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded hover:bg-[var(--color-surface-offset)] disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2">{page} / {totalPages}</span>
          <button
            title="Next page"
            aria-label="Next page"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded hover:bg-[var(--color-surface-offset)] disabled:opacity-40 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataTable