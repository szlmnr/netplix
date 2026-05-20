import Link from 'next/link'

const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Sci-Fi', 'Thriller']

const GENRE_ICONS: Record<string, React.ReactNode> = {
  'Action': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" /></svg>,
  
  'Adventure': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1 1 15 0Z" /></svg>,
  
  'Animation': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122l9.373-9.374a2.437 2.437 0 113.447 3.447l-9.374 9.373a4.5 4.5 0 01-1.879 1.153l-2.84.71a.75.75 0 01-.922-.921l.71-2.84a4.5 4.5 0 011.153-1.88z" /><path strokeLinecap="round" strokeLinejoin="round" d="M14.566 7.71l3.724 3.725M4.236 3.236a.75.75 0 011.06 0l2.25 2.25a.75.75 0 01-1.06 1.06l-2.25-2.25a.75.75 0 010-1.06zM2.25 11.25a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM3.236 18.704a.75.75 0 010-1.06l2.25-2.25a.75.75 0 111.06 1.06l-2.25 2.25a.75.75 0 01-1.06 0z" /></svg>,
  
  'Comedy': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm6 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Z" /></svg>,
  
  'Drama': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12 15a4.486 4.486 0 0 0-3.182 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm6 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Z" /></svg>,
  
  'Fantasy': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.473a9.042 9.042 0 0 0-8.091-.623ZM19.5 12l-2.253 1.282L16 15.535l-1.247-2.253L12.5 12l2.253-1.247L16 8.5l1.247 2.253L19.5 12Z" /></svg>,
  
  'Horror': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-4.142 0-7.5 3.358-7.5 7.5 0 2.203.953 4.184 2.474 5.546.126.113.197.273.197.442v2.512c0 .828.672 1.5 1.5 1.5h6.75c.828 0 1.5-.672 1.5-1.5v-2.512c0-.169.071-.329.197-.442A7.478 7.478 0 0 0 19.5 9.75c0-4.142-3.358-7.5-7.5-7.5Zm-2.625 7.5a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm5.25 0a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" /></svg>,
  
  'Sci-Fi': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 0M12 11.25v2.25m3.75-5.25c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-6.75 0c0 .414-.168.75-.375.75S8.25 9.164 8.25 8.75s.168-.75.375-.75.375.336.375.75zM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L3 21m15-3l3 3M9.75 15.75h4.5v1.5h-4.5v-1.5z" /></svg>,
  
  'Thriller': <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h3.75m-3.75 0v-3.75M9 9.75l8.25-8.25m0 0l3.75 3.75-8.25 8.25M15 6.75l2.25 2.25" /></svg>}

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