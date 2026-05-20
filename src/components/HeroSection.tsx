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
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-7.5M2.25 18.375V7.5c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125-.504 1.125 1.125v10.875m-19.5 0a1.125 1.125 0 0 0 1.125 1.125m17.25 0a1.125 1.125 0 0 0 1.125-1.125M3.375 6.375 7.5 10.5m-4.125-4.125h1.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H3.375m1.625-4.125L9.125 10.5m-1.625-4.125h1.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H7.5m1.625-4.125L13.25 10.5m-1.625-4.125h1.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-1.625m1.625-4.125L17.375 10.5m-1.625-4.125h1.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125h-1.625M21.75 7.5V6.375c0-.621-.504-1.125-1.125-1.125H18m3.75 2.25v2.625c0 .621-.504 1.125-1.125 1.125H18" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875A1.125 1.125 0 0 0 19.5 3.75H4.5A1.125 1.125 0 0 0 3.375 4.875v11.25c0 .621.504 1.125 1.125 1.125Z" /></svg>
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/90 via-[#09090b]/20 to-transparent hidden md:block" />
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
            <div className="block md:hidden w-32 sm:w-40 aspect-[2/3] rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-black/80 ring-4 ring-white/5 shrink-0 transform -translate-y-2 animate-fade-in">
              <img src={item.posterPath} alt={item.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* 📝 METADATA & TEKS AREA */}
          <div className="w-full text-center md:text-left flex flex-col items-center md:items-start">

            {/* BADGES ROW */}
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-4 sm:mb-5">
              <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black tracking-[0.25em] uppercase text-amber-400 border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Featured
              </span>
              {/* ⚡ CHECKPOINT 2: REPLACE BADGE LAMA LU DENGAN INI */}
              <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 ${item.type === 'MOVIE'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                {typeIcon}
                {typeLabel}
              </span>
              {releaseYear && (
                <span className="text-[10px] font-bold text-zinc-400 border border-white/5 bg-white/5 px-2.5 py-1.5 rounded-xl">
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform duration-300"><path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" /></svg>
                Tonton Sekarang
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}