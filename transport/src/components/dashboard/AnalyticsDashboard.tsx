'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Truck,
  Users,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { approveEditRequest, rejectEditRequest } from '@/actions/edit-requests'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { DashboardStats, EditRequest, MonthlyRevenue, Profile } from '@/types'

interface Props {
  stats: DashboardStats
  monthlyRevenue: MonthlyRevenue[]
  initialRequests: EditRequest[]
  profile: Profile
}

const PIE_COLORS = ['var(--color-primary)', 'var(--color-blue)', 'var(--color-warning)', 'var(--color-success)', 'var(--color-error)']

const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num)

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  tone = 'neutral',
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ElementType
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'blue'
}) {
  const toneClass = {
    neutral: 'badge-neutral',
    primary: 'badge-info',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-error',
    blue: 'badge-info',
  }[tone]

  return (
    <div className="card metric-card card-accent h-full">
      <div className="split items-start">
        <div className="space-y-2">
          <p className="metric-label">{title}</p>
          <p className="metric-value tabular">{value}</p>
          {sub ? <p className="section-subtitle !mt-0">{sub}</p> : null}
        </div>

        <div className={cn('badge shrink-0', toneClass)}>
          <Icon size={15} />
        </div>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('card section-stack', className)}>
      <div className="split">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="stack-sm">{actions}</div> : null}
      </div>

      {children}
    </section>
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
      setRequests((prev) => prev.filter((r) => r.id !== id))
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
      setRequests((prev) => prev.filter((r) => r.id !== id))
    })
  }, [])

  const tripStatusData = useMemo(
    () =>
      [
        { name: 'In Transit', value: stats.active_trips },
        { name: 'Planned', value: Math.max(stats.trips_this_month - stats.active_trips, 0) },
        { name: 'Maintenance', value: stats.trucks_in_maintenance },
      ].filter((d) => d.value > 0),
    [stats.active_trips, stats.trips_this_month, stats.trucks_in_maintenance],
  )

  return (
    <div className="section-stack">
      <section className="split">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h1 className="page-title">Transport analytics</h1>
          <p className="section-subtitle">
            Live fleet, trip, billing, and approval visibility across your transport operation.
          </p>
        </div>

        <div className="stack-sm">
          <div className="badge badge-neutral">Role: {profile.role}</div>
          <div className="badge badge-info">{formatNumber(stats.total_trips)} total trips</div>
        </div>
      </section>

      <section className="kpi-grid">
        <KpiCard
          title="Revenue this month"
          value={formatCurrency(stats.revenue_this_month)}
          sub="Collected from paid and partial invoices"
          icon={CircleDollarSign}
          tone="success"
        />
        <KpiCard
          title="Active trips"
          value={stats.active_trips}
          sub={`${stats.total_trips} total trips`}
          icon={Truck}
          tone="primary"
        />
        <KpiCard
          title="Clients"
          value={formatNumber(stats.total_clients)}
          sub="Active business accounts"
          icon={Users}
          tone="blue"
        />
        <KpiCard
          title="Fleet size"
          value={formatNumber(stats.total_trucks)}
          sub={`${stats.trucks_in_maintenance} trucks in maintenance`}
          icon={Truck}
          tone="warning"
        />
        <KpiCard
          title="Drivers"
          value={formatNumber(stats.total_drivers)}
          sub={`${stats.drivers_on_trip} drivers on trip`}
          icon={Users}
          tone="blue"
        />
        <KpiCard
          title="Trips this month"
          value={formatNumber(stats.trips_this_month)}
          sub="Current month activity"
          icon={Activity}
          tone="primary"
        />
        <KpiCard
          title="Pending invoices"
          value={formatNumber(stats.pending_invoices_count)}
          sub={formatCurrency(stats.pending_invoices_amount)}
          icon={FileText}
          tone="danger"
        />
        {isSuperAdmin ? (
          <KpiCard
            title="Edit requests"
            value={formatNumber(stats.pending_edit_requests)}
            sub="Awaiting admin review"
            icon={AlertCircle}
            tone="warning"
          />
        ) : null}
      </section>

      <div className="analytics-grid">
        <SectionCard
          title="Monthly revenue"
          subtitle="Last 12 months billing trend"
          className="col-span-8"
        >
          <div className="chart-shell chart-h-340">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <AreaChart data={monthlyRevenue} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="var(--color-divider)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${Math.round(Number(v ?? 0) / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                  formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Fleet status"
          subtitle="Trips and maintenance mix"
          className="col-span-4"
        >
          <div className="chart-shell chart-h-340">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <PieChart>
                <Pie
                  data={tripStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={92}
                  innerRadius={52}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}
                >
                  {tripStatusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="analytics-grid">
        <SectionCard
          title="Monthly trips"
          subtitle="Trip count trend by month"
          className="col-span-8"
        >
          <div className="chart-shell chart-h-300">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
              <BarChart data={monthlyRevenue} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-divider)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    boxShadow: 'var(--shadow-md)',
                  }}
                  formatter={(v) => [formatNumber(Number(v ?? 0)), 'Trips']}
                />
                <Bar dataKey="trips" fill="var(--color-blue)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Finance snapshot"
          subtitle="Quick pending billing overview"
          className="col-span-4"
        >
          <div className="section-stack">
            <div className="surface-2 rounded-[var(--radius-lg)] p-4">
              <p className="metric-label">Outstanding amount</p>
              <p className="metric-value tabular">{formatCurrency(stats.pending_invoices_amount)}</p>
            </div>

            <div className="surface-2 rounded-[var(--radius-lg)] p-4">
              <p className="metric-label">Open invoices</p>
              <p className="metric-value tabular">{formatNumber(stats.pending_invoices_count)}</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {isSuperAdmin ? (
        <SectionCard
          title={`Pending edit requests (${requests.length})`}
          subtitle="Approve or reject protected record changes"
        >
          {requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <CheckCircle2 size={20} />
              </div>
              <p>No pending requests right now.</p>
            </div>
          ) : (
            <div className="section-stack">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="surface-2 rounded-[var(--radius-lg)] p-4 transition-transform duration-200 hover:-translate-y-[1px]"
                >
                  <div className="split items-start">
                    <div className="space-y-2">
                      <div className="stack-sm">
                        <span className="badge badge-neutral capitalize">
                          {req.table_name.replace(/_/g, ' ')}
                        </span>
                        <Badge variant="warning">pending</Badge>
                      </div>

                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {req.reason || 'No reason provided'}
                      </p>

                      <p className="text-xs text-[var(--color-text-muted)]">
                        {req.requester?.full_name ?? req.requested_by} • {formatDate(req.created_at)}
                      </p>
                    </div>

                    <div className="stack-sm">
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={isPending}
                        className="btn btn-secondary"
                      >
                        <CheckCircle2 size={15} />
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={isPending}
                        className="btn btn-danger"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      ) : null}
    </div>
  )
}