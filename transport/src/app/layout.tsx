import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'TransportMS — Agency Management', template: '%s | TransportMS' },
  description: 'Complete transport agency management system with trips, drivers, trucks, invoicing and analytics.',
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/apple-icon.png' },
}

export const viewport: Viewport = {
  themeColor: [{ color: '#01696f', media: '(prefers-color-scheme: light)' },
               { color: '#4f98a3', media: '(prefers-color-scheme: dark)' }],
  width: 'device-width', initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            const t = localStorage.getItem('theme') || 
              (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', t);
          })()
        `}} />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }
        }} />
      </body>
    </html>
  )
}