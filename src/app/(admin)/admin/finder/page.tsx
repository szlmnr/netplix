'use client'

import React, { useState, useRef } from 'react'

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
  const [tagsInput, setTagsInput] = useState('')
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message?: string } | null>(null)

  // 🔥 STATE BARU: Menampung hasil parsing JSON yang sudah dikelompokkan berdasarkan Judul Bersih
  const [jsonGroups, setJsonGroups] = useState<{ [key: string]: any[] }>({})
  const [activeGroupKey, setActiveGroupKey] = useState<string>('')

  // Ref untuk input file
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ===================== HELPER FILTER JAVASCRIPT =====================
  const cleanTitleForTmdb = (title: string): string => {
    let clean = title;
    // Bersihkan tag subtitle / dubbing indonesia di depan/belakang
    clean = clean.replace(/\s+sub\s+indonesia.*/i, '');
    clean = clean.replace(/\s+subtitle\s+indonesia.*/i, '');
    clean = clean.replace(/\s+dubb?\w*\s+indonesia.*/i, '');
    clean = clean.replace(/\s+dubb?\w*.*/i, '');

    // Bersihkan penanda episode, part, season, tamat untuk mengambil JUDUL UTAMA/SPIN-OFF
    clean = clean.replace(/\s+episode\s+\d+.*/i, '');
    clean = clean.replace(/\s+stage\s+\d+.*/i, '');
    clean = clean.replace(/\s+tamat.*/i, '');
    clean = clean.replace(/\s+season\s+\d+.*/i, '');
    clean = clean.replace(/\s+part\s+\d+.*/i, '');
    clean = clean.replace(/\s+end.*/i, '');
    return clean.trim();
  }

  // ===================== FUNGSI IMPORT & AUTOMATION =====================
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const rawData = JSON.parse(event.target?.result as string)
        const items = rawData.items || rawData.episodes || rawData.movies || []

        if (items.length === 0) {
          alert("Tidak ada item data streaming yang valid di dalam file JSON ini.")
          return
        }

        // 🔥 OPTIMALISASI UTAMA: Kelompokkan item berdasarkan judul bersih (Pisah Series Utama, Spin-off & Movie)
        const groups: { [key: string]: any[] } = {}

        items.forEach((item: any) => {
          const rawTitle = item.title || ""
          const cleanKey = cleanTitleForTmdb(rawTitle)

          if (cleanKey) {
            if (!groups[cleanKey]) {
              groups[cleanKey] = []
            }
            groups[cleanKey].push(item)
          }
        })

        // Simpan hasil pengelompokan ke state UI
        setJsonGroups(groups)
        setSearchResults([])
        setSelectedContent(null)
        setBulkText('')
        setVideoUrl('')

        alert(`Berhasil mengurai JSON! Terdeteksi ${Object.keys(groups).length} judul/spin-off berbeda. Silakan pilih judul di kolom kiri.`);

      } catch (err) {
        alert("Gagal membaca struktur file JSON. Pastikan format sesuai.")
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
    reader.readAsText(file)
  }

  // 🔥 FUNGSI KETIKA JUDUL HASIL GRUP JSON DIKLIK
  const handleSelectJsonGroup = async (titleKey: string, items: any[]) => {
    setActiveGroupKey(titleKey)
    setSearchQuery(titleKey)
    setSelectedContent(null)
    setSubmitStatus(null)

    // Deteksi tipe data kelompok ini: jika ada salah satu item mengandung kata "episode", anggap ini series (TV)
    let isSeries = false
    items.forEach((item: any) => {
      if (/\bepisode\s+\d+/i.test(item.title || "")) {
        isSeries = true
      }
    })

    const detectedType = isSeries ? 'tv' : 'movie'
    setContentType(detectedType)

    if (isSeries) {
      // Ekstrak & urutkan episode secara akurat berdasarkan angka episode
      const formattedEpisodes = items
        .map((item: any) => {
          const match = (item.title || "").match(/\bepisode\s+(\d+)/i)
          const epNum = match ? parseInt(match[1], 10) : null
          return { epNum, link: item.player_link || "" }
        })
        .filter((ep: any) => ep.epNum !== null && ep.link !== "")
        .sort((a: any, b: any) => a.epNum - b.epNum)

      // Konversi ke format bulk text: nomor_eps|link_streaming
      const bulkLines = formattedEpisodes.map((ep: any) => `${ep.epNum}|${ep.link}`).join('\n')
      setBulkText(bulkLines)
      setVideoUrl('')
    } else {
      // Jika Movie, ambil player_link dari item pertama yang tersedia
      const firstMovieLink = items[0]?.player_link || ""
      setVideoUrl(firstMovieLink)
      setBulkText('')
    }

    // Eksekusi auto-search ke TMDB menggunakan kata kunci judul kelompok yang diklik
    setIsLoading(true)
    setSearchResults([])
    try {
      const res = await fetch(`/api/tmdb-search?query=${encodeURIComponent(titleKey)}&type=${detectedType}&language=en-US`)
      const data = await res.json()
      setSearchResults(data || [])
    } catch (err) {
      console.error("Gagal otomatis mencari ke TMDB", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle manual search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return

    setIsLoading(true)
    setSearchResults([])
    setSelectedContent(null)

    try {
      const res = await fetch(`/api/tmdb-search?query=${encodeURIComponent(searchQuery)}&type=${contentType}&language=en-US`)
      const data = await res.json()
      setSearchResults(data || [])
    } catch (err) {
      alert("Gagal mencari data ke TMDB")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle kirim payload ke backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContent) return

    setSubmitStatus({ message: "Sedang menyimpan ke database..." })
    const formattedTags = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '')

    try {
      const payload = contentType === 'movie'
        ? {
          contentType,
          tmdbId: selectedContent.id.toString(),
          title: selectedContent.title || selectedContent.name,
          originalTitle: selectedContent.original_title || selectedContent.original_name || null,
          year: (selectedContent.release_date || '2000').slice(0, 4),
          videoUrl: videoUrl,
          tag: formattedTags
        }
        : {
          contentType,
          tmdbId: selectedContent.id.toString(),
          title: selectedContent.title || selectedContent.name,
          originalTitle: selectedContent.original_title || selectedContent.original_name || null,
          year: (selectedContent.first_air_date || '2000').slice(0, 4),
          season: seasonNum,
          bulkEpisodesText: bulkText,
          tag: formattedTags
        }

      const res = await fetch('/api/admin/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await res.json()

      if (result.success) {
        setSubmitStatus({
          success: true,
          message: contentType === 'movie' ? "Film berhasil disimpan ke Postgres!" : result.message
        })
        setVideoUrl('')
        setBulkText('')
        setTagsInput('')
        setSelectedContent(null)
      } else {
        setSubmitStatus({ success: false, message: result.error })
      }
    } catch (err: any) {
      setSubmitStatus({ success: false, message: "Gagal terhubung ke server database." })
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* AREA FITUR IMPORT */}
        <div className="bg-gray-900 p-4 rounded-xl border border-dashed border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div>
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">📁 Fast Scraper JSON Importer (Multi-Group Optimized)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Membaca file JSON campuran, memisahkan spin-off / movie secara otomatis, dan mem-grup daftar episode.</p>
          </div>
          <label className="cursor-pointer bg-amber-600 hover:bg-amber-500 text-gray-950 font-bold text-xs px-4 py-2.5 rounded-lg transition shadow-md whitespace-nowrap">
            Pilih File JSON Lokal
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleJsonImport}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* KOLOM 1: DAFTAR GRUP JUDUL DARI FILE JSON LU */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-xl flex flex-col h-[650px]">
            <h2 className="text-sm font-bold mb-3 text-amber-500 uppercase tracking-wider">📦 1. Hasil Ekstraksi JSON ({Object.keys(jsonGroups).length})</h2>
            {Object.keys(jsonGroups).length === 0 ? (
              <div className="flex-1 border border-dashed border-gray-800 rounded-lg flex items-center justify-center p-4 text-center text-xs text-gray-500">
                Belum ada file diimport. Pilih JSON di atas untuk memilah otomatis item spin-off / utama.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-sans text-sm">
                {Object.entries(jsonGroups).map(([titleKey, items]) => {
                  const isSeriesGroup = items.some((item: any) => /\bepisode\s+\d+/i.test(item.title || ""))
                  return (
                    <div
                      key={titleKey}
                      onClick={() => handleSelectJsonGroup(titleKey, items)}
                      className={`p-3 rounded-lg cursor-pointer transition border text-left ${activeGroupKey === titleKey ? 'bg-amber-950/40 border-amber-500' : 'bg-gray-800/40 border-gray-700 hover:bg-gray-800'}`}
                    >
                      <div className="font-semibold text-gray-100 line-clamp-2">{titleKey}</div>
                      <div className="flex items-center justify-between mt-2 text-xs">
                        <span className="text-gray-400 font-mono">{items.length} Data Link</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${isSeriesGroup ? 'bg-indigo-900/60 text-indigo-300' : 'bg-rose-900/60 text-rose-300'}`}>
                          {isSeriesGroup ? 'Series' : 'Movie / Clip'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* KOLOM 2: HASIL PENCARIAN TMDB */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-xl flex flex-col h-[650px]">
            <h2 className="text-sm font-bold mb-3 text-emerald-400 uppercase tracking-wider">🔍 2. Finder Data TMDB (en-US)</h2>

            <form onSubmit={handleSearch} className="mb-3">
              <div className="flex gap-1.5">
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as 'movie' | 'tv')}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="movie">Movie</option>
                  <option value="tv">Series</option>
                </select>
                <input
                  type="text"
                  placeholder="Cari manual judul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1 rounded-lg text-xs transition">
                  Cari
                </button>
              </div>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {isLoading && <p className="text-gray-400 text-xs animate-pulse">Menghubungi API TMDB...</p>}
              {!isLoading && searchResults.length === 0 && (
                <p className="text-gray-600 text-xs text-center mt-10">Pilih judul di Kolom 1 untuk mencari otomatis</p>
              )}
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedContent(item)}
                  className={`flex gap-3 p-2.5 rounded-lg cursor-pointer transition border text-xs ${selectedContent?.id === item.id ? 'bg-emerald-950/40 border-emerald-500' : 'bg-gray-800/30 border-gray-700 hover:bg-gray-800'}`}
                >
                  {item.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="poster" className="w-10 h-14 object-cover rounded flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-14 bg-gray-700 rounded flex items-center justify-center text-[10px] flex-shrink-0">No Pic</div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-200 truncate">{item.title || item.name}</h3>
                    <p className="text-[11px] text-amber-500 font-mono truncate">Ori: {item.original_title || item.original_name || '-'}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Rilis: {item.release_date || item.first_air_date || '-'}</p>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{item.overview}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KOLOM 3: FORM VALIDASI & SUBMIT POSTGRES */}
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 shadow-xl h-[650px] overflow-y-auto">
            <h2 className="text-sm font-bold mb-3 text-indigo-400 uppercase tracking-wider">📥 3. Input ke Database Lokal</h2>

            {selectedContent ? (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="bg-gray-800/80 p-2.5 rounded-lg border border-gray-700 space-y-1">
                  <p><span className="text-gray-400">Target:</span> <strong>{selectedContent.title || selectedContent.name}</strong></p>
                  <p><span className="text-gray-400">TMDB ID:</span> <code className="text-amber-300">{selectedContent.id}</code></p>
                  <p><span className="text-gray-400">Tipe Form:</span> <span className="uppercase font-bold text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">{contentType}</span></p>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Tags (Pisahkan koma)</label>
                  <input
                    type="text"
                    placeholder="tokusatsu, kamen rider"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {contentType === 'movie' ? (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Video URL (Movie)</label>
                    <input
                      type="url"
                      required
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Season</label>
                      <input
                        type="number"
                        min={1}
                        value={seasonNum}
                        onChange={(e) => setSeasonNum(Number(e.target.value))}
                        className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Bulk Data Episode</label>
                      <textarea
                        rows={8}
                        required
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-amber-500 text-[11px]"
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-gray-950 font-bold py-2.5 rounded-lg text-xs transition tracking-wide uppercase">
                  Simpan ke Postgres
                </button>
              </form>
            ) : (
              <div className="h-40 border border-dashed border-gray-800 rounded-lg flex items-center justify-center text-center p-4 text-xs text-gray-500">
                Pilih Judul Kelompok di Kolom 1 & Tentukan Hasil TMDB di Kolom 2 untuk membuka form simpan.
              </div>
            )}

            {submitStatus && (
              <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium ${submitStatus.success === true ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800' : submitStatus.success === false ? 'bg-rose-950/50 text-rose-400 border border-rose-800' : 'bg-gray-800 text-gray-300'}`}>
                {submitStatus.message}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}