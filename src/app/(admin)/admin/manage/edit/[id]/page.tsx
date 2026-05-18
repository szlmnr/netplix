'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditContentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()

  const [title, setTitle]       = useState('')
  const [type, setType]         = useState('')
  const [linksText, setLinksText] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus]     = useState<{ ok: boolean; msg: string } | null>(null)

  // Ambil data saat halaman dibuka
  useEffect(() => {
    fetch(`/api/content/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setTitle(data.title)
          setType(data.type)
          setLinksText(data.linksText || '')
          setTagsText((data.tags || []).join(', '))
        }
      })
      .finally(() => setIsLoading(false))
  }, [slug])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setStatus(null)

    try {
      const res = await fetch(`/api/content/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linksText,
          tags: tagsText.split(',').map(t => t.trim()).filter(Boolean),
        })
      })

      if (res.ok) {
        setStatus({ ok: true, msg: 'Perubahan berhasil disimpan.' })
        setTimeout(() => {
          router.push('/admin/manage')
          router.refresh()
        }, 1000)
      } else {
        setStatus({ ok: false, msg: 'Gagal menyimpan perubahan.' })
      }
    } catch {
      setStatus({ ok: false, msg: 'Terjadi kesalahan koneksi.' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm animate-pulse">Memuat data konten...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* HEADER */}
        <header className="flex justify-between items-start gap-4 border-b border-gray-800 pb-5">
          <div>
            <span className="text-[10px] bg-amber-500 text-gray-950 font-black px-2 py-0.5 rounded tracking-wider uppercase">
              Mode Edit
            </span>
            <h1 className="text-xl font-black text-white mt-1.5 line-clamp-2">{title}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                type === 'MOVIE' ? 'bg-blue-600/30 text-blue-400' : 'bg-purple-600/30 text-purple-400'
              }`}>
                {type}
              </span>
              <span className="text-[10px] text-gray-600 font-mono">{slug}</span>
            </div>
          </div>
          <Link
            href="/admin/manage"
            className="shrink-0 bg-gray-900 hover:bg-gray-800 text-xs font-semibold px-4 py-2 rounded-lg border border-gray-800 transition"
          >
            Batal
          </Link>
        </header>

        <form onSubmit={handleSave} className="space-y-5">

          {/* TAGS */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Tags
              <span className="ml-1 normal-case font-normal text-gray-600">(pisahkan dengan koma)</span>
            </label>
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="tokusatsu, kamen rider, 2025"
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-amber-500 transition"
            />
            {tagsText && (
              <div className="flex flex-wrap gap-1.5">
                {tagsText.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                  <span key={tag} className="text-[11px] bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded-md font-semibold">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* LINKS */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {type === 'MOVIE' ? 'Link Video' : 'Daftar Link Episode'}
            </label>

            <textarea
              rows={type === 'MOVIE' ? 3 : 12}
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              placeholder={
                type === 'MOVIE'
                  ? "https://drive.google.com/file/d/.../preview"
                  : "Satu link per baris, atau format: nomor|link\n1|https://...\n2|https://..."
              }
              className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-amber-500 leading-relaxed transition"
            />

            <p className="text-[11px] text-gray-600 leading-relaxed">
              Komentar seperti <code className="bg-gray-950 text-amber-500 px-1 rounded">// Episode 1</code> dan tanda kutip akan otomatis dibersihkan oleh parser sebelum disimpan.
            </p>

            {/* Preview count untuk series */}
            {type === 'SERIES' && linksText && (
              <p className="text-[11px] text-emerald-500 font-semibold">
                Terdeteksi: {linksText.split('\n').filter(l => l.trim()).length} baris
              </p>
            )}
          </div>

          {/* STATUS */}
          {status && (
            <div className={`p-3 rounded-lg text-sm font-medium border ${
              status.ok
                ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
                : 'bg-rose-950/50 text-rose-400 border-rose-800'
            }`}>
              {status.msg}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex gap-3">
            <Link
              href="/admin/manage"
              className="flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-wider text-center bg-gray-900 hover:bg-gray-800 border border-gray-800 transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                isSaving
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-gray-950'
              }`}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}