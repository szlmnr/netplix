import { db } from '@/lib/db'
import { tmdb } from '@/lib/tmdb'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// Fungsi mengambil data Series dari Postgres + detail dari TMDB
async function getSeriesData(id: string) {
  const content = await db.content.findUnique({
    where: { id },
    include: {
      episodes: {
        orderBy: { episodeNum: 'asc' } // Urutkan dari episode terkecil
      }
    }
  })

  if (!content || content.type !== 'SERIES') {
    return null
  }

  try {
    const details = await tmdb.getSeriesDetails(content.tmdbId)
    return {
      title: details.title,
      overview: details.overview,
      backdropPath: details.backdropPath,
      tagline: details.tagline,
      creator: details.creator,
      episodes: content.episodes
    }
  } catch (err) {
    return {
      title: content.title,
      overview: 'Sinopsis tidak tersedia.',
      backdropPath: null,
      tagline: '',
      creator: 'Unknown',
      episodes: content.episodes
    }
  }
}

// Komponen Halaman Utama Server-Side
export default async function SeriesPlayerPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ ep?: string }> // Membaca query "?ep=1" di URL browser
}) {
  const { id } = await params
  const { ep } = await searchParams
  
  const series = await getSeriesData(id)

  if (!series || series.episodes.length === 0) {
    notFound()
  }

  // Logika mendeteksi episode mana yang sedang aktif ditonton
  // Jika tidak ada parameter ?ep=X di URL, set otomatis ke episode pertama
  const firstEpisode = series.episodes[0]
  const currentEpNum = ep ? Number(ep) : firstEpisode.episodeNum
  const currentEpisode = series.episodes.find(e => e.episodeNum === currentEpNum) || firstEpisode

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      
      {/* 1. HERO BACKGROUND ART */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        {series.backdropPath && (
          <img 
            src={series.backdropPath} 
            alt={series.title} 
            className="w-full h-full object-cover opacity-20 blur-sm"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-950 to-transparent" />
        
        <div className="absolute top-6 left-6 z-10">
          <Link href="/" className="bg-gray-900/80 hover:bg-gray-800 text-xs font-semibold px-4 py-2 rounded-lg border border-gray-700 transition flex items-center gap-2 backdrop-blur">
            ← Kembali ke Katalog
          </Link>
        </div>

        <div className="absolute bottom-6 left-6 right-6 max-w-4xl mx-auto">
          <span className="text-[10px] bg-purple-600 font-extrabold uppercase px-2 py-0.5 rounded shadow">
            SERIES
          </span>
          <h1 className="text-2xl md:text-4xl font-black mt-2 text-white">{series.title}</h1>
          <p className="text-xs md:text-sm text-purple-400 font-medium mt-1">
            Sedang Menonton: <span className="text-amber-400 font-bold">Season {currentEpisode.season} - Episode {currentEpisode.episodeNum}</span>
          </p>
        </div>
      </div>

      {/* 2. PLAYER & DAFTAR EPISODE */}
      <main className="max-w-4xl mx-auto px-4 pb-16 -mt-4 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: VIDEO PLAYER */}
        <div className="lg:col-span-2 space-y-6">
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-gray-800 shadow-2xl shadow-black">
            <video 
              key={currentEpisode.id} // Kunci penting agar video ke-reload saat ganti episode
              src={currentEpisode.videoUrl} 
              controls 
              className="w-full h-full"
              poster={series.backdropPath || undefined}
            />
          </div>

          {/* DETAIL SINOPSIS */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-200">Sinopsis</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{series.overview}</p>
            <div className="pt-2 text-xs text-gray-500">
              Creator: <span className="text-gray-400 font-semibold">{series.creator}</span>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: DAFTAR TOMBOL EPISODE */}
        <div className="bg-gray-900/40 border border-gray-800/80 rounded-xl p-4 h-fit max-h-125 overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-300 mb-3 border-b border-gray-800 pb-2 flex items-center gap-2">
            🎞️ Daftar Episode ({series.episodes.length})
          </h3>
          
          <div className="grid grid-cols-1 gap-2">
            {series.episodes.map((epItem) => {
              const isActive = epItem.episodeNum === currentEpNum
              return (
                <Link
                  key={epItem.id}
                  href={`/series/${id}?ep=${epItem.episodeNum}`}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-xs font-semibold border transition duration-200 ${
                    isActive 
                      ? 'bg-purple-950/40 border-purple-500 text-purple-300 shadow' 
                      : 'bg-gray-800/40 border-gray-700/60 hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <span>Episode {epItem.episodeNum}</span>
                  {isActive && <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-wider animate-pulse">PLAYING</span>}
                </Link>
              )
            })}
          </div>
        </div>

      </main>
    </div>
  )
}