'use client'

import React, { useState } from 'react'

export default function AdminFinderPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    try {
      // Menggunakan key publik langsung di sisi client untuk darurat buru-buru
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY || '6f6345ec8af245789f81d18442ff09cc' // Gantilah string ini dengan TMDB API Key asli lu jika di env tidak terbaca
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=id-ID`
      )
      
      if (!res.ok) throw new Error('Gagal mengambil data dari TMDB')
      
      const data = await res.json()
      setResults(data.results || [])
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mencari film')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#141414', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Admin Film Finder</h1>
      
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Ketik judul film (misal: Kamen Rider)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #333',
            backgroundColor: '#222',
            color: '#fff'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#E50914',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Mencari...' : 'Cari'}
        </button>
      </form>

      {error && <div style={{ color: '#E50914', marginBottom: '16px' }}>⚠️ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
        {results.map((movie) => (
          <div key={movie.id} style={{ backgroundColor: '#1f1f1f', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
            <img
              src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : 'https://via.placeholder.com/150x225?text=No+Poster'}
              alt={movie.title}
              style={{ width: '100%', borderRadius: '4px', height: '225px', objectFit: 'cover' }}
            />
            <p style={{ fontSize: '14px', marginTop: '8px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {movie.title}
            </p>
            <button
              onClick={() => alert(`ID TMDB untuk film ini: ${movie.id}`)}
              style={{
                marginTop: '8px',
                width: '100%',
                padding: '6px',
                backgroundColor: '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Ambil ID Film
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}