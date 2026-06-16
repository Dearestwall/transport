// Service Worker for Web Push Notifications
const CACHE_NAME = 'transport-ms-v1'

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(['/', '/dashboard'])
    )
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json()
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/dashboard/notifications', ...data.data },
    actions: data.actions || [],
    tag: data.tag || 'transport-ms',
    renotify: true,
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'TransportMS', options)
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      const existing = windowClients.find(w => w.url === url && 'focus' in w)
      return existing ? existing.focus() : clients.openWindow(url)
    })
  )
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  )
})