'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Truck, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) { setError(err.message); return }
    router.replace('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <Truck size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">TransportMS</span>
        </div>

        <div className="card p-6 space-y-5">
          <div>
            <h1 className="text-lg font-semibold">Sign in</h1>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Use your agency credentials</p>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-2.5 rounded-lg border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10"
                  value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)] hover:text-[var(--color-text)]">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-[var(--color-primary)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <><Loader2 size={14} className="animate-spin" />Signing in...</> : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--color-text-faint)] mt-6">
          Contact your superadmin to get access.
        </p>
      </div>
    </div>
  )
}