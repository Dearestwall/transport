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
  const [unreadCount, setUnreadCount] = useState(0)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const mountedRef = useRef(false)

  const fetchNotifications = useCallback(async () => {
    const sb = getSupabaseClient()
    const {
      data: { user },
    } = await sb.auth.getUser()

    if (!user) return

    const { data, error } = await sb
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error || !data) return

    const list = data as AppNotification[]
    startTransition(() => {
      setNotifications(list)
      setUnreadCount(list.filter((n) => !n.read).length)
    })
  }, [])

  const cleanupChannel = useCallback(async () => {
    const sb = getSupabaseClient()
    const current = channelRef.current
    if (!current) return
    channelRef.current = null
    try {
      await sb.removeChannel(current)
    } catch {
      // no-op
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    const setup = async () => {
      const sb = getSupabaseClient()

      await cleanupChannel()

      const {
        data: { user },
      } = await sb.auth.getUser()

      if (!mountedRef.current || !user) return

      const channelName = `notif:${user.id}:${crypto.randomUUID()}`

      const channel = sb
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: RealtimePostgresInsertPayload<AppNotification>) => {
            if (!mountedRef.current) return
            const nextItem = payload.new as AppNotification
            startTransition(() => {
              setNotifications((prev) => [nextItem, ...prev])
              setUnreadCount((prev) => prev + (nextItem.read ? 0 : 1))
            })
          },
        )
        .subscribe((status: `${REALTIME_SUBSCRIBE_STATES}`) => {
          if (status === 'CHANNEL_ERROR') {
            console.warn('[useNotifications] realtime channel error')
          }
        })

      channelRef.current = channel
    }

    void setup()
    void fetchNotifications()

    return () => {
      mountedRef.current = false
      void cleanupChannel()
    }
  }, [cleanupChannel, fetchNotifications])

  const markAllRead = useCallback(async () => {
    const sb = getSupabaseClient()
    const {
      data: { user },
    } = await sb.auth.getUser()

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

  return {
    notifications,
    unreadCount,
    markAllRead,
    markRead,
    refetch: fetchNotifications,
  }
}