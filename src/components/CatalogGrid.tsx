import Link from 'next/link'

interface CatalogItem {
  id: string
  slug: string
  title: string
  type: 'MOVIE' | 'SERIES'
  posterPath?: string
  releaseDate?: string
}

export default function CatalogGrid({ catalog, hasFilter }: { catalog: CatalogItem[], hasFilter: boolean }) {
  if (!catalog || catalog.length === 0) {
    return (
      <div className="text-center py-28 border border-dashed border-zinc-800/60 rounded-2xl flex flex-col items-center justify-center gap-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-zinc-700"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
        <p className="text-zinc-600 text-sm max-w-xs font-medium">
          Tidak ada konten yang sesuai dengan filter ini.
        </p>
        {hasFilter && (
          <Link href="/" className="text-xs font-bold text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 px-4 py-2 rounded-xl transition-all">
            Reset Filter
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
      {catalog.map((item) => {
        // ✅ FIX: pakai slug bukan id
        const href = item.type === 'MOVIE' ? `/movie/${item.slug}` : `/series/${item.slug}`

        return (
          <Link
            key={item.id}
            href={href}
            className="group relative bg-zinc-900/40 rounded-xl overflow-hidden border border-zinc-900 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Badge */}
            <span className={`absolute top-0 left-0 z-10 font-black tracking-widest uppercase transition-all duration-300
  text-[8px] px-2 py-0.5 rounded-br-lg 
  sm:text-[10px] sm:px-3 sm:py-1 sm:rounded-br-xl 
  backdrop-blur-sm ${item.type === 'MOVIE' ? 'bg-blue-700/80 text-white' : 'bg-red-700/80 text-white'
              }`}
            >
              {item.type === 'MOVIE' ? 'Movie' : 'Series'}
            </span>

            {/* Poster */}
            <div className="aspect-2/3 w-full bg-zinc-900 overflow-hidden">
              {item.posterPath ? (
                <img
                  src={item.posterPath}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px]">No Poster</span>
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Metadata */}
            <div className="p-2 sm:p-3 transition-all">
              <h3 className="font-bold text-[11px] sm:text-xs line-clamp-1 text-zinc-300 group-hover:text-white transition-colors tracking-wide">
                {item.title}
              </h3>
              <p className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5 sm:mt-1 font-semibold tracking-wider">
                {item.releaseDate ? item.releaseDate.substring(0, 4) : '—'}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}