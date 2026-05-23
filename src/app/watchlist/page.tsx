import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import CatalogGrid from "@/components/CatalogSection";

export default async function WatchlistPage() {
  const session = await auth();

  // Pengaman: Kalau user coba-coba buka /watchlist tapi belum login, tendang ke /login
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/watchlist");
  }

  // 1. Ambil data watchlist milik user ini dari DB
  const userWatchlist = await db.watchlist.findMany({
    where: { userId: session.user.id },
    include: {
      // 🚨 SESUAIKAN: ganti 'content' di bawah ini dengan nama relasi 
      // yang lu hubungkan ke tabel film/content lu di schema.prisma
      content: true, 
    },
    orderBy: { createdAt: "desc" }, // Yang baru disimpan muncul di atas
  });

  // 2. Format datanya agar strukturnya sama persis seperti CatalogItem yang diminta CatalogGrid
  const catalog = userWatchlist.map((w) => {
    const c = w.content; // ini data konten filmnya
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      type: c.type as "MOVIE" | "SERIES",
      posterPath: c.posterPath ?? undefined,
      releaseDate: c.releaseDate ?? undefined,
    };
  });

  // 3. Karena di halaman ini isinya pasti udah barang yang di-bookmark semua, 
  // kita isi array watchlistIds dengan semua ID yang muncul biar pitanya auto Kuning Emas
  const watchlistIds = catalog.map((item) => item.id);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 overflow-x-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 space-y-8 pt-28 pb-20 relative z-20">
        
        {/* Header Halaman */}
        <div className="space-y-2 border-b border-zinc-900 pb-5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3 font-syne">
            <span className="w-1 h-6 bg-red-600 rounded-full" />
            Watchlist Saya
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Menampilkan {catalog.length} konten Tokusatsu yang kamu simpan untuk ditonton nanti.
          </p>
        </div>

        {/* Grid Katalog Reusable Lu */}
        <CatalogGrid
          catalog={catalog}
          hasFilter={false}
          isLoggedIn={true}
          watchlistIds={watchlistIds}
        />
      </main>
    </div>
  );
}