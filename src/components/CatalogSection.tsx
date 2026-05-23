'use client'

import { useState } from 'react'
import Link from 'next/link'
import MovieCard from './MovieCard'
import AuthModal from './AuthModal'

interface CatalogItem {
  id: string
  slug: string
  title: string
  type: 'MOVIE' | 'SERIES'
  posterPath?: string
  releaseDate?: string
}

interface CatalogSectionProps {
  catalog: CatalogItem[]
  hasFilter: boolean
  isLoggedIn: boolean
  watchlistIds: string[]
}

export default function CatalogSection({
  catalog,
  hasFilter,
  isLoggedIn,
  watchlistIds,
}: CatalogSectionProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <>
      {!catalog || catalog.length === 0 ? (
        <div className="text-center py-28 border border-dashed border-zinc-800/60 rounded-2xl flex flex-col items-center justify-center gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-zinc-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <p className="text-zinc-600 text-sm max-w-xs font-medium">
            Tidak ada konten yang sesuai dengan filter ini.
          </p>
          {hasFilter && (
            <Link href="/" className="text-xs font-bold text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 px-4 py-2 rounded-xl transition-all">
              Reset Filter
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
          {catalog.map((item) => (
            <MovieCard
              key={item.id}
              item={item}
              isLoggedIn={isLoggedIn}
              initialIsBookmarked={watchlistIds.includes(item.id)}
              onAuthRequired={() => setIsAuthModalOpen(true)}
            />
          ))}
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  )
}