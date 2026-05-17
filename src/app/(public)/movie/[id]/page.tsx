import { db } from '@/lib/db'
import { tmdb } from '@/lib/tmdb'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// Fungsi mengambil detail movie gabungan Postgres + TMDB
async function getMovieData(id: string) {
  const content = await db.content.findUnique({
    where: { id },
    include: { movies: true }
  })

  // Jika data tidak ditemukan atau bukan bertipe MOVIE
  if (!content || content.type !== 'MOVIE' || !content.movies) {
    return null
  }

  try {
    const details = await tmdb.getMovieDetails(content.tmdbId)
    return {
      title: details.title,
      overview: details.overview,
      backdropPath: details.backdropPath,
      tagline: details.tagline,
      director: details.director,
      videoUrl: content.movies.videoUrl
    }
  } catch (err) {
    // Backup jika API TMDB down
    return {
      title: content.title,
      overview: 'Sinopsis tidak tersedia.',
      backdropPath: null,
      tagline: '',
      director: 'Unknown',
      videoUrl: content.movies.videoUrl
    }
  }
}

// Komponen Halaman (Next.js App Router secara otomatis memberikan params id)
export default async function MoviePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const movie = await getMovieData(id)

  if (!movie) {
    notFound() // Otomatis melempar ke halaman 404 jika ID ngawur
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* 1. HERO BACKGROUND (Efek blur gambar film di belakang) */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        {movie.backdropPath && (
          <img 
            src={movie.backdropPath} 
            alt={movie.title} 
            className="w-full h-full object-cover opacity-20 blur-sm"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-gray-950 to-transparent" />
        
        {/* Tombol Kembali */}
        <div className="absolute top-6 left-6 z-10">
          <Link href="/" className="bg-gray-900/80 hover:bg-gray-800 text-xs font-semibold px-4 py-2 rounded-lg border border-gray-700 transition flex items-center gap-2 backdrop-blur">
            ← Kembali ke Katalog
          </Link>
        </div>

        {/* Info Judul di Atas Player */}
        <div className="absolute bottom-6 left-6 right-6 max-w-4xl mx-auto">
          <span className="text-[10px] bg-blue-600 font-extrabold uppercase px-2 py-0.5 rounded shadow">
            MOVIE
          </span>
          <h1 className="text-2xl md:text-4xl font-black mt-2 text-white">{movie.title}</h1>
          {movie.tagline && <p className="text-xs md:text-sm text-amber-400 italic mt-1">"{movie.tagline}"</p>}
        </div>
      </div>

      {/* 2. AREA VIDEO PLAYER */}
      <main className="max-w-4xl mx-auto px-4 pb-16 -mt-4 relative z-10">
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden border border-gray-800 shadow-2xl shadow-black">
          {/* Untuk sementara kita pakai tag <video> bawaan HTML5. 
              Jika link kamu berbentuk .m3u8 (HLS), nanti di step terpisah kita akan install Hls.js agar bisa diputar. */}
          <video 
            src={movie.videoUrl} 
            controls 
            className="w-full h-full"
            poster={movie.backdropPath || undefined}
          />
        </div>

        {/* 3. SINOPSIS & DETAIL TAMBAHAN */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-900 pt-6">
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-lg font-bold text-gray-200">Sinopsis</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{movie.overview}</p>
          </div>
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/60 h-fit space-y-3 text-xs">
            <div>
              <span className="text-gray-500 block mb-0.5">Sutradara</span>
              <span className="font-semibold text-gray-300">{movie.director}</span>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5">Link Sumber Video</span>
              <a href={movie.videoUrl} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline break-all line-clamp-1">
                {movie.videoUrl}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}