import { NextResponse } from 'next/server'
import { createMovieAction, createSeriesBulkAction } from '@/services/video'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contentType, ...data } = body

    if (contentType === 'movie') {
      const result = await createMovieAction({
        tmdbId: data.tmdbId,
        title: data.title,
        videoUrl: data.videoUrl
      })
      return NextResponse.json(result)
    } else {
      const result = await createSeriesBulkAction({
        tmdbId: data.tmdbId,
        title: data.title,
        season: data.season,
        bulkEpisodesText: data.bulkEpisodesText
      })
      return NextResponse.json(result)
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 })
  }
}