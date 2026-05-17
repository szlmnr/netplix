import { NextResponse } from 'next/server'
import { tmdb } from '@/lib/tmdb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const type = searchParams.get('type') as 'movie' | 'tv'

  if (!query) {
    return NextResponse.json({ error: 'Query pencarian kosong' }, { status: 400 })
  }

  try {
    // Memanggil helper lib/tmdb.ts yang sudah kita buat sebelumnya secara aman di server
    const results = await tmdb.searchContent(query, type)
    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}