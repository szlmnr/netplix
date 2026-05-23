import { NextResponse, type NextRequest } from 'next/server'
import { auth } from "@/auth" // 🟩 Import auth dari NextAuth config lu

// @ts-ignore
export const proxy = auth(async function proxy(request: NextRequest & { auth: any }) {
  const { pathname } = request.nextUrl
  
  // 🟩 Ambil status login dan role langsung dari NextAuth session
  const isLoggedIn = !!request.auth
  const userRole = request.auth?.user?.role

  // 1. Jika mencoba buka halaman dashboard admin (selain login admin)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // A. Kalau BELUM login sama sekali, lempar ke halaman login admin
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // B. Kalau SUDAH login tapi role-nya BUKAN ADMIN (Rider biasa), tendang balik ke homepage utama!
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 2. Jika sudah login sebagai ADMIN tapi iseng mau buka halaman login lagi, oper balik ke dashboard admin
  if (pathname === '/admin/login' && isLoggedIn && userRole === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
})

// Daftarkan jalur mana saja yang wajib dijaga oleh satpam middleware ini
export const config = {
  matcher: ['/admin/:path*']
}