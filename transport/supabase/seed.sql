-- =========================================
-- SAMPLE SEED DATA
-- =========================================

-- Clients
insert into public.clients (
  company_name, contact_person, phone, email, gst_number, address, city, state, status, notes
) values
(
  'Punjab Freight Movers',
  'Amanpreet Singh',
  '9876500011',
  'accounts@punjabfreight.com',
  '03AABCP1234F1ZK',
  'Focal Point Phase 8, Ludhiana',
  'Ludhiana',
  'Punjab',
  'active',
  'High-volume industrial client'
),
(
  'Northline Exports',
  'Rohit Malhotra',
  '9876500012',
  'ops@northlineexports.com',
  '03AACCN4567Q1Z2',
  'Gill Road, Ludhiana',
  'Ludhiana',
  'Punjab',
  'draft',
  'Export documentation pending'
)
on conflict do nothing;

-- Drivers
insert into public.drivers (
  full_name, phone, license_number, city, state, salary_type, base_salary, status
) values
(
  'Harjit Singh',
  '9815001100',
  'PB1020240001234',
  'Ludhiana',
  'Punjab',
  'monthly',
  28000,
  'active'
),
(
  'Gurvinder Pal',
  '9815002200',
  'PB1020240005678',
  'Khanna',
  'Punjab',
  'trip_based',
  22000,
  'active'
)
on conflict do nothing;

-- Trucks
insert into public.trucks (
  truck_number, truck_type, capacity_tons, fuel_type, status, insurance_expiry, fitness_expiry
) values
(
  'PB10AB1234',
  'Container',
  18,
  'Diesel',
  'active',
  '2027-02-15',
  '2026-12-31'
),
(
  'PB10CD5678',
  'Open Body',
  12,
  'Diesel',
  'maintenance',
  '2026-11-10',
  '2026-10-20'
)
on conflict do nothing;

-- Trips
insert into public.trips (
  trip_number, client_name, origin_city, destination_city, freight_amount, trip_status, departure_date
) values
(
  'TRIP-1001',
  'Punjab Freight Movers',
  'Ludhiana',
  'Mumbai',
  72000,
  'in_transit',
  now() - interval '2 days'
),
(
  'TRIP-1002',
  'Northline Exports',
  'Ludhiana',
  'Mundra',
  54000,
  'draft',
  now() + interval '1 day'
)
on conflict do nothing;

-- Invoices
insert into public.invoices (
  invoice_number, client_name, invoice_date, due_date, amount, status
) values
(
  'INV-2026-001',
  'Punjab Freight Movers',
  current_date - 7,
  current_date + 8,
  72000,
  'sent'
),
(
  'INV-2026-002',
  'Northline Exports',
  current_date,
  current_date + 15,
  54000,
  'draft'
)
on conflict do nothing;

-- Expenses
insert into public.expenses (
  expense_date, expense_type, amount, notes, status
) values
(
  current_date - 2,
  'Fuel',
  12500,
  'Fuel filled for PB10AB1234',
  'approved'
),
(
  current_date - 1,
  'Toll',
  3400,
  'Northbound highway toll charges',
  'approved'
)
on conflict do nothing;

-- Salaries
insert into public.driver_salary_runs (
  driver_name, month_label, total_trips, base_salary, bonus_amount, deduction_amount, net_salary, status
) values
(
  'Harjit Singh',
  'Jun 2026',
  11,
  28000,
  2500,
  1000,
  29500,
  'processed'
),
(
  'Gurvinder Pal',
  'Jun 2026',
  8,
  22000,
  1800,
  500,
  23300,
  'draft'
)
on conflict do nothing;