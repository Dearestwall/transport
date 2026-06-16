import { z } from 'zod'

// ─── Client ───────────────────────────────────────────────────────────────────
export const ClientSchema = z.object({
  company_name:   z.string().min(1, 'Company name required'),
  contact_person: z.string().optional(),
  phone:          z.string().min(10, 'Valid phone required'),
  email:          z.string().email('Invalid email').optional().or(z.literal('')),
  address:        z.string().optional(),
  city:           z.string().optional(),
  state:          z.string().optional(),
  gst_number:     z.string().optional(),
  // z.coerce.number() with .nonnegative() gives type `number`, not `unknown`
  credit_limit:   z.coerce.number().nonnegative(),
  credit_days:    z.coerce.number().nonnegative(),
})
export type ClientFormData = z.infer<typeof ClientSchema>
export const clientSchema = ClientSchema
export const ClientCSVSchema = ClientSchema

// ─── Truck ────────────────────────────────────────────────────────────────────
export const TruckSchema = z.object({
  truck_number:     z.string().min(2, 'Truck number required'),
  make:             z.string().optional(),
  model:            z.string().optional(),
  year:             z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  capacity_tons:    z.coerce.number().nonnegative().optional(),
  truck_type:       z.string().optional(),
  engine_number:    z.string().optional(),
  chassis_number:   z.string().optional(),
  owner_name:       z.string().optional(),
  owner_phone:      z.string().optional(),
  owner_type:       z.enum(['company', 'attached']),
  fuel_type:        z.string().min(1),
  status:           z.enum(['active', 'idle', 'maintenance', 'retired']),
  insurance_expiry: z.string().optional(),
  fitness_expiry:   z.string().optional(),
  permit_expiry:    z.string().optional(),
  pollution_expiry: z.string().optional(),
  notes:            z.string().optional(),
})
export type TruckFormData = z.infer<typeof TruckSchema>
export const truckSchema = TruckSchema

// ─── Driver ───────────────────────────────────────────────────────────────────
export const DriverSchema = z.object({
  full_name:         z.string().min(2, 'Name required'),
  phone:             z.string().min(10, 'Valid phone required'),
  alternate_phone:   z.string().optional(),
  email:             z.string().email().optional().or(z.literal('')),
  date_of_birth:     z.string().optional(),
  gender:            z.enum(['male', 'female', 'other']).optional(),
  address:           z.string().optional(),
  city:              z.string().optional(),
  state:             z.string().optional(),
  pincode:           z.string().optional(),
  aadhaar_number:    z.string().optional(),
  pan_number:        z.string().optional(),
  license_number:    z.string().min(5, 'License number required'),
  license_expiry:    z.string().min(1, 'License expiry required'),
  license_type:      z.string().optional(),
  joining_date:      z.string().optional(),
  salary_type:       z.enum(['fixed', 'per_trip', 'per_km', 'mixed']),
  base_salary:       z.coerce.number().nonnegative().optional(),
  per_trip_rate:     z.coerce.number().nonnegative().optional(),
  per_km_rate:       z.coerce.number().nonnegative().optional(),
  bank_account:      z.string().optional(),
  bank_ifsc:         z.string().optional(),
  bank_name:         z.string().optional(),
  emergency_contact: z.string().optional(),
  emergency_phone:   z.string().optional(),
})
export type DriverFormData = z.infer<typeof DriverSchema>
export const driverSchema = DriverSchema

// ─── Trip ─────────────────────────────────────────────────────────────────────
export const TripSchema = z.object({
  client_id:         z.string().uuid('Select a client'),
  truck_id:          z.string().uuid('Select a truck'),
  driver_id:         z.string().uuid('Select a driver'),
  direction:         z.enum(['domestic', 'import', 'export', 'transit']),
  origin:            z.string().min(2, 'Origin required'),
  destination:       z.string().min(2, 'Destination required'),
  planned_departure: z.string().min(1, 'Departure date required'),
  planned_arrival:   z.string().optional(),
  distance_km:       z.coerce.number().nonnegative().optional(),
  cargo_description: z.string().optional(),
  cargo_weight_tons: z.coerce.number().nonnegative().optional(),
  freight_amount:    z.coerce.number().nonnegative(),
  advance_paid:      z.coerce.number().nonnegative(),
  lr_number:         z.string().optional(),
  consignee_name:    z.string().optional(),
  consignee_address: z.string().optional(),
  customs_ref:       z.string().optional(),
  bl_number:         z.string().optional(),
  port_of_loading:   z.string().optional(),
  port_of_discharge: z.string().optional(),
  notes:             z.string().optional(),
})
export type TripFormData = z.infer<typeof TripSchema>
export const tripSchema = TripSchema

// ─── Invoice ──────────────────────────────────────────────────────────────────
export const InvoiceSchema = z.object({
  client_id:        z.string().uuid('Select a client'),
  trip_id:          z.string().optional(),
  invoice_date:     z.string().min(1, 'Invoice date required'),
  due_date:         z.string().min(1, 'Due date required'),
  subtotal:         z.coerce.number().nonnegative(),
  tax_rate:         z.coerce.number().min(0).max(100),
  advance_adjusted: z.coerce.number().nonnegative(),
  notes:            z.string().optional(),
})
export type InvoiceFormData = z.infer<typeof InvoiceSchema>
export const invoiceSchema = InvoiceSchema

// ─── CSV schemas ──────────────────────────────────────────────────────────────
export const DriverCSVSchema = z.object({
  full_name:      z.string().min(1),
  phone:          z.string().min(10),
  license_number: z.string().min(5),
  license_expiry: z.string().min(1),
  salary_type:    z.enum(['fixed', 'per_trip', 'per_km', 'mixed']),
  base_salary:    z.coerce.number().nonnegative(),
})
export const TruckCSVSchema = z.object({
  truck_number:  z.string().min(2),
  make:          z.string().optional(),
  model:         z.string().optional(),
  year:          z.coerce.number().optional(),
  capacity_tons: z.coerce.number().optional(),
  owner_type:    z.string(),
})
