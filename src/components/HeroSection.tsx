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

  return (
    <div className="relative w-full h-[75vh] md:h-[90vh] flex items-end overflow-hidden">
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={item.backdropPath || item.posterPath || '/placeholder-hero.jpg'}
          alt={item.title}
          className="w-full h-full object-cover object-top brightness-[0.3]"
        />
        {/* Cinematic vignette */}
        <div className="absolute inset-0 bg-linear-to-t from-[#09090b] via-[#09090b]/50 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-[#09090b] via-transparent to-transparent" />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />
      </div>

      {/* Konten */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-10 pb-16 md:pb-24">
        
        {/* Badge */}
        <div className="flex items-center gap-3 mb-5">
          <span className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.2em] uppercase text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Featured
          </span>
          <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full ${
            item.type === 'MOVIE'
              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
          }`}>
            {item.type === 'MOVIE' ? 'Film' : 'Series'}
          </span>
        </div>

        {/* Judul */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight max-w-3xl leading-[0.92] text-white mb-5">
          {item.title}
        </h1>

        {/* Overview */}
        {item.overview && (
          <p className="text-sm md:text-base text-zinc-400 max-w-xl line-clamp-2 leading-relaxed mb-8">
            {item.overview}
          </p>
        )}

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={href}
            className="group flex items-center gap-3 bg-white text-zinc-950 hover:bg-zinc-100 font-black text-sm px-7 py-3.5 rounded-xl transition-all duration-200 shadow-2xl shadow-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
            </svg>
            Tonton Sekarang
          </Link>

          <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-zinc-500">
              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
            </svg>
            {item.releaseDate ? item.releaseDate.substring(0, 4) : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}