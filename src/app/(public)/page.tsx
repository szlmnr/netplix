import { db } from '@/lib/db'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import GenreSlider from '@/components/GenreSlider'
import CatalogGrid from '@/components/CatalogGrid'
import Link from 'next/link'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; genre?: string }>
}) {
  const { q, type, genre: currentGenre } = await searchParams

  // ✅ Fetch langsung dari DB — poster sudah tersimpan, tidak perlu hit TMDB
  const contents = await db.content.findMany({
    where: {
      ...(type ? { type: type as any } : {}),
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  const catalog = contents.map((c) => ({
    id:          c.id,
    slug:        c.slug,
    title:       c.title,
    type:        c.type as 'MOVIE' | 'SERIES',
    posterPath:  c.posterPath  ?? undefined,
    backdropPath: c.backdropPath ?? undefined,
    releaseDate: c.releaseDate ?? undefined,
    overview:    c.overview    ?? undefined,
  }))

  const heroItem = catalog.length > 0 ? catalog[0] : null
  const showHero = heroItem && !q && !type && !currentGenre
  const hasFilter = !!(q || type || currentGenre)

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-red-600 selection:text-white overflow-x-hidden">
      <Navbar />

      {showHero ? <HeroSection item={heroItem} /> : <div className="pt-28" />}

      <main className="max-w-7xl mx-auto px-6 md:px-10 space-y-10 relative z-20 pb-20 mt-8">

        {/* FILTER BAR */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-zinc-900/50 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/60">
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { label: 'Semua', href: '/', active: !type, count: catalog.length },
              { label: 'Film',   href: q ? `/?q=${q}&type=MOVIE`   : '/?type=MOVIE',   active: type === 'MOVIE'  },
              { label: 'Series', href: q ? `/?q=${q}&type=SERIES`  : '/?type=SERIES',  active: type === 'SERIES' },
            ].map(({ label, href, active, count }) => (
              <Link key={label} href={href}
                className={`flex items-center gap-1.5 text-xs px-4 py-2.5 rounded-xl font-black uppercase tracking-wider border transition-all shrink-0 ${
                  active ? 'bg-white text-zinc-950 border-white shadow-lg' : 'bg-transparent text-zinc-500 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {label}
                {count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${active ? 'bg-zinc-200 text-zinc-800' : 'bg-zinc-800 text-zinc-500'}`}>
                    {count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <form action="/" method="GET" className="w-full lg:w-80 flex gap-2">
            {type && <input type="hidden" name="type" value={type} />}
            {currentGenre && <input type="hidden" name="genre" value={currentGenre} />}
            <div className="relative w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2">
                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
              </svg>
              <input type="text" name="q" defaultValue={q || ''} suppressHydrationWarning
                placeholder="Cari judul film atau series..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-zinc-600 text-zinc-300 placeholder:text-zinc-700 transition"
              />
            </div>
            <button type="submit" suppressHydrationWarning
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0">
              Cari
            </button>
          </form>
        </div>

        <GenreSlider currentGenre={currentGenre} q={q} type={type} />

        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-3">
              <span className="w-0.5 h-5 bg-red-600 rounded-full" />
              {hasFilter ? 'Hasil Filter' : 'Semua Konten'}
            </h2>
            <span className="text-[11px] font-bold text-zinc-600 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
              {catalog.length} Judul
            </span>
          </div>
          <CatalogGrid catalog={catalog} hasFilter={hasFilter} />
        </div>
      </main>

      <footer className="border-t border-zinc-900 py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-3 text-zinc-700 text-xs font-medium">
          <p>© 2026 Netplix Stream. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Serverless Infrastructure Active
          </div>
        </div>
      </footer>
    </div>
  )
}