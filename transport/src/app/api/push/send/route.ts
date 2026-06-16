/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: NextRequest) {
  const { userId, title, body, url, tag } = await req.json()
  const supabase = await createClient()
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
  if (!subs?.length) return NextResponse.json({ sent: 0 })
  const payload = JSON.stringify({ title, body, url, tag })
  const results = await Promise.allSettled(
    subs.map((sub: { endpoint: any; p256dh: any; auth: any }) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  )
  const sent = results.filter((r: { status: string }) => r.status === 'fulfilled').length
  await supabase.from('notifications').update({ is_sent_push: true, push_sent_at: new Date().toISOString() })
    .eq('user_id', userId).eq('is_sent_push', false)
  return NextResponse.json({ sent })
}