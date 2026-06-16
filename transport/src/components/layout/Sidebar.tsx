'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileText,
  LayoutDashboard,
  Route,
  ScrollText,
  Settings,
  Truck,
  Upload,
  UserCheck,
  Users,
  DollarSign,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, minRole: 'viewer' },
  { href: '/dashboard/trips', label: 'Trips', icon: Route, minRole: 'viewer' },
  { href: '/dashboard/clients', label: 'Clients', icon: UserCheck, minRole: 'viewer' },
  { href: '/dashboard/trucks', label: 'Trucks', icon: Truck, minRole: 'viewer' },
  { href: '/dashboard/drivers', label: 'Drivers', icon: Users, minRole: 'viewer' },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText, minRole: 'accountant' },
  { href: '/dashboard/salaries', label: 'Salaries', icon: DollarSign, minRole: 'accountant' },
  { href: '/dashboard/import-export', label: 'Import/Export', icon: Upload, minRole: 'admin' },
  { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: ScrollText, minRole: 'admin' },
  { href: '/dashboard/users', label: 'Users', icon: Users, minRole: 'superadmin' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, minRole: 'viewer' },
] as const

const H: Record<UserRole, number> = {
  superadmin: 100,
  admin: 80,
  operations_manager: 60,
  accountant: 50,
  dispatcher: 40,
  data_entry: 20,
  viewer: 10,
}

interface SidebarProps {
  role: UserRole
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ role, mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const visible = NAV.filter(n => H[role] >= H[n.minRole as UserRole])

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-60 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col',
          'transition-transform duration-300 lg:static lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-[var(--color-border)] shrink-0">
          <span className="font-bold text-sm">🚛 TransportOS</span>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--color-surface-offset)]"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {visible.map(item => {
            const Icon = item.icon
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  active
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-offset)] hover:text-[var(--color-text)]'
                )}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-3 border-t border-[var(--color-border)] shrink-0">
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
            {role}
          </span>
        </div>
      </aside>
    </>
  )
}