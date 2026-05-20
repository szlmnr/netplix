'use client'

import React, { useState, useEffect } from 'react'

interface CommentSectionProps {
  contentId: string
}

export default function CommentSection({ contentId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([])
  const [username, setUsername] = useState('')
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  // 🔄 Fungsi Fetch Komentar dari API
  const loadComments = async () => {
    try {
      const res = await fetch(`/api/comments?contentId=${contentId}`)
      const result = await res.json()
      if (result.success) {
        setComments(result.data)
      }
    } catch (err) {
      console.error("Gagal mengambil data komentar:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (contentId) {
      loadComments()
    }
  }, [contentId])

  // 📤 Fungsi Submit Komentar Baru
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !text.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, username, text }),
      })

      const result = await res.json()
      if (result.success) {
        setText('') // Kosongkan form teks saja, username biarkan terisi biar user ga ngetik nama berkali-kali
        loadComments() // Refresh daftar komentar biar langsung muncul di atas
      } else {
        alert(result.error || "Gagal mengirim komentar")
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem saat mengirim komentar")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 mt-8 max-w-4xl shadow-lg">
      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-4 flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-zinc-400"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
            <span>Ruang Diskusi & Laporan ({comments.length})</span>
        </h3>

      {/* FORM INPUT KOMENTAR */}
      <form onSubmit={handleCommentSubmit} className="space-y-3 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Nama panggilan lu..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={30}
            required
            className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <textarea
          rows={3}
          placeholder="Tulis pendapat lu atau lapor jika ada episode/link fansub yang mati..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          required
          className="w-full bg-zinc-800/60 border border-zinc-700/60 rounded-lg px-3 py-2 text-xs text-gray-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-md tracking-wide"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Komentar'}
          </button>
        </div>
      </form>

      <div className="border-t border-zinc-800/80 my-4" />

      {/* DAFTAR LIST KOMENTAR */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
        {loading ? (
          <p className="text-zinc-500 text-xs text-center py-4 animate-pulse">Memuat diskusi...</p>
        ) : comments.length === 0 ? (
          <p className="text-zinc-600 text-xs text-center py-6 italic">Belum ada komentar di sini. Yuk, mulai obrolan!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-zinc-800/20 border border-zinc-800/50 p-3 rounded-lg text-xs hover:border-zinc-700/50 transition-colors">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-blue-400 font-sans">{comment.username}</span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-zinc-300 break-words leading-relaxed whitespace-pre-line">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}