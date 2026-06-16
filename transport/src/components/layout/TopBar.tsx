'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, Menu } from 'lucide-react'
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleBellClick = () => {
    setOpen(p => !p)
    if (!open) markAllRead()
  }

  const logout = async () => {
    await getSupabaseClient().auth.signOut()
    router.replace('/auth/login')
  }

  return (
    <header className="h-14 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 flex items-center justify-between shrink-0">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--color-surface-offset)]"
      >
        <Menu size={18} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <div ref={ref} className="relative">
          <button
            onClick={handleBellClick}
            aria-label={`Notifications (${unreadCount} unread)`}
            className="relative p-2 rounded-lg hover:bg-[var(--color-surface-offset)]"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-1 w-80 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                <span className="text-xs font-semibold">Notifications</span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-[var(--color-border)]">
                {notifications.length === 0 ? (
                  <p className="text-xs text-center py-6 text-[var(--color-text-muted)]">
                    No notifications
                  </p>
                ) : (
                  notifications.slice(0, 15).map((n: AppNotification) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'w-full text-left px-4 py-2.5 hover:bg-[var(--color-surface-offset)] transition-colors',
                        !n.read && 'bg-blue-50/10'
                      )}
                    >
                      <p className="text-xs font-medium">{n.title}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate">{n.body}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{formatDate(n.created_at)}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <span className="hidden sm:block text-xs text-[var(--color-text-muted)]">
          {profile.full_name}
        </span>

        <button
          onClick={logout}
          title="Sign out"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}