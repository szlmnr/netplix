import { db } from '@/lib/db'
import { tmdb } from '@/lib/tmdb'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CommentSectionWrapper from '@/components/CommentSectionWrapper';
import { auth } from "@/auth";
import { Icon } from '@iconify/react'

async function getSeriesData(slug: string) {
  const content = await db.content.findUnique({
    where: { slug },
    include: { episodes: { orderBy: { episodeNum: 'asc' } } }
  })

  if (!content || content.type !== 'SERIES') return null

  try {
    const details = await tmdb.getSeriesDetails(content.tmdbId)
    return {
      id: content.id,
      slug: content.slug,
      title: details.title,
      overview: details.overview,
      backdropPath: details.backdropPath,
      posterPath: details.posterPath,
      tagline: details.tagline,
      creator: details.creator,
      numberOfSeasons: details.numberOfSeasons,
      episodes: content.episodes
    }
  } catch {
    return {
      id: content.id,
      slug: content.slug,
      title: content.title,
      overview: content.overview || 'Sinopsis belum tersedia.',
      backdropPath: content.backdropPath,
      posterPath: content.posterPath,
      tagline: '',
      creator: 'Unknown',
      numberOfSeasons: 1,
      episodes: content.episodes
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

export default async function SeriesPlayerPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ep?: string; season?: string }>
}) {
  const session = await auth()
  const { slug } = await params
  const { ep, season } = await searchParams

  const series = await getSeriesData(slug)
  if (!series || series.episodes.length === 0) notFound()

  const firstEpisode = series.episodes[0]
  const currentEpNum = ep ? Number(ep) : firstEpisode.episodeNum
  const currentEpisode = series.episodes.find(e => e.episodeNum === currentEpNum) || firstEpisode
  const embedUrl = getEmbedUrl(currentEpisode.videoUrl)
  const isGDrive = currentEpisode.videoUrl.includes('drive.google.com')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 overflow-x-hidden">

      {/* CINEMATIC BACKDROP */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {series.backdropPath && (
          <img
            src={series.backdropPath}
            alt=""
            className="w-full h-full object-cover object-top opacity-[0.06] scale-105 blur-sm"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/80 to-[#0a0a0a]" />
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

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-widest uppercase text-purple-400 border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 rounded-full">
            Series
          </span>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* TITLE AREA */}
        <div className="mb-6 flex items-start gap-5">
          {series.posterPath && (
            <img
              src={series.posterPath}
              alt={series.title}
              className="hidden md:block w-20 rounded-lg border border-white/10 shadow-2xl shrink-0 object-cover aspect-[2/3]"
            />
          )}
          <div>
            {series.tagline && (
              <p className="text-xs text-zinc-500 italic mb-1.5">&ldquo;{series.tagline}&rdquo;</p>
            )}
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-tight">
              {series.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-xs text-zinc-500 font-medium">
                Season {currentEpisode.season} &middot; Episode {currentEpisode.episodeNum}
              </span>
              {series.creator && series.creator !== 'Unknown' && (
                <span className="text-xs text-zinc-600">
                  Kreator: <span className="text-zinc-400 font-semibold">{series.creator}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* PLAYER + EPISODE LIST GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* PLAYER — 2/3 */}
          <div className="lg:col-span-2 space-y-5">

            {/* VIDEO PLAYER */}
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/80 ring-1 ring-white/5">
              {isGDrive ? (
                <iframe
                  key={currentEpisode.id}
                  src={embedUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video
                  key={currentEpisode.id}
                  src={currentEpisode.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={series.backdropPath || undefined}
                />
              )}
            </div>

            {/* NOW PLAYING BAR */}
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Sedang Diputar</p>
                  <p className="text-sm font-bold text-zinc-200">
                    S{currentEpisode.season} E{currentEpisode.episodeNum}
                  </p>
                </div>
              </div>

              {/* Prev / Next Nav */}
              <div className="flex items-center gap-2">
                {currentEpNum > series.episodes[0].episodeNum && (
                  <Link
                    href={`/series/${series.slug}?ep=${currentEpNum - 1}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-2 rounded-lg transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                    </svg>
                    Prev
                  </Link>
                )}
                {currentEpNum < series.episodes[series.episodes.length - 1].episodeNum && (
                  <Link
                    href={`/series/${series.slug}?ep=${currentEpNum + 1}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-2 rounded-lg transition-all"
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            {/* SINOPSIS */}
            {series.overview && (
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-5 py-4 space-y-2">
                <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-zinc-600">
                  <Icon icon="solar:notebook-minimalistic-bold" className="w-4 h-4 text-zinc-600" />
                  Sinopsis</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{series.overview}</p>
              </div>
            )}
          </div>

          {/* EPISODE LIST — 1/3 */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 h-fit lg:max-h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-600 flex items-center gap-3">
                <Icon icon="solar:server-minimalistic-bold" className="w-4 h-4 text-zinc-600" />
                Episode List
              </h3>
              <span className="text-xs bg-white/5 border border-white/10 text-zinc-500 px-2 py-1 rounded-md font-bold">
                {series.episodes.length} Eps
              </span>
            </div>

            <div className="space-y-1.5">
              {series.episodes.map((epItem) => {
                const isActive = epItem.episodeNum === currentEpNum
                return (
                  <Link
                    key={epItem.id}
                    href={`/series/${series.slug}?ep=${epItem.episodeNum}`}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold border transition-all duration-200 group ${
                      isActive
                        ? 'bg-white text-zinc-950 border-white shadow-lg shadow-white/5'
                        : 'bg-white/[0.02] border-white/[0.05] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isActive ? (
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                      ) : (
                        <span className="text-[10px] font-black text-zinc-600 w-4 text-center shrink-0">
                          {epItem.episodeNum}
                        </span>
                      )}
                      <span className={isActive ? 'font-black' : ''}>
                        Episode {epItem.episodeNum}
                      </span>
                    </div>
                    {isActive && (
                      <span className="text-[9px] font-black uppercase tracking-wider text-red-500">
                        Playing
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="pt-2">
            <CommentSectionWrapper contentId={series.id} isLoggedIn={!!session?.user} />
          </div>
        </div>
      </div>
    </div>
  )
}