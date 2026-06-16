import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import  Sidebar  from '@/components/layout/Sidebar'
import  TopBar  from '@/components/layout/TopBar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles')
    .select('*').eq('id', user.id).single()
  if (!profile || !profile.is_active) redirect('/auth/login')

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar role={profile.role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar profile={profile} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}