import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="absolute top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 py-6">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-[11px] font-black tracking-[0.3em] text-red-500/80 uppercase mb-0.5">
            Now Play
          </span>
          <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
            TokuCorner
          </span>
        </Link>

        {/* Admin Button */}
        <Link
          href="/admin"
          className="group flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4 text-amber-500 transition-transform duration-500 group-hover:rotate-90"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127c.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.754c-.29.218-.44.573-.398.935.008.063.014.125.014.188a1.03 1.03 0 0 1-.014.188c-.042.362.107.717.398.935l1.003.754a1.125 1.125 0 0 1 .261 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.356-.133-.752-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.754c.29-.218.44-.573.398-.935a1.03 1.03 0 0 1-.014-.188c0-.063.006-.124.014-.188c.042-.362-.106-.717-.398-.935l-1.004-.754a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.753.072 1.076-.124.072-.044.146-.087.22-.128c.332-.183.582-.495.644-.869l.214-1.281Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          Panel Kontrol
        </Link>
      </div>
    </nav>
  )
}