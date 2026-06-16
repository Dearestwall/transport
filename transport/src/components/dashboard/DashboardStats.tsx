'use client'
import { motion } from 'framer-motion'
import { Route, Users, Truck, UserCheck, FileText, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const KPI_CONFIG = [
  { key: 'total_trips', label: 'Total Trips', icon: Route, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  { key: 'active_trips', label: 'In Transit', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/20' },
  { key: 'total_clients', label: 'Clients', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/20' },
  { key: 'active_drivers', label: 'Active Drivers', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { key: 'active_trucks', label: 'Active Trucks', icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  { key: 'invoices_overdue', label: 'Overdue Invoices', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/20' },
  { key: 'pending_edit_requests', label: 'Edit Requests', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20' },
  { key: 'total_outstanding', label: 'Outstanding', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/20', isCurrency: true },
]

export function DashboardStats({ stats }: { stats: Record<string, number> | null }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {KPI_CONFIG.map((kpi, i) => (
        <motion.div
          key={kpi.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="card flex flex-col gap-2 p-3"
        >
          <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
            <kpi.icon size={14} className={kpi.color} />
          </div>
          <div>
            <div className="text-lg font-semibold tabular-nums text-[var(--color-text)]">
              {stats
                ? kpi.isCurrency
                  ? formatCurrency(stats[kpi.key] ?? 0)
                  : (stats[kpi.key] ?? 0).toLocaleString()
                : <span className="skeleton block h-5 w-12" />
              }
            </div>
            <div className="text-xs text-[var(--color-text-muted)] leading-tight">{kpi.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}