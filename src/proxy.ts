import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  const { pathname } = request.nextUrl

  // 1. Jika mencoba buka halaman admin (selain halaman login) tapi belum punya token
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // 2. Jika sudah login tapi iseng mau buka halaman login lagi, oper balik ke dashboard admin
  if (pathname === '/admin/login' && token) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

// Daftarkan jalur mana saja yang wajib dijaga oleh satpam middleware ini
export const config = {
  matcher: ['/admin/:path*']
}