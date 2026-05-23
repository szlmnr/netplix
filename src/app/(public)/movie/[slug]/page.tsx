import { db } from '@/lib/db'
import { tmdb } from '@/lib/tmdb'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CommentSectionWrapper from '@/components/CommentSectionWrapper';
import { auth } from "@/auth";

async function getMovieData(slug: string) {
  const content = await db.content.findUnique({
    where: { slug },
    include: { movies: true }
  })

  if (!content || content.type !== 'MOVIE' || !content.movies) return null

  try {
    const details = await tmdb.getMovieDetails(content.tmdbId)
    return {
      id: content.id,
      title: details.title,
      overview: details.overview,
      backdropPath: details.backdropPath,
      posterPath: details.posterPath,
      tagline: details.tagline,
      director: details.director,
      releaseDate: details.releaseDate,
      videoUrl: content.movies.videoUrl,
    }
  } catch {
    return {
      id: content.id,
      title: content.title,
      overview: content.overview || 'Sinopsis belum tersedia.',
      backdropPath: content.backdropPath,
      posterPath: content.posterPath,
      tagline: '',
      director: 'Unknown',
      releaseDate: content.releaseDate,
      videoUrl: content.movies.videoUrl,
    }
  }
}

function getEmbedUrl(url: string) {
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
  }
  return url
}

export default async function MoviePlayerPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const session = await auth()
  const { slug } = await params
  const movie = await getMovieData(slug)
  if (!movie) notFound()

  const isGDrive = movie.videoUrl.includes('drive.google.com')
  const embedUrl = getEmbedUrl(movie.videoUrl)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 overflow-x-hidden">

      {/* CINEMATIC FIXED BACKDROP */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {movie.backdropPath && (
          <img
            src={movie.backdropPath}
            alt=""
            className="w-full h-full object-cover object-top opacity-[0.07] scale-105 blur-sm"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-[#0a0a0a]/80 to-[#0a0a0a]" />
      </div>

      {/* TOPBAR */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/5">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-zinc-400 hover:text-white text-xs font-bold transition-colors group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform">
            <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
          </svg>
          Kembali
        </Link>

        <span className="text-[10px] font-black tracking-widest uppercase text-blue-400 border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 rounded-full">
          Film
        </span>
      </header>

      {/* MAIN */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">

        {/* TITLE AREA */}
        <div className="flex items-start gap-5">
          {movie.posterPath && (
            <img
              src={movie.posterPath}
              alt={movie.title}
              className="hidden md:block w-24 rounded-xl border border-white/10 shadow-2xl shrink-0 object-cover aspect-[2/3]"
            />
          )}
          <div className="space-y-2">
            {movie.tagline && (
              <p className="text-xs text-zinc-500 italic">&ldquo;{movie.tagline}&rdquo;</p>
            )}
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-tight">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {movie.releaseDate && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
                  </svg>
                  {movie.releaseDate.substring(0, 4)}
                </span>
              )}
              {movie.director && movie.director !== 'Unknown' && (
                <span className="text-xs text-zinc-600">
                  Sutradara: <span className="text-zinc-400 font-semibold">{movie.director}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* VIDEO PLAYER */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/80 ring-1 ring-white/5">
          {isGDrive ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <video
              src={movie.videoUrl}
              controls
              autoPlay
              className="w-full h-full"
              poster={movie.backdropPath || undefined}
            />
          )}
        </div>

        {/* NOW PLAYING BAR */}
        <div className="flex items-center gap-3 bg-white/3 border border-white/6 rounded-xl px-5 py-3.5">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Sedang Diputar</p>
            <p className="text-sm font-bold text-zinc-200">{movie.title}</p>
          </div>
        </div>

        {/* SINOPSIS + INFO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Sinopsis */}
          <div className="md:col-span-2 bg-white/[0.02] border border-white/[0.05] rounded-xl px-5 py-4 space-y-2">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-600">Sinopsis</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{movie.overview}</p>
          </div>

          {/* Detail */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-5 py-4 space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-600">Detail</h3>

            {movie.director && movie.director !== 'Unknown' && (
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold mb-1">Sutradara</p>
                <p className="text-sm font-semibold text-zinc-300">{movie.director}</p>
              </div>
            )}

            {movie.releaseDate && (
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold mb-1">Tahun Rilis</p>
                <p className="text-sm font-semibold text-zinc-300">{movie.releaseDate.substring(0, 4)}</p>
              </div>
            )}

            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold mb-1">Sumber Video</p>
              <div>
                <a className="text-xs text-blue-400 hover:text-blue-300 transition-colors break-all line-clamp-2">
                  Fansub Indonesia
                </a>
              </div>
            </div>
          </div>
        </div>
        <CommentSectionWrapper
          contentId={movie.id}
          isLoggedIn={!!session?.user}
        />
      </div>
    </div>
  )
}