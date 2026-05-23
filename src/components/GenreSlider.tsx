import { Icon } from '@iconify/react'
import Link from 'next/link'

const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Sci-Fi', 'Thriller']

const GENRE_ICONS: Record<string, React.ReactNode> = {
  'Action': <Icon icon="solar:accessibility-linear" className="w-3.5 h-3.5" />,
  
  'Adventure': <Icon icon="solar:point-on-map-linear" className="w-3.5 h-3.5" />,
  
  'Animation': <Icon icon="solar:star-fall-minimalistic-linear" className="w-3.5 h-3.5" />,
  
  'Comedy': <Icon icon="solar:mask-happly-linear" className="w-3.5 h-3.5" />,
  
  'Drama': <Icon icon="solar:mask-sad-linear" className="w-3.5 h-3.5" />,
  
  'Fantasy': <Icon icon="solar:magic-stick-3-linear" className="w-3.5 h-3.5" />,
  
  'Horror': <Icon icon="solar:ghost-linear" className="w-3.5 h-3.5" />,
  
  'Sci-Fi': <Icon icon="solar:rocket-linear" className="w-3.5 h-3.5" />,
  
  'Thriller': <Icon icon="solar:heart-pulse-linear" className="w-3.5 h-3.5" />}

interface GenreSliderProps {
  currentGenre?: string
  q?: string
  type?: string
}

export default function GenreSlider({ currentGenre, q, type }: GenreSliderProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-600 flex items-center gap-2">
        <Icon icon="solar:card-search-linear" className="w-4 h-4" />
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
              // 🟩 DITAMBAH: flex items-center gap-1.5 biar icon & teks sejajar rapi
              className={`text-xs px-4 py-2 rounded-lg border font-bold transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white text-zinc-950 border-white shadow-lg shadow-white/10'
                  : 'bg-zinc-900/60 text-zinc-500 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {/* 🟩 RENDER ICON KORESPONDEN GENRE */}
              {GENRE_ICONS[genre] || null}
              <span>{genre}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}