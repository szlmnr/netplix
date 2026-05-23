'use client'

import React, { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'

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
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 h-fit lg:max-h-[calc(100vh-12rem)] overflow-y-auto">
      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2.5">
            <Icon icon="solar:chat-line-bold" className="w-4 h-4 text-zinc-400" />
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
            className="w-full px-4 py-3 rounded-xl text-xs font-semibold border transition-all duration-200 group bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 hover:border-white/10"
          />
        </div>
        
        <textarea
          rows={3}
          placeholder="Tulis pendapat lu atau lapor jika ada episode/link fansub yang mati..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          required
          className="w-full px-4 py-3 rounded-xl text-xs font-semibold border transition-all duration-200 group bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 hover:border-white/10"
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