import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientsTablePage from '@/components/clients/ClientsTablePage'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: clients }, { data: docs }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('clients')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false }),
    supabase
      .from('client_documents')
      .select('id,client_id,file_name,document_kind,created_at,is_deleted')
      .eq('is_deleted', false),
  ])

  if (!profile?.is_active) redirect('/auth/login')

  return (
    <ClientsTablePage
      profile={profile}
      initialClients={clients ?? []}
      initialDocuments={docs ?? []}
    />
  )
}