/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import type { Profile, UserRole } from '@/types'

export default function DashboardShell({
  profile,
  children,
}: {
  profile: Profile
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <div className="app-shell min-h-screen overflow-x-hidden bg-[var(--color-bg)]">
      <Sidebar
        role={profile.role as UserRole}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="main-content flex min-w-0 flex-1 flex-col overflow-hidden lg:pl-60">
        <TopBar profile={profile} onMenuClick={() => setMobileOpen(true)} />
        <main className="page-content flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  )
}