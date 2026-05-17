import { db } from '@/lib/db'
import { tmdb } from '@/lib/tmdb'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import DeleteButton from '@/components/DeleteButton'
import { Content } from '@prisma/client'

// Fungsi mengambil seluruh konten untuk di-manage
async function getManageList() {
  const contents = await db.content.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const fullData = await Promise.all(
    contents.map(async (item: Content) => {
      try {
        const details = item.type === 'MOVIE'
          ? await tmdb.getMovieDetails(item.tmdbId)
          : await tmdb.getSeriesDetails(item.tmdbId)
        return {
          id: item.id,
          title: details.title,
          type: item.type,
          tmdbId: item.tmdbId,
        }
      } catch {
        return {
          id: item.id,
          title: item.title,
          type: item.type,
          tmdbId: item.tmdbId,
        }
      }
    })
  )

  return fullData
}

export default async function ManageContentPage() {
  const list = await getManageList()

  // Server Action untuk menghapus konten langsung dari web UI
  async function deleteContent(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    if (!id) return

    // Hapus di Postgres (Prisma akan otomatis menghapus episode/movie terkait jika relasinya CASCADE)
    await db.content.delete({
      where: { id }
    })

    // Segarkan data halaman agar list ter-update otomatis
    revalidatePath('/admin/manage')
    revalidatePath('/')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-8">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-8 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 to-amber-500">
            🛠️ Kelola Koleksi Video
          </h1>
          <p className="text-xs text-gray-400 mt-1">Update link streaming atau hapus film yang sudah jadul</p>
        </div>
        <Link 
          href="/admin" 
          className="bg-gray-900 hover:bg-gray-800 text-xs font-semibold px-4 py-2 rounded-lg border border-gray-800 transition"
        >
          ← Dashboard
        </Link>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 text-[11px] uppercase tracking-wider">
                <th className="p-4">Judul Konten</th>
                <th className="p-4">Tipe</th>
                <th className="p-4">TMDB ID</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500 text-xs">
                    Belum ada film yang kamu simpan di database.
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-800/30 transition">
                    <td className="p-4 font-semibold text-gray-200">{item.title}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${item.type === 'MOVIE' ? 'bg-blue-950 text-blue-400' : 'bg-purple-950 text-purple-400'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500 font-mono">{item.tmdbId}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        {/* Tombol Edit (Akan kita buat tujuannya nanti) */}
                        <Link 
                          href={`/admin/manage/edit/${item.id}`}
                          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-[11px] font-bold px-3 py-1.5 rounded-md text-amber-400 transition"
                        >
                          ✏️ Edit Link
                        </Link>

                        <DeleteButton id={item.id} deleteAction={deleteContent} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}