-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('superadmin','admin','operations_manager','accountant','dispatcher','data_entry','viewer');
CREATE TYPE record_status AS ENUM ('draft','locked','archived');
CREATE TYPE trip_status AS ENUM ('planned','in_transit','delivered','cancelled','on_hold');
CREATE TYPE invoice_status AS ENUM ('draft','sent','paid','overdue','cancelled','partial');
CREATE TYPE truck_status AS ENUM ('active','maintenance','idle','retired');
CREATE TYPE driver_status AS ENUM ('active','on_trip','on_leave','suspended','terminated');
CREATE TYPE salary_type AS ENUM ('fixed','per_trip','per_km','mixed');
CREATE TYPE audit_action AS ENUM ('INSERT','UPDATE','DELETE','SOFT_DELETE','RESTORE','APPROVE','REJECT','LOCK','EXPORT','IMPORT','LOGIN','LOGOUT');
CREATE TYPE approval_status AS ENUM ('pending','approved','rejected','cancelled');
CREATE TYPE shipment_direction AS ENUM ('domestic','import','export','transit');
CREATE TYPE document_type AS ENUM ('rc_book','insurance','permit','fitness','puc','license','aadhaar','pan','invoice_pdf','lr_copy','customs_doc','export_doc','import_doc','other');

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROLE PERMISSIONS
-- ============================================================
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  resource TEXT NOT NULL,
  can_create BOOLEAN NOT NULL DEFAULT FALSE,
  can_read BOOLEAN NOT NULL DEFAULT FALSE,
  can_update BOOLEAN NOT NULL DEFAULT FALSE,
  can_delete BOOLEAN NOT NULL DEFAULT FALSE,
  can_export BOOLEAN NOT NULL DEFAULT FALSE,
  can_import BOOLEAN NOT NULL DEFAULT FALSE,
  can_approve BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(role, resource)
);

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_code TEXT UNIQUE,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT NOT NULL,
  alternate_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  gst_number TEXT,
  pan_number TEXT,
  credit_limit NUMERIC(12,2) NOT NULL DEFAULT 0,
  credit_days INTEGER NOT NULL DEFAULT 30,
  notes TEXT,
  status record_status NOT NULL DEFAULT 'draft',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id),
  delete_reason TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TRUCKS
-- ============================================================
CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  truck_number TEXT UNIQUE NOT NULL,
  make TEXT, model TEXT, year INTEGER,
  capacity_tons NUMERIC(8,2),
  truck_type TEXT,
  engine_number TEXT, chassis_number TEXT,
  owner_name TEXT, owner_phone TEXT,
  owner_type TEXT NOT NULL DEFAULT 'company',
  current_odometer NUMERIC(10,2) NOT NULL DEFAULT 0,
  fuel_type TEXT NOT NULL DEFAULT 'diesel',
  status truck_status NOT NULL DEFAULT 'idle',
  record_status record_status NOT NULL DEFAULT 'draft',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ, deleted_by UUID REFERENCES profiles(id), delete_reason TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- DRIVERS
-- ============================================================
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_code TEXT UNIQUE,
  full_name TEXT NOT NULL,
  date_of_birth DATE, gender TEXT,
  phone TEXT NOT NULL, alternate_phone TEXT, email TEXT,
  address TEXT, city TEXT, state TEXT, pincode TEXT,
  aadhaar_number TEXT, pan_number TEXT,
  license_number TEXT NOT NULL, license_expiry DATE NOT NULL, license_type TEXT,
  joining_date DATE,
  salary_type salary_type NOT NULL DEFAULT 'fixed',
  base_salary NUMERIC(10,2), per_trip_rate NUMERIC(8,2), per_km_rate NUMERIC(8,4),
  bank_account TEXT, bank_ifsc TEXT, bank_name TEXT,
  emergency_contact TEXT, emergency_phone TEXT,
  status driver_status NOT NULL DEFAULT 'active',
  record_status record_status NOT NULL DEFAULT 'draft',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ, deleted_by UUID REFERENCES profiles(id), delete_reason TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIPS
-- ============================================================
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_number TEXT UNIQUE,
  client_id UUID NOT NULL REFERENCES clients(id),
  truck_id UUID NOT NULL REFERENCES trucks(id),
  driver_id UUID NOT NULL REFERENCES drivers(id),
  direction shipment_direction NOT NULL DEFAULT 'domestic',
  origin TEXT NOT NULL, destination TEXT NOT NULL,
  planned_departure TIMESTAMPTZ NOT NULL,
  actual_departure TIMESTAMPTZ,
  planned_arrival TIMESTAMPTZ, actual_arrival TIMESTAMPTZ,
  distance_km NUMERIC(10,2),
  cargo_description TEXT, cargo_weight_tons NUMERIC(8,2),
  freight_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  advance_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  lr_number TEXT, consignee_name TEXT, consignee_address TEXT,
  customs_ref TEXT, bl_number TEXT, port_of_loading TEXT, port_of_discharge TEXT,
  notes TEXT,
  status trip_status NOT NULL DEFAULT 'planned',
  record_status record_status NOT NULL DEFAULT 'draft',
  locked_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ, deleted_by UUID REFERENCES profiles(id), delete_reason TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE,
  client_id UUID NOT NULL REFERENCES clients(id),
  trip_id UUID REFERENCES trips(id),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 18,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  balance_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_mode TEXT, payment_ref TEXT, payment_date DATE,
  status invoice_status NOT NULL DEFAULT 'draft',
  notes TEXT, pdf_url TEXT,
  record_status record_status NOT NULL DEFAULT 'draft',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ, deleted_by UUID REFERENCES profiles(id), delete_reason TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL, quantity NUMERIC(10,3) NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL, total_price NUMERIC(12,2) NOT NULL,
  hsn_sac TEXT, gst_rate NUMERIC(5,2) NOT NULL DEFAULT 18,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SALARY RUNS
-- ============================================================
CREATE TABLE salary_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_month TEXT NOT NULL,
  driver_id UUID NOT NULL REFERENCES drivers(id),
  base_salary NUMERIC(10,2) NOT NULL DEFAULT 0,
  trips_count INTEGER NOT NULL DEFAULT 0,
  trip_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  km_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  bonus NUMERIC(10,2) NOT NULL DEFAULT 0,
  deductions NUMERIC(10,2) NOT NULL DEFAULT 0,
  advance_deduct NUMERIC(10,2) NOT NULL DEFAULT 0,
  gross_salary NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_salary NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_date DATE, payment_mode TEXT, payment_ref TEXT,
  notes TEXT, approved_by UUID REFERENCES profiles(id), approved_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(run_month, driver_id)
);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL, entity_id UUID NOT NULL,
  doc_type document_type NOT NULL DEFAULT 'other',
  title TEXT NOT NULL, file_url TEXT NOT NULL,
  file_name TEXT, file_size INTEGER, mime_type TEXT,
  issue_date DATE, expiry_date DATE,
  issuing_authority TEXT, doc_number TEXT, notes TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action audit_action NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB, new_values JSONB, changed_fields TEXT[],
  performed_by UUID REFERENCES profiles(id),
  user_email TEXT, user_role TEXT,
  ip_address INET, user_agent TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- EDIT REQUESTS
-- ============================================================
CREATE TABLE edit_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL, record_id UUID NOT NULL,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changes JSONB NOT NULL, reason TEXT NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ, review_note TEXT, applied_at TIMESTAMPTZ
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, title TEXT NOT NULL, body TEXT,
  data JSONB, is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ, is_sent_push BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PUSH SUBSCRIPTIONS
-- ============================================================
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL, auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INVOICE NUMBER SEQUENCE
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001;
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(now(), 'YYYY') || '-' || LPAD(nextval('invoice_number_seq')::TEXT, 5, '0');
  END IF; RETURN NEW;
END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_invoice_number BEFORE INSERT ON invoices FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- INDEXES
CREATE INDEX idx_trips_client ON trips(client_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_truck ON trips(truck_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_departure ON trips(planned_departure);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_audit_table ON audit_logs(table_name, created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(performed_by, created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_expiry ON documents(expiry_date) WHERE expiry_date IS NOT NULL;