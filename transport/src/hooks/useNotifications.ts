'use client'
import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type {
  RealtimeChannel,
  RealtimePostgresInsertPayload,
  REALTIME_SUBSCRIBE_STATES,
} from '@supabase/supabase-js'
import type { AppNotification } from '@/types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const fetchNotifications = useCallback(async () => {
    const sb = getSupabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return

    const { data } = await sb
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      const list = data as AppNotification[]
      startTransition(() => {
        setNotifications(list)
        setUnreadCount(list.filter((n) => !n.read).length)
      })
    }
  }, [])

  function removeChannel() {
    if (channelRef.current) {
      getSupabaseClient().removeChannel(channelRef.current).catch(() => {})
      channelRef.current = null
    }
  }

  useEffect(() => {
    let active = true

    async function setup() {
      const sb = getSupabaseClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!active || !user) return

      removeChannel()

      // Fix 1: remove the generic type arg from .on() — it is untyped in this
      // version of @supabase/supabase-js so type arguments are not accepted.
      // Cast the payload inside the callback instead.
      const channel = sb
        .channel(`notif:${user.id}`)
        .on(
          'postgres_changes',
          {
            event:  'INSERT',
            schema: 'public',
            table:  'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresInsertPayload<AppNotification>) => {
            if (!active) return
            startTransition(() => {
              setNotifications((prev) => [payload.new as AppNotification, ...prev])
              setUnreadCount((prev) => prev + 1)
            })
          },
        )
        // Fix 2 & 3: explicitly type the subscribe callback params
        .subscribe((status: `${REALTIME_SUBSCRIBE_STATES}`, err?: Error) => {
          if (err) console.warn('[useNotifications] subscribe error:', err)
          if (status === 'CHANNEL_ERROR') {
            console.warn('[useNotifications] channel error')
          }
        })

      channelRef.current = channel
    }

    setup()
    fetchNotifications()

    return () => {
      active = false
      removeChannel()
    }
  }, [fetchNotifications])

  const markAllRead = useCallback(async () => {
    const sb = getSupabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return

    await sb
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false)

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  const markRead = useCallback(async (id: string) => {
    const sb = getSupabaseClient()
    await sb.from('notifications').update({ read: true }).eq('id', id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  return { notifications, unreadCount, markAllRead, markRead, refetch: fetchNotifications }
}