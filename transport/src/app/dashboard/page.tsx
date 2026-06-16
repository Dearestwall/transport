import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard'
import DashboardShell from '@/components/layout/DashboardShell'
import type { DashboardStats, EditRequest, MonthlyRevenue, Profile } from '@/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/auth/login')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [tripsRes, clientsRes, trucksRes, driversRes, invoicesRes, editReqRes, revenueRes] =
    await Promise.all([
      sb.from('trips').select('id,status,departure_date').eq('is_deleted', false),
      sb.from('clients').select('id', { count: 'exact' }).eq('is_deleted', false),
      sb.from('trucks').select('id,status').eq('is_deleted', false),
      sb.from('drivers').select('id', { count: 'exact' }).eq('is_deleted', false),
      sb.from('invoices').select('total_amount,balance_amount,status').eq('is_deleted', false),
      sb
        .from('edit_requests')
        .select('*,requester:profiles(full_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      sb.rpc('get_monthly_revenue', { months_back: 12 }),
    ])

  const trips = (tripsRes.data ?? []) as { id: string; status: string; departure_date: string }[]
  const trucks = (trucksRes.data ?? []) as { id: string; status: string }[]
  const invoices = (invoicesRes.data ?? []) as {
    total_amount: number
    balance_amount: number
    status: string
  }[]

  const revenueThisMonth = invoices
    .filter(inv => ['paid', 'partial'].includes(inv.status))
    .reduce((s, inv) => s + (inv.total_amount ?? 0), 0)

  const pendingInvoices = invoices.filter(inv => ['sent', 'overdue', 'partial'].includes(inv.status))

  const stats: DashboardStats = {
    total_trips: trips.length,
    active_trips: trips.filter(t => t.status === 'in_transit').length,
    total_clients: clientsRes.count ?? 0,
    total_trucks: trucks.length,
    total_drivers: driversRes.count ?? 0,
    revenue_this_month: revenueThisMonth,
    pending_invoices_count: pendingInvoices.length,
    pending_invoices_amount: pendingInvoices.reduce((s, inv) => s + (inv.balance_amount ?? 0), 0),
    pending_edit_requests: editReqRes.data?.length ?? 0,
    trucks_in_maintenance: trucks.filter(t => t.status === 'maintenance').length,
    drivers_on_trip: trips.filter(t => t.status === 'in_transit').length,
    trips_this_month: trips.filter(t => t.departure_date >= monthStart).length,
    pending_invoices: pendingInvoices.length,
  }

  return (
    <DashboardShell profile={profile as Profile}>
      <AnalyticsDashboard
        stats={stats}
        monthlyRevenue={(revenueRes.data ?? []) as MonthlyRevenue[]}
        initialRequests={(editReqRes.data ?? []) as EditRequest[]}
        profile={profile as Profile}
      />
    </DashboardShell>
  )
}