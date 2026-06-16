export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'operations_manager'
  | 'accountant'
  | 'dispatcher'
  | 'data_entry'
  | 'viewer'

export interface RolePermission {
  role: UserRole
  permissions: string[]
}

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone?: string
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  company_name: string
  contact_person?: string
  phone: string
  email?: string
  address?: string
  city?: string
  state?: string
  gst_number?: string
  credit_limit: number
  credit_days: number
  is_deleted: boolean
  locked: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Truck {
  id: string
  truck_number: string
  make?: string
  model?: string
  year?: number
  capacity_tons?: number
  fuel_type: string
  owner_type: 'company' | 'attached'
  owner_name?: string
  owner_phone?: string
  truck_type?: string
  engine_number?: string
  chassis_number?: string
  insurance_expiry?: string
  fitness_expiry?: string
  permit_expiry?: string
  pollution_expiry?: string
  status: 'active' | 'idle' | 'maintenance' | 'retired'
  notes?: string
  is_deleted: boolean
  locked: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Driver {
  id: string
  full_name: string
  phone: string
  alternate_phone?: string
  license_number?: string
  license_expiry?: string
  address?: string
  emergency_contact?: string
  bank_account?: string
  bank_ifsc?: string
  base_salary: number
  salary_type?: 'fixed' | 'per_trip' | 'per_km'
  per_trip_rate?: number
  per_km_rate?: number
  is_deleted: boolean
  locked: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export type TripStatus =
  | 'planned'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'on_hold'

export interface Trip {
  id: string
  trip_number: string
  client_id: string
  truck_id: string
  driver_id: string
  origin: string
  destination: string
  departure_date: string
  arrival_date?: string
  freight_amount: number
  advance_paid?: number
  balance_due?: number
  status: TripStatus
  notes?: string
  is_deleted: boolean
  locked: boolean
  created_by?: string
  created_at: string
  updated_at: string
  client?: Pick<Client, 'company_name'>
  truck?: Pick<Truck, 'truck_number'>
  driver?: Pick<Driver, 'full_name'>
}

export interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  trip_id?: string
  invoice_date: string
  due_date: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  advance_adjusted: number
  balance_amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial' | 'cancelled'
  payment_note?: string
  sent_at?: string
  paid_at?: string
  notes?: string
  is_deleted: boolean
  created_by?: string
  created_at: string
  updated_at: string
  client?: Pick<Client, 'company_name'>
}

export interface SalaryRecord {
  id: string
  driver_id: string
  run_month: string
  base_salary: number
  trip_bonus: number
  deductions: number
  net_salary: number
  payment_status: 'pending' | 'paid' | 'partial'
  payment_date?: string
  notes?: string
  created_by?: string
  created_at: string
  driver?: Pick<Driver, 'full_name'>
}

export type SalaryRun = SalaryRecord

export interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  changes: Record<string, unknown>
  old_values?: Record<string, unknown>
  reason: string
  performed_by?: string
  created_at: string
  user?: Pick<Profile, 'full_name'>
}

export interface EditRequest {
  id: string
  table_name: string
  record_id: string
  changes: Record<string, unknown>
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  requested_by: string
  reviewed_by?: string
  reviewed_at?: string
  review_note?: string
  applied_at?: string
  created_at: string
  requester?: Pick<Profile, 'full_name'>
}

export interface AppNotification {
  id: string
  user_id: string
  title: string
  body: string
  read: boolean
  created_at: string
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  trips: number
}

export interface DashboardStats {
  total_trips: number
  active_trips: number
  total_clients: number
  total_trucks: number
  total_drivers: number
  revenue_this_month: number
  pending_invoices_count: number
  pending_invoices_amount: number
  pending_edit_requests: number
  trucks_in_maintenance: number
  drivers_on_trip: number
  trips_this_month: number
  pending_invoices: number
}