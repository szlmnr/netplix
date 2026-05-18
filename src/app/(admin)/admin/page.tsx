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
            <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-y-4 md:gap-x-4 mb-8 border-b border-gray-800 pb-5">

                {/* SISI KIRI: JUDUL (Tetap aman gak disentuh) */}
                <div className="flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-7 h-7 text-amber-500"
                    >
                        <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
                    </svg>
                    <div>
                        <h1 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-linear-to-r from-amber-400 to-orange-500">
                            Admin Command Center
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">Pantau statistik data lokal Netplix Stream kamu</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <Link
                        href="/"
                        className="bg-gray-900 hover:bg-gray-800 text-xs font-semibold px-4 py-2.5 rounded-lg border border-gray-800 transition flex items-center gap-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4 text-gray-400"
                        >
                            <path d="M11.47 3.822a.75.75 0 0 1 1.06 0l8.25 8.25a.75.75 0 0 1-1.06 1.06L12 5.56l-7.72 7.72a.75.75 0 0 1-1.06-1.06l8.25-8.25Z" />
                            <path d="M4.5 10.5a.75.75 0 0 0-.75.75v7.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-7.5a.75.75 0 0 0-.75-.75h-15Z" />
                        </svg>
                        Lihat Website
                    </Link>

                    <Link
                        href="/admin/manage"
                        className="bg-gray-900 hover:bg-gray-800 text-amber-400 text-xs font-semibold px-4 py-2.5 rounded-lg border border-amber-900/40 transition flex items-center gap-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4 text-amber-500"
                        >
                            <path fillRule="evenodd" d="M11.078 2.25c-.288 0-.546.17-.66.435L9.141 5.74a4.5 4.5 0 0 0-1.152.665L4.99 5.175a.75.75 0 0 0-.913.254l-1.5 2.598a.75.75 0 0 0 .19.99l2.481 1.716a4.468 4.468 0 0 0 0 1.322l-2.481 1.716a.75.75 0 0 0-.19.992l1.5 2.597a.75.75 0 0 0 .914.254l3-.122c.356.262.743.486 1.152.665l1.277 3.055c.114.266.372.435.66.435h3c.288 0 .546-.17.66-.435l1.277-3.055a4.506 4.506 0 0 0 1.152-.665l3 .122a.75.75 0 0 0 .913-.254l1.5-2.597a.75.75 0 0 0-.19-.992l-2.482-1.716a4.466 4.466 0 0 0 0-1.322l2.482-1.716a.75.75 0 0 0 .19-.99l-1.5-2.598a.75.75 0 0 0-.914-.254l-3 .122a4.456 4.456 0 0 0-1.152-.665L13.922 2.685a.75.75 0 0 0-.66-.435h-3ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                        </svg>
                        Kelola Data
                    </Link>

                    <Link
                        href="/admin/finder"
                        className="bg-emerald-600 hover:bg-emerald-500 text-gray-950 font-bold text-xs px-4 py-2.5 rounded-lg shadow-md transition flex items-center gap-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4 text-gray-950"
                        >
                            <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clipRule="evenodd" />
                        </svg>
                        Finder TMDB
                    </Link>

                    <form action="/api/admin/logout" method="POST" className="inline">
                        <button
                            type="submit"
                            className="bg-red-950/40 hover:bg-red-900 border border-red-900/40 text-red-400 text-xs font-semibold px-4 py-2.5 rounded-lg transition cursor-pointer flex items-center gap-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4 text-red-400"
                            >
                                <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 0 0 6 5.25v13.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V15a.75.75 0 0 1 1.5 0v3.75a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V5.25a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3V9a.75.75 0 0 1-1.5 0V5.25a1.5 1.5 0 0 0-1.5-1.5h-6Zm10.72 4.72a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l1.72-1.72H9a.75.75 0 0 1 0-1.5h10.94l-1.72-1.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                            </svg>
                            Keluar Admin
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
                        <div className="absolute -bottom-2 -right-2 text-gray-800/30 font-black pointer-events-none select-none">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-14 h-14"
                            >
                                <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.318a.75.75 0 0 0 .372.648l8.628 5.032Z" />
                            </svg>
                        </div>
                    </div>

                    {/* TOTAL MOVIES */}
                    <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 relative overflow-hidden shadow-lg shadow-black/40">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400 block">Total Movies</span>
                        <span className="text-2xl md:text-3xl font-black text-blue-400 mt-1 block">{stats.totalMovies}</span>
                        <div className="absolute -bottom-2 -right-2 text-gray-800/30 font-black pointer-events-none select-none">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-14 h-14"
                            >
                                <path fillRule="evenodd" d="M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm.647 1.5h2.18l-1.5 2.25H3.73l1.417-2.25Zm3.71 0h2.25l-1.5 2.25H7.357l1.5-2.25Zm3.784 0h2.25l-1.5 2.25h-2.25l1.5-2.25Zm3.783 0h1.83a1.5 1.5 0 0 1 1.183 1.5v.75H17.924l1.5-2.25ZM3 9v8.25A1.5 1.5 0 0 0 4.5 18.75h15a1.5 1.5 0 0 0 1.5-1.5V9H3Z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {/* TOTAL SERIES */}
                    <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 relative overflow-hidden shadow-lg shadow-black/40">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block">Total Series</span>
                        <span className="text-2xl md:text-3xl font-black text-purple-400 mt-1 block">{stats.totalSeries}</span>
                        <div className="absolute -bottom-2 -right-2 text-gray-800/30 font-black pointer-events-none select-none">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-14 h-14"
                            >
                                <path d="M19.5 6h-3.515l1.464-1.464a.75.75 0 1 0-1.061-1.06L13.939 6H10.06L7.61 3.551a.75.75 0 0 0-1.06 1.06L8.014 6H4.5A2.25 2.25 0 0 0 2.25 8.25v10.5A2.25 2.25 0 0 0 4.5 21h15a2.25 2.25 0 0 0 2.25-2.25V8.25A2.25 2.25 0 0 0 19.5 6ZM3.75 8.25A.75.75 0 0 1 4.5 7.5h15a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75V8.25Z" />
                            </svg>
                        </div>
                    </div>

                    {/* TOTAL EPISODES */}
                    <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 relative overflow-hidden shadow-lg shadow-black/40">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">Total Episode</span>
                        <span className="text-2xl md:text-3xl font-black text-amber-400 mt-1 block">{stats.totalEpisodes}</span>
                        <div className="absolute -bottom-2 -right-2 text-gray-800/30 font-black pointer-events-none select-none">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-14 h-14"
                            >
                                <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm3-.75a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75H6Zm0 4.5a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V10.5a.75.75 0 0 0-.75-.75H6Zm0 4.5a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V15a.75.75 0 0 0-.75-.75H6ZM16.5 5.25a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75H18a.75.75 0 0 0 .75-.75V6a.75.75 0 0 0-.75-.75h-1.5Zm-.75 5.25a.75.75 0 0 1 .75-.75H18a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75V10.5Zm.75 3.75a.75.75 0 0 0-.75.75v1.5c0 .414.336.75.75.75H18a.75.75 0 0 0 .75-.75V15a.75.75 0 0 0-.75-.75h-1.5ZM10.5 6a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75V6Z" clipRule="evenodd" />
                            </svg>
                        </div>
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