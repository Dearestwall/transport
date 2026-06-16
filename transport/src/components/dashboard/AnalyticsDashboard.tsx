'use client'
import { useCallback, useState, useTransition } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  FileText,
  TrendingUp,
  Truck,
  Users,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { approveEditRequest, rejectEditRequest } from '@/actions/edit-requests'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { DashboardStats, EditRequest, MonthlyRevenue, Profile } from '@/types'

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

interface Props {
  stats: DashboardStats
  monthlyRevenue: MonthlyRevenue[]
  initialRequests: EditRequest[]
  profile: Profile
}

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6']

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: string
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex gap-3 items-start">
      <div className={cn('p-2 rounded-xl shrink-0', accent ?? 'bg-indigo-100 dark:bg-indigo-900/30')}>
        <Icon size={16} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[var(--color-text-muted)] truncate">{title}</p>
        <p className="text-lg font-bold leading-tight">{value}</p>
        {sub && <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function AnalyticsDashboard({
  stats,
  monthlyRevenue,
  initialRequests,
  profile,
}: Props) {
  const [requests, setRequests] = useState<EditRequest[]>(initialRequests)
  const [isPending, startTransition] = useTransition()
  const isSuperAdmin = ['superadmin', 'admin'].includes(profile.role)

  const handleApprove = useCallback((id: string) => {
    startTransition(async () => {
      const res = await approveEditRequest(id)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success('Request approved')
      setRequests(prev => prev.filter(r => r.id !== id))
    })
  }, [])

  const handleReject = useCallback((id: string) => {
    const note = window.prompt('Reason for rejection (required):')
    if (!note?.trim()) return

    startTransition(async () => {
      const res = await rejectEditRequest(id, note)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success('Request rejected')
      setRequests(prev => prev.filter(r => r.id !== id))
    })
  }, [])

  const tripStatusData = [
    { name: 'In Transit', value: stats.active_trips },
    { name: 'Planned', value: Math.max(stats.trips_this_month - stats.active_trips, 0) },
    { name: 'Maintenance', value: stats.trucks_in_maintenance },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        <KpiCard
          title="Revenue This Month"
          value={formatCurrency(stats.revenue_this_month)}
          icon={TrendingUp}
          accent="bg-green-100 dark:bg-green-900/30"
        />
        <KpiCard
          title="Active Trips"
          value={stats.active_trips}
          sub={`${stats.total_trips} total`}
          icon={Truck}
        />
        <KpiCard title="Total Clients" value={formatNumber(stats.total_clients)} icon={Users} />
        <KpiCard
          title="Total Trucks"
          value={formatNumber(stats.total_trucks)}
          sub={`${stats.trucks_in_maintenance} in maintenance`}
          icon={Truck}
          accent="bg-yellow-100 dark:bg-yellow-900/30"
        />
        <KpiCard
          title="Total Drivers"
          value={formatNumber(stats.total_drivers)}
          sub={`${stats.drivers_on_trip} on trip`}
          icon={Users}
          accent="bg-purple-100 dark:bg-purple-900/30"
        />
        <KpiCard
          title="Trips This Month"
          value={formatNumber(stats.trips_this_month)}
          icon={Activity}
          accent="bg-blue-100 dark:bg-blue-900/30"
        />
        <KpiCard
          title="Pending Invoices"
          value={formatNumber(stats.pending_invoices_count)}
          sub={formatCurrency(stats.pending_invoices_amount)}
          icon={FileText}
          accent="bg-red-100 dark:bg-red-900/30"
        />
        {isSuperAdmin && (
          <KpiCard
            title="Edit Requests"
            value={formatNumber(stats.pending_edit_requests)}
            icon={AlertCircle}
            accent="bg-orange-100 dark:bg-orange-900/30"
          />
        )}
      </div>

      <Section title="Monthly Revenue (Last 12 Months)">
        <div style={{ width: '100%', height: 300 }}>
  <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevenue} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${Math.round(Number(v ?? 0) / 1000)}k`} />
              <Tooltip formatter={v => [formatCurrency(Number(v ?? 0)), 'Revenue']} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Monthly Trips">
         <div className="w-full" style={{ height: 240 }}>
  <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip formatter={(v, name) => [formatNumber(Number(v ?? 0)), String(name)]} />
                <Bar dataKey="trips" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Fleet Status">
         <div className="w-full" style={{ height: 220 }}>
  <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tripStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}
                >
                  {tripStatusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {isSuperAdmin && (
        <Section title={`Pending Edit Requests (${requests.length})`}>
          {requests.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">No pending requests</p>
          ) : (
            <div className="space-y-2">
              {requests.map(req => (
                <div
                  key={req.id}
                  className="flex items-start justify-between gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-offset)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium capitalize">
                        {req.table_name.replace(/_/g, ' ')}
                      </span>
                      <Badge variant="warning">pending</Badge>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">{req.reason}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                      {req.requester?.full_name ?? req.requested_by} · {formatDate(req.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={isPending}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle size={11} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={isPending}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
                    >
                      <XCircle size={11} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}
    </div>
  )
}