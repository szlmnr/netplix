import { db } from '@/lib/db'

export const commentService = {
  // Ambil semua komentar berdasarkan ID Content induk
  getByContentId: async (contentId: string) => {
    return await db.comment.findMany({
      where: { contentId },
      orderBy: { createdAt: 'desc' }, // Terbaru di paling atas
    })
  },

  // Simpan komentar baru ke database
  create: async (data: { contentId: string; username: string; text: string }) => {
    return await db.comment.create({
      data: {
        contentId: data.contentId,
        username: data.username.trim(),
        text: data.text.trim(),
      },
    })
  }
}