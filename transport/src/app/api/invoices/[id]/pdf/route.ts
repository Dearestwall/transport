import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, client:clients(*), items:invoice_items(*)')
    .eq('id', params.id).single()
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Return JSON — use jsPDF on client or in edge function for PDF generation
  return NextResponse.json(invoice)
}