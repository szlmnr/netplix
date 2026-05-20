import { db } from '@/lib/db'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import GenreSlider from '@/components/GenreSlider'
import CatalogGrid from '@/components/CatalogGrid'

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
    id: c.id,
    slug: c.slug,
    title: c.title,
    type: c.type as 'MOVIE' | 'SERIES',
    posterPath: c.posterPath ?? undefined,
    backdropPath: c.backdropPath ?? undefined,
    releaseDate: c.releaseDate ?? undefined,
    overview: c.overview ?? undefined,
  }))

  const heroItem = catalog.length > 0 ? catalog[0] : null
  const showHero = heroItem && !q && !type && !currentGenre
  const hasFilter = !!(q || type || currentGenre)

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-red-600 selection:text-white overflow-x-hidden">
      <Navbar />

      {showHero ? <HeroSection item={heroItem} /> : <div className="pt-28" />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 space-y-10 relative z-20 pb-20 mt-8">

        {/* FILTER BAR */}
        

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
          <p>2026 TokuCorner</p>
          <div className="flex items-center text-zinc-500 font-bold gap-1.5">
            {/* <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> */}
            TokuCorner adalah situs streaming Tokusatsu subtitle Indonesia yang fokus menyajikan berbagai serial terbaru untuk komunitas di Indonesia.
Perlu diketahui, semua video di sini diputar melalui sistem embed. Kami tidak menyimpan file video di server sendiri, melainkan hanya menghubungkan dari sumber luar.

Tayangan yang ada merupakan hasil kerja keras para Fansub yang sudah menerjemahkan setiap episodenya. Sebagai bentuk apresiasi, kami selalu mencantumkan sumber asli di tiap postingan supaya karya teman-teman Fansub tetap dihargai.
          </div>
        </div>
      </footer>
    </div>
  )
}