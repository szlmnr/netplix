'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Kita akan kirim password ke API Route pengecekan cookie
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Password salah, fren! Coba ingat-ingat lagi.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl shadow-black">
        <div className="text-center mb-6">
          <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-linear-to-r from-red-500 to-amber-500">
            NETPLIX ADMIN
          </h1>
          <p className="text-xs text-gray-500 mt-1">Masukkan password rahasia untuk masuk ke Command Center</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password Admin..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-center text-gray-100 focus:outline-none focus:border-amber-500"
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-center text-red-400 font-semibold animate-shake">
              ❌ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-linear-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition disabled:opacity-50"
          >
            {isLoading ? '⏳ Memeriksa...' : 'Masuk Meluncur 🚀'}
          </button>
        </form>
      </div>
    </div>
  )
}