'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, Menu, Search } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useNotifications } from '@/hooks/useNotifications'
import { cn, formatDate } from '@/lib/utils'
import type { AppNotification, Profile } from '@/types'

interface TopBarProps {
  profile: Profile
  onMenuClick?: () => void
}

export default function TopBar({ profile, onMenuClick }: TopBarProps) {
  const router = useRouter()
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleBellClick = () => {
    setOpen((prev) => !prev)
    if (!open) void markAllRead()
  }

  const logout = async () => {
    await getSupabaseClient().auth.signOut()
    router.replace('/auth/login')
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="cluster min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="btn btn-ghost btn-icon lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="hidden md:flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 min-w-[260px]">
            <Search size={15} className="text-[var(--color-text-muted)]" />
            <input
              placeholder="Search trips, clients, invoices..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-faint)]"
            />
          </div>
        </div>

        <div className="cluster shrink-0">
          <div ref={ref} className="relative">
            <button
              onClick={handleBellClick}
              aria-label={`Notifications (${unreadCount} unread)`}
              className="btn btn-ghost btn-icon relative"
            >
              <Bell size={17} />
              {unreadCount > 0 ? (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--color-error)] px-1 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </button>

            {open ? (
              <div className="absolute right-0 mt-2 w-[min(92vw,24rem)] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] z-50">
                <div className="split border-b border-[var(--color-divider)] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold">Notifications</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Recent system and workflow updates
                    </p>
                  </div>
                  <span className="badge badge-info">{unreadCount} unread</span>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="empty-state !min-h-[180px]">
                      <div className="empty-state-icon">
                        <Bell size={18} />
                      </div>
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 15).map((n: AppNotification) => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={cn(
                          'block w-full border-b border-[var(--color-divider)] px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-offset)]',
                          !n.read && 'bg-[color:color-mix(in_oklab,var(--color-primary)_5%,var(--color-surface))]',
                        )}
                      >
                        <div className="split items-start">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{n.title}</p>
                            <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">
                              {n.body}
                            </p>
                          </div>
                          {!n.read ? <span className="badge badge-info">new</span> : null}
                        </div>

                        <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
                          {formatDate(n.created_at)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold leading-none">{profile.full_name}</p>
            <p className="mt-1 text-xs capitalize text-[var(--color-text-muted)]">
              {profile.role.replace(/_/g, ' ')}
            </p>
          </div>

          <button onClick={logout} title="Sign out" className="btn btn-secondary">
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}