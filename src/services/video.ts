'use server' // Wajib di Next.js untuk menandakan fungsi ini berjalan di server secara aman

import { ContentType } from '@prisma/client'

// 1. LOGIKA INPUT MOVIE (FILM TUNGGAL)
export async function createMovieAction(formData: {
  tmdbId: string
  title: string
  videoUrl: string
}) {
  try {
    // Dipindahkan ke dalam fungsi agar tidak memicu crash saat build awal
    const { db } = await import('@/lib/db')

    // Simpan ke tabel utama (Content) sekaligus membuat data di tabel MovieData (Relation)
    const newMovie = await db.content.create({
      data: {
        tmdbId: formData.tmdbId,
        title: formData.title,
        type: ContentType.MOVIE,
        movies: {
          create: {
            videoUrl: formData.videoUrl,
          },
        },
      },
    })
    return { success: true, data: newMovie }
  } catch (error: any) {
    console.error("Gagal menyimpan movie:", error)
    return { success: false, error: error.message || "Gagal menyimpan movie ke database." }
  }
}

// 2. LOGIKA INPUT SERIES + BULK EPISODE
export async function createSeriesBulkAction(formData: {
  tmdbId: string
  title: string
  season: number
  bulkEpisodesText: string // Format input text area: "1|link1\n2|link2\n3|link3"
}) {
  try {
    // Dipindahkan ke dalam fungsi agar tidak memicu crash saat build awal
    const { db } = await import('@/lib/db')

    // A. Buat atau cari dulu konten utamanya di tabel Content
    let content = await db.content.findFirst({
      where: { tmdbId: formData.tmdbId, type: ContentType.SERIES }
    })

    if (!content) {
      content = await db.content.create({
        data: {
          tmdbId: formData.tmdbId,
          title: formData.title,
          type: ContentType.SERIES,
        }
      })
    }

    const lines = formData.bulkEpisodesText.split('\n')

    const episodesData = lines
    .map((line, index) => {
        const cleanLine = line.trim()
        if (!cleanLine) return null // Lewati baris kosong

        // 1. Amankan komentar menggunakan Regex Cerdas (Aman dari https://)
        let targetText = cleanLine.replace(/(?<!https?:)\/\/.*$/, '')

        // 2. USIR KARAKTER GAIB (\r atau spasi berlebih) DULUAN!
        targetText = targetText.trim()

        // 3. SEKARANG REGEX AKAN BEKERJA 100% KARENA KUTIP/KOMA SUDAH PASTI ADA DI UJUNG AKHIR
        targetText = targetText
        .replace(/^[",']+/g, '')   // Hapus semua kutip di depan
        .replace(/[",',;]+$/g, '') // Hapus semua kutip/koma di belakang
        .trim()

        if (!targetText) return null

        // 3. Cek apakah menggunakan format manual "nomor|link"
        if (targetText.includes('|')) {
        const [epNumStr, url] = targetText.split('|')
        if (!epNumStr || !url) return null
        
        // Amankan url barangkali ada sisa spasi
        const cleanUrl = url.trim()
        
        return {
            contentId: content!.id,
            season: Number(formData.season),
            episodeNum: Number(epNumStr.trim()),
            videoUrl: cleanUrl,
        }
        } else {
        // 4. FORMAT OTOMATIS: Jika hanya link biasa, nomor episode berdasarkan urutan baris
        return {
            contentId: content!.id,
            season: Number(formData.season),
            episodeNum: index + 1,
            videoUrl: targetText,
        }
        }
    })
    .filter(Boolean) as any[]

    if (episodesData.length === 0) {
      throw new Error("Gagal membaca link. Pastikan setiap baris berisi link streaming yang valid.")
    }

    // C. Simpan semua episode sekaligus ke database Postgres
    await db.$transaction(
      episodesData.map((ep) =>
        db.episode.upsert({
          where: {
            contentId_season_episodeNum: {
              contentId: ep.contentId,
              season: ep.season,
              episodeNum: ep.episodeNum,
            },
          },
          update: { videoUrl: ep.videoUrl }, // Jika eps sudah ada, ganti linknya saja
          create: ep, // Jika belum ada, bikin baru
        })
      )
    )

    return { success: true, message: `${episodesData.length} Episode berhasil dimasukkan!` }
  } catch (error: any) {
    console.error("Gagal melakukan bulk input series:", error)
    return { success: false, error: error.message || "Gagal melakukan bulk input." }
  }
}