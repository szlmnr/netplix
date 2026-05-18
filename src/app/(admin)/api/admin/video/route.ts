'use server'

import { NextResponse } from 'next/server'
import { ContentType } from '@prisma/client'
import slugify from 'slugify'

// Helper: Generate slug dengan fallback ke originalTitle jika title menghasilkan slug kosong
function generateSlug(title: string, originalTitle: string | null, year: string): string {
  let base = slugify(title, { lower: true, strict: true })

  // Jika title kanji/arab/dll → slug kosong, fallback ke original title
  if (!base && originalTitle) {
    base = slugify(originalTitle, { lower: true, strict: true })
  }

  // Kalau masih kosong, pakai 'content'
  if (!base) base = 'content'

  // ✅ Tambah -sub-indonesia di akhir
  return `${base}-${year}-sub-indonesia`
}

export async function POST(request: Request) {
  try {
    const { db } = await import('@/lib/db')
    const { tmdb } = await import('@/lib/tmdb')
    const body = await request.json()
    const { contentType, tmdbId, title, year, videoUrl, season, bulkEpisodesText } = body

    if (contentType === 'movie') {
      let meta: any = {}
      let originalTitle = null

      try {
        const details = await tmdb.getMovieDetails(tmdbId)
        originalTitle = details.originalTitle
        meta = {
          posterPath:   details.posterPath,
          backdropPath: details.backdropPath,
          releaseDate:  details.releaseDate,
          overview:     details.overview,
          genres:       details.genres || [],
        }
      } catch { /* Lanjut tanpa metadata jika TMDB down */ }

      const slug = generateSlug(title, originalTitle, year)

      // ✅ Upsert: update jika sudah ada, create jika belum
      const existing = await db.content.findFirst({ where: { tmdbId, type: ContentType.MOVIE } })

      let movie
      if (existing) {
        movie = await db.content.update({
          where: { id: existing.id },
          data: {
            ...meta,
            movies: { update: { data: { videoUrl } } }
          }
        })
      } else {
        movie = await db.content.create({
          data: {
            tmdbId, title, slug,
            type: ContentType.MOVIE,
            ...meta,
            movies: { create: { videoUrl } },
          }
        })
      }

      return NextResponse.json({ success: true, data: movie })

    } else {
      // SERIES
      let meta: any = {}
      let originalTitle = null

      try {
        const details = await tmdb.getSeriesDetails(tmdbId)
        originalTitle = details.originalTitle
        meta = {
          posterPath:   details.posterPath,
          backdropPath: details.backdropPath,
          releaseDate:  details.firstAirDate,
          overview:     details.overview,
          genres:       details.genres || [],
        }
      } catch { /* Lanjut tanpa metadata jika TMDB down */ }

      const slug = generateSlug(title, originalTitle, year)

      let content = await db.content.findFirst({
        where: { tmdbId, type: ContentType.SERIES }
      })

      if (!content) {
        content = await db.content.create({
          data: { tmdbId, title, slug, type: ContentType.SERIES, ...meta }
        })
      } else {
        // ✅ Update metadata jika konten sudah ada (fix overview kosong)
        content = await db.content.update({
          where: { id: content.id },
          data: { ...meta }
        })
      }

      // Parse bulk episodes
      const lines = (bulkEpisodesText as string).split('\n')
      const episodesData = lines
        .map((line: string, index: number) => {
          let text = line.trim()
          if (!text) return null
          text = text.replace(/(?<!https?:)\/\/.*$/, '').trim()
          text = text.replace(/^[",']+/g, '').replace(/[",',;]+$/g, '').trim()
          if (!text) return null

          if (text.includes('|')) {
            const [epNumStr, url] = text.split('|')
            if (!epNumStr || !url) return null
            return {
              contentId:  content!.id,
              season:     Number(season),
              episodeNum: Number(epNumStr.trim()),
              videoUrl:   url.trim(),
            }
          }
          return {
            contentId:  content!.id,
            season:     Number(season),
            episodeNum: index + 1,
            videoUrl:   text,
          }
        })
        .filter(Boolean) as any[]

      if (episodesData.length === 0) {
        throw new Error("Tidak ada link valid yang terbaca.")
      }

      for (const ep of episodesData) {
        await db.episode.upsert({
          where: {
            contentId_season_episodeNum: {
              contentId:  ep.contentId,
              season:     ep.season,
              episodeNum: ep.episodeNum,
            }
          },
          update: { videoUrl: ep.videoUrl },
          create: ep,
        })
      }

      return NextResponse.json({ success: true, message: `${episodesData.length} Episode berhasil dimasukkan!` })
    }

  } catch (error: any) {
    console.error('[video route error]', error)
    return NextResponse.json({ success: false, error: error.message || 'Server Error' }, { status: 500 })
  }
}