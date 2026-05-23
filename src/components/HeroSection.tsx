import { Icon } from '@iconify/react'
import Link from 'next/link'

interface HeroItem {
  slug: string
  title: string
  type: 'MOVIE' | 'SERIES'
  posterPath?: string
  backdropPath?: string
  releaseDate?: string
  overview?: string
}

export default function HeroSection({ item }: { item: HeroItem }) {
  const href = item.type === 'MOVIE' ? `/movie/${item.slug}` : `/series/${item.slug}`
  const releaseYear = item.releaseDate ? item.releaseDate.substring(0, 4) : '—'
  const typeLabel = item.type === 'MOVIE' ? 'Film' : 'Series'
  const typeIcon = item.type === 'MOVIE' ? (
    <Icon icon="solar:video-library-linear" className="w-4 h-4" />
  ) : (
    <Icon icon="solar:tv-linear" className="w-4 h-4" />
  )

  return (
    <div className="relative w-full h-[85vh] md:h-[95vh] lg:h-screen flex items-end overflow-hidden bg-[#09090b]">

      {/* 🏙️ BACKGROUND LAYER (BACKDROP SINEMATIK) */}
      <div className="absolute inset-0 z-0">
        <img
          src={item.backdropPath || item.posterPath || '/placeholder-hero.jpg'}
          alt=""
          className="w-full h-full object-cover object-top lg:object-center scale-105 animate-[subtle-zoom_20s_infinite_alternate] brightness-[0.4] lg:brightness-[0.35]"
        />
        {/* Super Vignette Gradients */}
        <div className="absolute inset-0 bg-linear-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-[#09090b]/90 via-[#09090b]/20 to-transparent hidden md:block" />
        {/* Noise overlay super tipis */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />
      </div>

      {/* 📦 KONTEN UTAMA (RESPONSIVE GRID) */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 pb-12 sm:pb-16 md:pb-24 lg:pb-28">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">

          {/* 📱 MINI POSTER (Muncul di mobile s/d tablet, sembunyi di desktop biar fokus ke backdrop) */}
          {item.posterPath && (
            <div className="block md:hidden w-32 sm:w-40 aspect-2/3 rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-black/80 ring-4 ring-white/5 shrink-0 transform -translate-y-2 animate-fade-in">
              <img src={item.posterPath} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* 📝 METADATA & TEKS AREA */}
          <div className="w-full text-center md:text-left flex flex-col items-center md:items-start">

            {/* BADGES ROW */}
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-4 sm:mb-5">
              <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-amber-400 border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                <Icon icon="solar:flame-linear" className="w-4 h-4" />
                Featured
              </span>
              {/* ⚡ CHECKPOINT 2: REPLACE BADGE LAMA LU DENGAN INI */}
              <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 ${item.type === 'MOVIE'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                {typeIcon}
                {typeLabel}
              </span>
              {releaseYear && (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 border border-white/5 bg-white/5 px-2.5 py-1.5 rounded-xl">
                  <Icon icon="solar:calendar-linear" className="w-4 h-4" />
                  {releaseYear}
                </span>
              )}
            </div>

            {/* JUDUL MEGAH */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight max-w-4xl leading-[0.95] text-white text-balance drop-shadow-sm mb-4 sm:mb-5">
              {item.title}
            </h1>

            {/* OVERVIEW / SINOPSIS */}
            {item.overview && (
              <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-xl line-clamp-3 md:line-clamp-2 leading-relaxed text-center md:text-left text-pretty mb-6 sm:mb-8 opacity-85">
                {item.overview}
              </p>
            )}

            {/* CALL TO ACTION BUTTON ROW */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 w-full sm:w-auto">
              <Link
                href={href}
                className="group flex items-center justify-center gap-3 bg-white text-zinc-950 hover:bg-zinc-100 font-black text-sm px-8 py-4 rounded-2xl w-full sm:w-auto transition-all duration-300 shadow-xl shadow-white/5 hover:shadow-white/10 active:scale-[0.98]"
              >
                <Icon icon="solar:play-bold" className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Tonton Sekarang
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}