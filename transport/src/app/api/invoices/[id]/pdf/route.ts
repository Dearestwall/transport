import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/invoices/[id]/pdf'>,
) {
  const { id } = await ctx.params
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*), items:invoice_items(*)')
    .eq('id', id)
    .single()

  if (error || !invoice) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(invoice)
}