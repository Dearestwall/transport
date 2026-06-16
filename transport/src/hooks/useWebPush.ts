/* eslint-disable react-hooks/set-state-in-effect */
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useWebPush() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window)
  }, [])

  async function subscribe() {
    if (!supported) return
    const reg = await navigator.serviceWorker.register('/sw.js')
    const existing = await reg.pushManager.getSubscription()
    const sub = existing ?? await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const subJson = sub.toJSON()
    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      endpoint: subJson.endpoint!,
      p256dh: (subJson.keys as Record<string, string>).p256dh,
      auth: (subJson.keys as Record<string, string>).auth,
    }, { onConflict: 'endpoint' })
    setSubscribed(true)
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.getRegistration()
    const sub = await reg?.pushManager.getSubscription()
    if (sub) {
      await sub.unsubscribe()
      await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      setSubscribed(false)
    }
  }

  return { supported, subscribed, subscribe, unsubscribe }
}