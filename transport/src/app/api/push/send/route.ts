 
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function configureWebPush() {
  const vapidSubject = process.env.VAPID_SUBJECT
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

  if (!vapidSubject || !vapidPublicKey || !vapidPrivateKey) {
    throw new Error('Missing VAPID environment variables')
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

export async function POST(req: NextRequest) {
  try {
    configureWebPush()

    const { userId, title, body, url, tag } = await req.json()
    const supabase = await createClient()

    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (subsError) {
      return NextResponse.json(
        { error: subsError.message },
        { status: 500 },
      )
    }

    if (!subs?.length) {
      return NextResponse.json({ sent: 0 })
    }

    const payload = JSON.stringify({ title, body, url, tag })

    const results = await Promise.allSettled(
      subs.map((sub: { endpoint: string; p256dh: string; auth: string }) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
        ),
      ),
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length

    await supabase
      .from('notifications')
      .update({
        is_sent_push: true,
        push_sent_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_sent_push', false)

    return NextResponse.json({ sent })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Push send failed'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}