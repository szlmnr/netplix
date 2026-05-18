import Link from 'next/link'

const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Sci-Fi', 'Thriller']

interface GenreSliderProps {
  currentGenre?: string
  q?: string
  type?: string
}

export default function GenreSlider({ currentGenre, q, type }: GenreSliderProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-600 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-zinc-600">
          <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" clipRule="evenodd" />
        </svg>
        Jelajahi Genre
      </h2>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {GENRES.map((genre) => {
          const isActive = currentGenre === genre
          let url = `/?genre=${genre}`
          if (q) url += `&q=${q}`
          if (type) url += `&type=${type}`
          if (isActive) {
            url = '/'
            if (q && type) url = `/?q=${q}&type=${type}`
            else if (q) url = `/?q=${q}`
            else if (type) url = `/?type=${type}`
          }

          return (
            <Link
              key={genre}
              href={url}
              className={`text-xs px-4 py-2 rounded-lg border font-bold transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-white text-zinc-950 border-white shadow-lg shadow-white/10'
                  : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {genre}
            </Link>
          )
        })}
      </div>
    </div>
  )
}