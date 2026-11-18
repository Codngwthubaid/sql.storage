import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Database, Lock, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { toast } from '../utils/toast'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(username, password)
      toast('Welcome back', 'success')
      nav('/admin')
    } catch (err: any) {
      toast(err?.response?.data?.error || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-panel p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Database className="text-accent" size={24} />
          <span className="font-bold text-lg bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">SQLVault</span>
        </div>
        <h1 className="text-xl font-semibold mb-1">Admin Login</h1>
        <p className="text-sm text-gray-400 mb-6">Sign in to access the management workspace.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400">Username</label>
            <div className="relative mt-1">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={username} onChange={(e) => setUsername(e.target.value)} required
                className="w-full pl-9 pr-3 py-2 rounded-md bg-bg border border-border text-sm focus:border-accent outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Password</label>
            <div className="relative mt-1">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full pl-9 pr-3 py-2 rounded-md bg-bg border border-border text-sm focus:border-accent outline-none" />
            </div>
          </div>
          <button disabled={loading} className="w-full py-2.5 rounded-md bg-accent hover:bg-blue-600 disabled:opacity-50 text-white font-medium transition">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}