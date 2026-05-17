import { db } from '@/lib/db'
import { tmdb } from '@/lib/tmdb'
import Link from 'next/link'

// Fungsi mengambil data statistik dan log aktivitas terbaru dari Postgres
async function getDashboardData() {
    // 1. Hitung total database secara paralel biar cepat
    const [totalMovies, totalSeries, totalEpisodes, recentContents] = await Promise.all([
        db.content.count({ where: { type: 'MOVIE' } }),
        db.content.count({ where: { type: 'SERIES' } }),
        db.episode.count(),
        db.content.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5, // Ambil 5 konten terakhir saja
        }),
    ])

    // 2. Ambil detail gambar mini poster dari TMDB untuk daftar konten terbaru
    const detailedRecent = await Promise.all(
        recentContents.map(async (item: any) => {
            try {
                const details = item.type === 'MOVIE'
                    ? await tmdb.getMovieDetails(item.tmdbId)
                    : await tmdb.getSeriesDetails(item.tmdbId)
                return {
                    id: item.id,
                    title: details.title,
                    type: item.type,
                    posterPath: details.posterPath,
                    createdAt: item.createdAt,
                }
            } catch {
                return {
                    id: item.id,
                    title: item.title,
                    type: item.type,
                    posterPath: null,
                    createdAt: item.createdAt,
                }
            }
        })
    )

    return {
        stats: {
            totalMovies,
            totalSeries,
            totalEpisodes,
            totalAllContent: totalMovies + totalSeries,
        },
        recentContents: detailedRecent,
    }
}

export default async function AdminDashboardPage() {
    const { stats, recentContents } = await getDashboardData()

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-8">
            {/* HEADER DASHBOARD */}
            <header className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-800 pb-5">
                <div>
                    <h1 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-500">
                        📊 Admin Command Center
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Pantau statistik data lokal Netplix Stream kamu</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/"
                        className="bg-gray-900 hover:bg-gray-800 text-xs font-semibold px-4 py-2.5 rounded-lg border border-gray-800 transition"
                    >
                        🏠 Lihat Website
                    </Link>
                    <Link
                        href="/admin/manage"
                        className="bg-gray-900 hover:bg-gray-800 text-amber-400 text-xs font-semibold px-4 py-2.5 rounded-lg border border-amber-900/40 transition flex items-center gap-1"
                    >
                        🛠️ Kelola Data
                    </Link>
                    <Link
                        href="/admin/finder"
                        className="bg-emerald-600 hover:bg-emerald-500 text-gray-950 font-bold text-xs px-4 py-2.5 rounded-lg shadow-md transition flex items-center gap-1"
                    >
                        🔍 Finder TMDB →
                    </Link>
                    <form action="/api/admin/logout" method="POST" className="inline">
                        <button
                            type="submit"
                            className="bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-red-400 text-xs font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer"
                        >
                            🚪 Keluar Admin
                        </button>
                    </form>
                </div>
            </header>

            <main className="max-w-6xl mx-auto space-y-8">
                {/* ROW 1: KARTU STATISTIK */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                    {/* TOTAL KONTEN */}
                    <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 relative overflow-hidden shadow-lg shadow-black/40">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Total Judul</span>
                        <span className="text-2xl md:text-3xl font-black text-white mt-1 block">{stats.totalAllContent}</span>
                        <div className="absolute -bottom-2 -right-2 text-gray-800/30 font-black text-5xl pointer-events-none select-none">📦</div>
                    </div>

                    {/* TOTAL MOVIES */}
                    <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 relative overflow-hidden shadow-lg shadow-black/40">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block">Total Movies</span>
                        <span className="text-2xl md:text-3xl font-black text-blue-400 mt-1 block">{stats.totalMovies}</span>
                        <div className="absolute -bottom-2 -right-2 text-gray-800/30 font-black text-5xl pointer-events-none select-none">🎬</div>
                    </div>

                    {/* TOTAL SERIES */}
                    <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 relative overflow-hidden shadow-lg shadow-black/40">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block">Total Series</span>
                        <span className="text-2xl md:text-3xl font-black text-purple-400 mt-1 block">{stats.totalSeries}</span>
                        <div className="absolute -bottom-2 -right-2 text-gray-800/30 font-black text-5xl pointer-events-none select-none">📺</div>
                    </div>

                    {/* TOTAL EPISODES */}
                    <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 relative overflow-hidden shadow-lg shadow-black/40">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">Total Episode</span>
                        <span className="text-2xl md:text-3xl font-black text-amber-400 mt-1 block">{stats.totalEpisodes}</span>
                        <div className="absolute -bottom-2 -right-2 text-gray-800/30 font-black text-5xl pointer-events-none select-none">🎞️</div>
                    </div>

                </div>

                {/* ROW 2: DAFTAR TERBARU */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 md:p-6 shadow-xl shadow-black/30">
                    <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                        ⏱️ Konten yang Baru Ditambahkan
                    </h2>

                    {recentContents.length === 0 ? (
                        <div className="text-center py-12 text-sm text-gray-600 border border-dashed border-gray-800 rounded-xl">
                            Belum ada aktivitas input data.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {recentContents.map((content: any) => (
                                <div key={content.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 group">
                                    <div className="flex items-center gap-3">
                                        {/* Poster Mini */}
                                        <div className="w-9 h-12 bg-gray-800 rounded overflow-hidden flex-none">
                                            {content.posterPath ? (
                                                <img src={content.posterPath} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-600">No Pic</div>
                                            )}
                                        </div>
                                        {/* Info Text */}
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-200 group-hover:text-amber-400 transition duration-150 line-clamp-1">
                                                {content.title}
                                            </h4>
                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                Ditambahkan pada: {new Date(content.createdAt).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Badge Tipe */}
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${content.type === 'MOVIE' ? 'bg-blue-950/60 text-blue-400 border border-blue-900/40' : 'bg-purple-950/60 text-purple-400 border border-purple-900/40'}`}>
                                        {content.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}