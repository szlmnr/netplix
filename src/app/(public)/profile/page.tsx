import React from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileClientWrapper from "@/components/ProfileClientWrapper"; // 🟩 Kita bakal bikin wrapper ini

export default async function ProfilePage() {
  // 1. Amankan halaman, wajib login
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/"); // Tendang ke homepage kalau belum login
  }

  // 2. Ambil data User murni dari DB (Termasuk username & image)
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      image: true,
    },
  });

  if (!user) redirect("/");

  // 3. Ambil data Watchlist milik user ini
  const watchlistData = await db.watchlist.findMany({
    where: { userId: user.id },
    include: {
      content: {
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          posterPath: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 4. Ambil data History tontonan milik user ini
  const historyData = await db.watchHistory.findMany({
    where: { userId: user.id },
    include: {
      content: {
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          posterPath: true,
        },
      },
    },
    orderBy: { watchedAt: "desc" },
  });

  // Format datanya agar bersih pas dilempar ke client component
  const watchlist = watchlistData.map((w) => w.content);
  const history = historyData.map((h) => h.content);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        {/* 🟩 Oper semua datanya ke Wrapper Client Component */}
        <ProfileClientWrapper 
          user={user} 
          watchlist={watchlist} 
          history={history} 
        />
      </main>
    </div>
  );
}