import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()

  // Ambil password rahasia dari file .env.local kamu nanti
  const secretPassword = process.env.ADMIN_PASSWORD || 'kamenrider123'

  if (password === secretPassword) {
    const response = NextResponse.json({ success: true })
    
    // Set cookie status login yang berlaku selama 7 hari
    response.cookies.set('admin_token', 'authenticated_true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/'
    })

    return response
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}