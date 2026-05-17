import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// 1. API UNTUK MENGAMBIL DATA SINGLE KONTEN (GET)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const content = await db.content.findUnique({
    where: { id },
    include: { episodes: { orderBy: { episodeNum: 'asc' } } }
  })

  if (!content) {
    return NextResponse.json({ error: 'Konten tidak ditemukan' }, { status: 404 })
  }

  // Jika tipenya MOVIE, ambil link episode pertama. Jika SERIES, gabungkan semua link episode jadi teks berbaris
  let linksText = ''
  if (content.type === 'MOVIE') {
    linksText = content.episodes[0]?.videoUrl || ''
  } else {
    linksText = content.episodes.map((ep: any) => ep.videoUrl).join('\n')
  }

  return NextResponse.json({
    title: content.title,
    type: content.type,
    linksText
  })
}

// 2. API UNTUK MENYIMPAN PERUBAHAN LINK (PUT)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { linksText } = await request.json()

  const currentContent = await db.content.findUnique({ where: { id } })
  if (!currentContent) {
    return NextResponse.json({ error: 'Konten tidak ditemukan' }, { status: 404 })
  }

  const rawLines = linksText.split('\n')
  const cleanLinks = rawLines
    .map((line: string) => {
        // 1. Potong komentar selain http/https
        let cleaned = line.replace(/(?<!https?:)\/\/.*$/, '')
        
        // 2. Usir karakter gaib \r dan spasi ujung
        cleaned = cleaned.trim()
        
        // 3. Sapu bersih kutip dan koma yang sudah pasti di ujung string
        cleaned = cleaned.replace(/^[",']+/g, '')
        cleaned = cleaned.replace(/[",',;]+$/g, '')
        
        return cleaned.trim()
    })
    .filter((line: string) => line.length > 0)

  if (currentContent.type === 'MOVIE') {
    await db.episode.updateMany({
        where: { contentId: id },
        data: { videoUrl: cleanLinks || '' }
    })
  } else {
    // Hapus episode rusak lama, lalu tulis ulang yang baru dan bersih
    await db.$transaction([
      db.episode.deleteMany({ where: { contentId: id } }),
      db.episode.createMany({
        data: cleanLinks.map((link: string, index: number) => ({
          contentId: id,
          season: 1,
          episodeNum: index + 1,
          videoUrl: link
        }))
      })
    ])
  }

  return NextResponse.json({ success: true })
}