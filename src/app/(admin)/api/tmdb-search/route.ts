import { NextResponse } from 'next/server'
import { tmdb } from '@/lib/tmdb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query    = searchParams.get('query')
  const type     = searchParams.get('type') as 'movie' | 'tv'
  const language = searchParams.get('language') || 'id-ID' // ✅ ambil dari request

  if (!query) return NextResponse.json({ error: 'Query kosong' }, { status: 400 })

  try {
    const results = await tmdb.searchContent(query, type, language) // ✅ terusin
    return NextResponse.json(results)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}