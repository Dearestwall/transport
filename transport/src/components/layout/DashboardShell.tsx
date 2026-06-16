'use client'
import { useState } from 'react'
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

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar
        role={profile.role as UserRole}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar profile={profile} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}