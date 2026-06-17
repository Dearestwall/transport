import type { UserRole } from '@/types'

export type SearchItem = {
  id: string
  title: string
  description: string
  href: string
  group: 'Navigation' | 'Operations' | 'Finance' | 'Admin' | 'Settings'
  keywords: string[]
  minRole: UserRole
}

export const SEARCH_ITEMS: SearchItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard overview',
    description: 'KPIs, revenue, pending requests, recent operations',
    href: '/dashboard',
    group: 'Navigation',
    keywords: ['home', 'overview', 'summary', 'analytics', 'stats'],
    minRole: 'viewer',
  },
  {
    id: 'trips',
    title: 'Trips',
    description: 'Manage shipments, routes, departure status and delivery flow',
    href: '/dashboard/trips',
    group: 'Operations',
    keywords: ['loads', 'bookings', 'dispatch', 'route', 'shipment', 'transport'],
    minRole: 'viewer',
  },
  {
    id: 'clients',
    title: 'Clients',
    description: 'Customer records, parties, billing entities and contacts',
    href: '/dashboard/clients',
    group: 'Operations',
    keywords: ['customers', 'party', 'consignor', 'consignee', 'accounts'],
    minRole: 'viewer',
  },
  {
    id: 'trucks',
    title: 'Trucks',
    description: 'Fleet, vehicles, lorries, maintenance and permits',
    href: '/dashboard/trucks',
    group: 'Operations',
    keywords: ['vehicle', 'lorry', 'fleet', 'truck', 'permit', 'fitness'],
    minRole: 'viewer',
  },
  {
    id: 'drivers',
    title: 'Drivers',
    description: 'Driver records, license data, assignments and availability',
    href: '/dashboard/drivers',
    group: 'Operations',
    keywords: ['staff', 'driver', 'license', 'operator', 'employee'],
    minRole: 'viewer',
  },
  {
    id: 'invoices',
    title: 'Invoices',
    description: 'Billing, payment status, receivables and invoice tracking',
    href: '/dashboard/invoices',
    group: 'Finance',
    keywords: ['billing', 'bill', 'payment', 'receivable', 'dues', 'gst'],
    minRole: 'accountant',
  },
  {
    id: 'salaries',
    title: 'Salaries',
    description: 'Driver salary runs, payout status, deductions and approvals',
    href: '/dashboard/salaries',
    group: 'Finance',
    keywords: ['salary', 'payroll', 'wages', 'advance', 'payout'],
    minRole: 'accountant',
  },
  {
    id: 'import-export',
    title: 'Import / Export',
    description: 'Bulk uploads, CSV templates, import tools and export jobs',
    href: '/dashboard/import-export',
    group: 'Admin',
    keywords: ['csv', 'excel', 'upload', 'download', 'bulk', 'template'],
    minRole: 'admin',
  },
  {
    id: 'audit-logs',
    title: 'Audit logs',
    description: 'Record history, edits, deletions and compliance tracking',
    href: '/dashboard/audit-logs',
    group: 'Admin',
    keywords: ['history', 'changes', 'logs', 'activity', 'deletion', 'compliance'],
    minRole: 'admin',
  },
  {
    id: 'users',
    title: 'Users',
    description: 'Role management, permissions, access control and staff accounts',
    href: '/dashboard/users',
    group: 'Admin',
    keywords: ['roles', 'permissions', 'staff', 'accounts', 'members'],
    minRole: 'superadmin',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Branding, theme, company profile, notifications and system preferences',
    href: '/dashboard/settings',
    group: 'Settings',
    keywords: ['preferences', 'theme', 'config', 'company', 'branding'],
    minRole: 'viewer',
  },
]