import { db } from '@/lib/db'
import { tmdb } from '@/lib/tmdb'
import Link from 'next/link'

// Fungsi mengambil data katalog dengan dukungan Filter & Search dari Postgres
async function getCatalog(search?: string, type?: string) {
  // Buat kondisi filter dinamis berdasarkan input user
  const whereClause: any = {}
  
  if (type === 'MOVIE' || type === 'SERIES') {
    whereClause.type = type
  }
  
  if (search) {
    whereClause.title = {
      contains: search,       // Mencari teks yang mirip
      mode: 'insensitive'     // Mengabaikan huruf besar/kecil (Caps Lock aman!)
    }
  }

  const contents = await db.content.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  })

  const catalogData = await Promise.all(
    contents.map(async (item) => {
      try {
        if (item.type === 'MOVIE') {
          const details = await tmdb.getMovieDetails(item.tmdbId)
          return {
            id: item.id,
            type: item.type,
            title: details.title,
            posterPath: details.posterPath,
            releaseDate: details.releaseDate
          }
        } else {
          const details = await tmdb.getSeriesDetails(item.tmdbId)
          return {
            id: item.id,
            type: item.type,
            title: details.title,
            posterPath: details.posterPath,
            releaseDate: details.firstAirDate
          }
        }
      } catch (err) {
        return {
          id: item.id,
          type: item.type,
          title: item.title,
          posterPath: null,
          releaseDate: '-'
        }
      }
    })
  )

  return catalogData
}

// Next.js App Router otomatis menyediakan searchParams di halaman Server
export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const { q, type } = await searchParams
  const catalog = await getCatalog(q, type)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-8">
      {/* 1. HEADER */}
      <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-linear-to-r from-red-500 to-amber-500">
            NETPLIX STREAM
          </h1>
          <p className="text-sm text-gray-400 mt-1">Nonton film & series lokal kualitas mantap</p>
        </div>
        <Link 
          href="/admin" 
          className="bg-gray-900 hover:bg-gray-800 text-xs font-semibold px-4 py-2.5 rounded-lg border border-gray-800 transition flex items-center gap-1.5"
        >
          ⚙️ Panel Admin
        </Link>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        
        {/* 2. AREA KONTROL: SEARCH BAR & FILTER BUTTONS */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-900/40 p-4 rounded-xl border border-gray-800/60">
          
          {/* Form Pencarian (Server-side handling lewat URL query) */}
          <form action="/" method="GET" className="w-full md:w-80 flex gap-2">
            {/* Pertahankan status filter type jika sedang aktif */}
            {type && <input type="hidden" name="type" value={type} />}
            <input 
              type="text" 
              name="q"
              defaultValue={q || ''}
              placeholder="Cari judul film atau anime..."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-gray-200"
            />
            <button type="submit" className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-4 py-2 rounded-lg text-xs font-semibold transition">
              Cari
            </button>
          </form>

          {/* Tombol Filter Kategori */}
          <div className="flex gap-2 self-start md:self-auto">
            <Link 
              href={q ? `/?q=${q}` : '/'}
              className={`text-xs px-4 py-2 rounded-lg font-bold border transition ${!type ? 'bg-amber-500 text-gray-950 border-amber-500' : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-gray-200'}`}
            >
              🍿 Semua ({catalog.length})
            </Link>
            <Link 
              href={q ? `/?q=${q}&type=MOVIE` : '/?type=MOVIE'}
              className={`text-xs px-4 py-2 rounded-lg font-bold border transition ${type === 'MOVIE' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-gray-200'}`}
            >
              🎬 Movies
            </Link>
            <Link 
              href={q ? `/?q=${q}&type=SERIES` : '/?type=SERIES'}
              className={`text-xs px-4 py-2 rounded-lg font-bold border transition ${type === 'SERIES' ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-950 text-gray-400 border-gray-800 hover:text-gray-200'}`}
            >
              📺 Series
            </Link>
          </div>
        </div>

        {/* 3. GRID LIST FILM */}
        <div>
          {catalog.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-gray-900 rounded-2xl bg-gray-900/10">
              <p className="text-gray-500 text-sm">Tidak ada film atau series yang cocok dengan pencarianmu.</p>
              {(q || type) && (
                <Link href="/" className="text-amber-500 hover:underline text-xs mt-2 inline-block">
                  Reset Filter $\rightarrow$
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {catalog.map((item) => (
                <Link 
                  key={item.id} 
                  href={item.type === 'MOVIE' ? `/movie/${item.id}` : `/series/${item.id}`}
                  className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition transform hover:-translate-y-1 shadow-md shadow-black/50"
                >
                  <span className={`absolute top-2 left-2 z-10 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow ${item.type === 'MOVIE' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                    {item.type}
                  </span>

                  <div className="aspect-2/3 w-full bg-gray-800 relative">
                    {item.posterPath ? (
                      <img 
                        src={item.posterPath} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Poster</div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-amber-400 transition">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1">
                        {item.releaseDate ? item.releaseDate.replace(/[-]/g, '').substring(0, 4) : '-'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}