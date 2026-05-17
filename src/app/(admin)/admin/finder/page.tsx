'use client'

import React, { useState } from 'react'

export default function AdminFinderPage() {
  // State untuk Pencarian TMDB
  const [searchQuery, setSearchQuery] = useState('')
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // State untuk Form Input Database
  const [selectedContent, setSelectedContent] = useState<any | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [seasonNum, setSeasonNum] = useState(1)
  const [bulkText, setBulkText] = useState('')
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message?: string } | null>(null)

  // 1. Fungsi mencari film ke API internal router
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return
    
    setIsLoading(true)
    setSearchResults([])
    setSelectedContent(null)
    
    try {
      const res = await fetch(`/api/tmdb-search?query=${encodeURIComponent(searchQuery)}&type=${contentType}`)
      const data = await res.json()
      setSearchResults(data || [])
    } catch (err) {
      alert("Gagal mencari data ke TMDB")
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Fungsi submit data menggunakan dinamis import untuk menghindari crash komponen client
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContent) return

    setSubmitStatus({ message: "Sedang menyimpan ke database..." })

    try {
      // Teknik memanggil Server Action secara dinamis di dalam fungsi (aman dari crash render awal)
      const { createMovieAction, createSeriesBulkAction } = await import('@/services/video')

      if (contentType === 'movie') {
        const result = await createMovieAction({
          tmdbId: selectedContent.id.toString(),
          title: selectedContent.title || selectedContent.name,
          videoUrl: videoUrl
        })
        if (result.success) {
          setSubmitStatus({ success: true, message: "Film berhasil disimpan ke Postgres!" })
          setVideoUrl('')
          setSelectedContent(null)
        } else {
          setSubmitStatus({ success: false, message: result.error })
        }
      } else {
        const result = await createSeriesBulkAction({
          tmdbId: selectedContent.id.toString(),
          title: selectedContent.title || selectedContent.name,
          season: seasonNum,
          bulkEpisodesText: bulkText
        })
        if (result.success) {
          setSubmitStatus({ success: true, message: result.message })
          setBulkText('')
          setSelectedContent(null)
        } else {
          setSubmitStatus({ success: false, message: result.error })
        }
      }
    } catch (err: any) {
      setSubmitStatus({ success: false, message: "Gagal memuat fungsi database server." })
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: PENCARIAN TMDB */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
          <h1 className="text-xl font-bold mb-4 text-emerald-400">🔍 Finder Data TMDB</h1>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <select 
                value={contentType} 
                onChange={(e) => setContentType(e.target.value as 'movie' | 'tv')}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="movie">Movie</option>
                <option value="tv">Series (TV)</option>
              </select>
              <input 
                type="text" 
                placeholder="Ketik judul film / series..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition">
                Cari
              </button>
            </div>
          </form>

          {/* List Hasil Pencarian */}
          <div className="mt-6 space-y-3 max-h-125 overflow-y-auto pr-2">
            {isLoading && <p className="text-gray-400 text-sm animate-pulse">Mencari data ke TMDB...</p>}
            {searchResults.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedContent(item)}
                className={`flex gap-4 p-3 rounded-lg cursor-pointer transition border ${selectedContent?.id === item.id ? 'bg-emerald-950/40 border-emerald-500' : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'}`}
              >
                {item.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="poster" className="w-12 h-18 object-cover rounded" />
                ) : (
                  <div className="w-12 h-18 bg-gray-700 rounded flex items-center justify-center text-xs">No Pic</div>
                )}
                <div>
                  <h3 className="font-semibold text-sm">{item.title || item.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">Rilis: {item.release_date || item.first_air_date || '-'}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{item.overview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KOLOM KANAN: INPUT LINK & POST KE DATABASE */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-amber-400">📥 Input ke Database Lokal</h2>

          {selectedContent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-gray-800/80 p-3 rounded-lg border border-gray-700 text-sm">
                <p><span className="text-gray-400">Target Konten:</span> <strong>{selectedContent.title || selectedContent.name}</strong></p>
                <p><span className="text-gray-400">TMDB ID:</span> <code className="text-amber-300">{selectedContent.id}</code></p>
                <p><span className="text-gray-400">Tipe:</span> <span className="uppercase font-bold text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">{contentType}</span></p>
              </div>

              {contentType === 'movie' ? (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Video URL</label>
                  <input 
                    type="url" 
                    required
                    placeholder="https://urllinkstreaming.com/video.mp4"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Season Berapa?</label>
                    <input 
                      type="number" 
                      min={1}
                      value={seasonNum}
                      onChange={(e) => setSeasonNum(Number(e.target.value))}
                      className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bulk Input Episode</label>
                    <span className="text-[11px] text-gray-400 block mb-2">
                      💡 <strong>Tips Pasifik:</strong> Kamu bisa langsung copas baris link urut, ATAU gunakan format manual <code>nomor_eps|link_streaming</code>.
                    </span>
                    <textarea 
                      rows={6}
                      required
                      placeholder={`https://link-streaming-eps1.com\nhttps://link-streaming-eps2.com`}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-gray-950 font-bold py-2 rounded-lg text-sm transition">
                Simpan Konten ke Postgres
              </button>
            </form>
          ) : (
            <div className="h-48 border border-dashed border-gray-800 rounded-lg flex items-center justify-center text-sm text-gray-500">
              Silakan cari dan pilih film/series di kolom kiri terlebih dahulu
            </div>
          )}

          {submitStatus && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${submitStatus.success === true ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800' : submitStatus.success === false ? 'bg-rose-950/50 text-rose-400 border border-rose-800' : 'bg-gray-800 text-gray-300'}`}>
              {submitStatus.message}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}