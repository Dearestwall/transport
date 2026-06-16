import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const VARIANTS = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
} as const

type Variant = keyof typeof VARIANTS

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode
  variant?: Variant
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium',
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function tripStatusBadge(status: string) {
  const map: Record<string, Variant> = {
    planned: 'info',
    in_transit: 'warning',
    delivered: 'success',
    cancelled: 'danger',
    on_hold: 'purple',
  }
  return <Badge variant={map[status] ?? 'default'}>{status.replace(/_/g, ' ')}</Badge>
}

export function invoiceStatusBadge(status: string) {
  const map: Record<string, Variant> = {
    draft: 'default',
    sent: 'info',
    paid: 'success',
    overdue: 'danger',
    partial: 'warning',
    cancelled: 'danger',
  }
  return <Badge variant={map[status] ?? 'default'}>{status}</Badge>
}

export function salaryStatusBadge(status: string) {
  const map: Record<string, Variant> = {
    pending: 'warning',
    paid: 'success',
    partial: 'info',
  }
  return <Badge variant={map[status] ?? 'default'}>{status}</Badge>
}