'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  // Un-wrap params bawaan Next.js modern menggunakan React.use()
  const { id } = use(params)
  const router = useRouter()

  const [title, setTitle] = useState('Memuat judul...')
  const [type, setType] = useState('')
  const [linksText, setLinksText] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Ambil data link lama saat halaman pertama kali dibuka
  useEffect(() => {
    fetch(`/api/content/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setTitle(data.title)
          setType(data.type)
          setLinksText(data.linksText)
        }
      })
  }, [id])

  // Fungsi saat tombol "Simpan Perubahan" diklik
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linksText })
      })

      if (res.ok) {
        alert('Mantap! Perubahan link berhasil disimpan.')
        router.push('/admin/manage')
        router.refresh() // Segarkan halaman biar perubahannya langsung instan kelihatan
      } else {
        alert('Gagal menyimpan perubahan.')
      }
    } catch {
      alert('Terjadi kesalahan koneksi.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        
        <header className="mb-8 border-b border-gray-800 pb-5 flex justify-between items-center">
          <div>
            <span className="text-[10px] bg-amber-500 text-gray-950 font-black px-2 py-0.5 rounded shadow tracking-wider uppercase">
              MODE EDIT
            </span>
            <h1 className="text-xl font-black text-white mt-1.5 line-clamp-1">{title}</h1>
          </div>
          <Link 
            href="/admin/manage" 
            className="bg-gray-900 hover:bg-gray-800 text-xs font-semibold px-4 py-2 rounded-lg border border-gray-800 transition"
          >
            Batal
          </Link>
        </header>

        <main className="bg-gray-900 border border-gray-800 rounded-xl p-5 md:p-6 shadow-xl">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                {type === 'MOVIE' ? '🔗 Link Video murni (Movie)' : '🎞️ Daftar Link Episode (Berbaris / Bulk)'}
              </label>
              
              <textarea
                rows={10}
                value={linksText}
                onChange={(e) => setLinksText(e.target.value)}
                placeholder={
                  type === 'MOVIE' 
                    ? "Masukkan link Google Drive murni film di sini..." 
                    : "Baris 1: Link Episode 1\nBaris 2: Link Episode 2\nBaris 3: Link Episode 3"
                }
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-amber-500 leading-relaxed shadow-inner"
              />
              
              <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                *Tips: Kamu tetap bisa menyertakan tanda kutip, koma, maupun komentar kustom seperti <code className="bg-gray-950 text-amber-500 px-1 rounded">// Episode X</code> di sebelah kanan baris. Parser otomatis akan membersihkannya kembali sebelum disimpan ke database.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className={`w-full py-3 rounded-lg text-xs font-black uppercase tracking-wider shadow-md transition cursor-pointer ${
                isSaving 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-amber-500/10'
              }`}
            >
              {isSaving ? '⏳ Menyimpan Perubahan...' : '💾 Simpan Perubahan Link'}
            </button>
          </form>
        </main>

      </div>
    </div>
  )
}