import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="absolute top-0 inset-x-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10 py-6">
        {/* Logo */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-[11px] font-black tracking-[0.3em] text-red-500/80 uppercase mb-0.5">
            Premium Stream
          </span>
          <span className="text-2xl md:text-3xl font-black tracking-tighter text-white">
            NETPLIX
          </span>
        </Link>

        {/* Admin Button */}
        <Link
          href="/admin"
          className="group flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
            <path fillRule="evenodd" d="M11.078 2.25c-.288 0-.546.17-.66.435L9.141 5.74a4.5 4.5 0 0 0-1.152.665L4.99 5.175a.75.75 0 0 0-.913.254l-1.5 2.598a.75.75 0 0 0 .19.99l2.481 1.716a4.468 4.468 0 0 0 0 1.322l-2.481 1.716a.75.75 0 0 0-.19.992l1.5 2.597a.75.75 0 0 0 .914.254l3-.122c.356.262.743.486 1.152.665l1.277 3.055c.114.266.372.435.66.435h3c.288 0 .546-.17.66-.435l1.277-3.055a4.506 4.506 0 0 0 1.152-.665l3 .122a.75.75 0 0 0 .913-.254l1.5-2.597a.75.75 0 0 0-.19-.992l-2.482-1.716a4.466 4.466 0 0 0 0-1.322l2.482-1.716a.75.75 0 0 0 .19-.99l-1.5-2.598a.75.75 0 0 0-.914-.254l-3 .122a4.456 4.456 0 0 0-1.152-.665L13.922 2.685a.75.75 0 0 0-.66-.435h-3ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
          </svg>
          Panel Kontrol
        </Link>
      </div>
    </nav>
  )
}