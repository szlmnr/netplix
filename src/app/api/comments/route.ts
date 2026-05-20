import { NextResponse } from 'next/server'
import { commentService } from '@/services/comment'

// 📥 GET: /api/comments?contentId=xxxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const contentId = searchParams.get('contentId')

    if (!contentId) {
      return NextResponse.json({ success: false, error: 'Content ID wajib diisi' }, { status: 400 })
    }

    const comments = await commentService.getByContentId(contentId)
    return NextResponse.json({ success: true, data: comments })
  } catch (error: any) {
    console.error('[GET COMMENTS ERROR]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// 📤 POST: /api/comments
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contentId, username, text } = body

    if (!contentId || !username || !text) {
      return NextResponse.json({ success: false, error: 'Data input tidak lengkap' }, { status: 400 })
    }

    const newComment = await commentService.create({ contentId, username, text })
    return NextResponse.json({ success: true, data: newComment })
  } catch (error: any) {
    console.error('[POST COMMENT ERROR]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}