"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavbarProps {
  type?: string
  q?: string
  currentGenre?: string
  catalogLength?: number // 🟩 Ditambahkan untuk menampung jumlah 'Semua' film
}

export default function Navbar({ type, q, currentGenre, catalogLength = 0 }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  // 🔔 MENDETEKSI SCROLL USER
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 📦 DATA 3 TOMBOL FILTER UTAMA (KODE UTAMA LU)
  const filters = [
    {
      label: 'Semua',
      href: currentGenre ? `/?genre=${currentGenre}` : '/',
      active: !type,
      count: catalogLength,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
        </svg>
      )
    },
    {
      label: 'Film',
      href: q ? `/?q=${q}&type=MOVIE` : '/?type=MOVIE',
      active: type === 'MOVIE',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5M3.75 15h16.5M9 3.75v16.5M15 3.75v16.5" />
        </svg>
      )
    },
    {
      label: 'Series',
      href: q ? `/?q=${q}&type=SERIES` : '/?type=SERIES',
      active: type === 'SERIES',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m17 2-5 4-5-4" />
        </svg>
      )
    },
  ]

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Reset menu otomatis kalau user scroll balik ke atas
  useEffect(() => {
    if (!isScrolled) setIsMenuOpen(false)
  }, [isScrolled])

  return (
    <nav className={`w-full transition-all duration-500 z-50 ${isScrolled
      ? 'fixed top-4 inset-x-0 px-4 flex justify-center'
      : 'absolute top-0 inset-x-0 px-4 sm:px-6 md:px-10'
      }`}>

      {/* KAPSUL CONTAINER */}
      <div className={`w-full max-w-7xl mx-auto transition-all duration-500 flex flex-col gap-4 ${isScrolled
        ? 'bg-zinc-950/75 border border-white/10 backdrop-blur-xl rounded-2xl px-3 py-3 shadow-2xl shadow-black/80 lg:max-w-5xl'
        : 'py-6 border-b border-transparent'
        }`}>

        {/* ROW UTAMA NAVBAR */}
        <div className="flex justify-between items-center w-full gap-4">

          {/* LOGO */}
          <Link href="/" className="flex flex-col leading-none shrink-0">
            <span className={`text-[9px] md:text-[11px] font-black tracking-[0.3em] text-red-500/80 uppercase mb-0.5 transition-all ${isScrolled ? 'hidden' : 'block'
              }`}>
              Now Play
            </span>
            <span className={`font-black uppercase tracking-tighter text-white transition-all ${isScrolled ? 'text-xs md:text-xl' : 'text-sm md:text-2xl'
              }`}>
              TokuCorner
            </span>
          </Link>

          {/* 📦 KONTEN TENGAH-KANAN: SEARCH & FILTERS DALAM 1 ROW */}
          <div className="flex items-center gap-4 flex-1 justify-end md:justify-center max-w-2xl ml-auto">

            {/* 🔍 SEARCH COMPONENT (Selalu 1 Row) */}
            <div className={`transition-all duration-300 w-full ${isScrolled ? 'max-w-[180px] lg:max-w-xs' : 'max-w-xs hidden md:block'}`}>
              <form action="/" method="GET" className="w-full">
                {type && <input type="hidden" name="type" value={type} />}
                {currentGenre && <input type="hidden" name="genre" value={currentGenre} />}
                <div className="relative w-full group">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 group-hover:text-zinc-300 group-focus-within:text-blue-400"><path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" /></svg>
                  <input type="text" name="q" defaultValue={q || ''} suppressHydrationWarning placeholder="Cari judul..." className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 font-medium transition-all duration-300 placeholder:text-zinc-400 focus:outline-none hover:bg-zinc-900/80 hover:border-zinc-700 focus:bg-zinc-900 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/30" />
                </div>
              </form>
            </div>

            {/* ⚡ FILTER CATALOG BUTTONS (Selalu eksis di samping search bar, stylenya berubah sesuai scroll) */}
            <div className="hidden sm:flex items-center gap-1.5 md:gap-2">
              {filters.map(({ label, href, active, count, icon }) => (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 shrink-0 ${active
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-500/5 px-3 py-1.5 rounded-lg'
                    : isScrolled
                      ? 'bg-white/5 text-zinc-400 border border-white/5 hover:text-zinc-200 px-3 py-1.5 rounded-lg' // Style pas digulung
                      : 'bg-transparent text-zinc-500 border border-transparent hover:text-zinc-300 px-2 py-1.5' // Polosan tanpa bg/blur/border pas di atas
                    }`}
                >
                  <span className={active ? 'text-blue-400' : 'text-zinc-600 transition-colors'}>{icon}</span>
                  <span>{label}</span>

                  {/* Counter number mini (hanya tampil kalau ada angkanya & tidak nol) */}
                  {count !== undefined && count > 0 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black transition-all ${active
                      ? 'bg-blue-500/20 text-blue-300'
                      : isScrolled ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-900 text-zinc-600'
                      }`}>
                      {count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* ADMIN CONTROL BUTTON */}
          {/* Desktop: Link biasa | Mobile (Saat Scrolled): Berubah fungsi jadi Button Trigger Dropdown */}
          {isScrolled ? (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`group flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-bold transition-all duration-300 rounded-xl p-2 md:px-3 md:py-1.5 text-[10px] ${isMenuOpen ? 'bg-white/10 border-white/30 text-white' : ''
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                className={`h-4 w-4 text-amber-500 transition-transform duration-500 ${isMenuOpen ? 'rotate-180 scale-110' : 'group-hover:rotate-90'}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127c.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.754c-.29.218-.44.573-.398.935.008.063.014.125.014.188a1.03 1.03 0 0 1-.014.188c-.042.362.107.717.398.935l1.003.754a1.125 1.125 0 0 1 .261 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.356-.133-.752-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.754c.29-.218.44-.573.398-.935a1.03 1.03 0 0 1-.014-.188c0-.063.006-.124.014-.188c.042-.362-.106-.717-.398-.935l-1.004-.754a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.753.072 1.076-.124.072-.044.146-.087.22-.128c.332-.183.582-.495.644-.869l.214-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span className="hidden md:inline">Panel Kontrol</span>
            </button>
          ) : (
            <Link
              href="/admin"
              className="group flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-bold transition-all duration-300 rounded-xl px-3.5 py-2 md:px-5 md:py-2.5 text-[11px] md:text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-amber-500 transition-transform duration-500 group-hover:rotate-90">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127c.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.754c-.29.218-.44.573-.398.935.008.063.014.125.014.188a1.03 1.03 0 0 1-.014.188c-.042.362.107.717.398.935l1.003.754a1.125 1.125 0 0 1 .261 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.356-.133-.752-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.754c.29-.218.44-.573.398-.935a1.03 1.03 0 0 1-.014-.188c0-.063.006-.124.014-.188c.042-.362-.106-.717-.398-.935l-1.004-.754a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.753.072 1.076-.124.072-.044.146-.087.22-.128c.332-.183.582-.495.644-.869l.214-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span>Panel Kontrol</span>
            </Link>
          )}
        </div>

        {/* 📱 SEARCH BOX MOBILE (Muncul hanya saat di posisi paling atas) */}
        <div className={`w-full md:hidden transition-all duration-300 ${isScrolled ? 'hidden' : 'block'}`}>
          <form action="/" method="GET" className="w-full flex gap-2">
            {type && <input type="hidden" name="type" value={type} />}
            {currentGenre && <input type="hidden" name="genre" value={currentGenre} />}
            <div className="relative w-full group">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 group-hover:text-zinc-300 group-focus-within:text-blue-400"><path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" /></svg>
                  <input type="text" name="q" defaultValue={q || ''} suppressHydrationWarning placeholder="Cari judul..." className="w-full bg-zinc-900/50 border border-zinc-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 font-medium transition-all duration-300 placeholder:text-zinc-400 focus:outline-none hover:bg-zinc-900/80 hover:border-zinc-700 focus:bg-zinc-950 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/30" />
                </div>
          </form>
        </div>

        {/* 📱 🟩 MOBILE STICKY DROPDOWN MENU
            Akan spawn vertikal tepat di bawah pill ketika menu di-klik */}
        {isScrolled && isMenuOpen && (
          <div className="md:hidden flex flex-col gap-1.5 pt-2 border-t border-white/5 animate-fade-in">

            {/* 1. Panel Admin di paling atas sesuai plan */}
            <Link
              href="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-xs uppercase tracking-wider"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                className={`h-4 w-4 transition-transform duration-500 ${isMenuOpen ? 'rotate-180 scale-110' : 'group-hover:rotate-90'}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127c.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.754c-.29.218-.44.573-.398.935.008.063.014.125.014.188a1.03 1.03 0 0 1-.014.188c-.042.362.107.717.398.935l1.003.754a1.125 1.125 0 0 1 .261 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.356-.133-.752-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.754c.29-.218.44-.573.398-.935a1.03 1.03 0 0 1-.014-.188c0-.063.006-.124.014-.188c.042-.362-.106-.717-.398-.935l-1.004-.754a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.753.072 1.076-.124.072-.044.146-.087.22-.128c.332-.183.582-.495.644-.869l.214-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <span>Panel Admin</span>
            </Link>

            {/* 2. Daftar Filter (Semua, Film, Series) disusun vertikal */}
            {filters.map(({ label, href, active, count, icon }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-between justify-between items-center px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${active
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-white/5 text-zinc-400 border-white/5'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={active ? 'text-blue-400' : 'text-zinc-500'}>{icon}</span>
                  <span>{label}</span>
                </div>
                {count !== undefined && count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black ${active ? 'bg-blue-500/20 text-blue-300' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                    {count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

      </div>
    </nav>
  )
}