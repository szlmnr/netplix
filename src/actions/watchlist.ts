"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// Fungsi 1: Jalankan / Hapus Bookmark (Toggle)
export async function toggleWatchlist(itemId: string) {
  const session = await auth();
  
  // Keamanan ekstra: jika gak ada session login, blokir!
  if (!session?.user?.id) {
    throw new Error("Wajib login dulu, fren!");
  }

  const userId = session.user.id;

  // Cek apakah item ini sudah pernah di-bookmark sebelumnya
  const existing = await db.watchlist.findUnique({
    where: {
      userId_itemId: { userId, itemId },
    },
  });

  if (existing) {
    // Kalau sudah ada, berarti user klik untuk MENGHAPUS dari watchlist
    await db.watchlist.delete({
      where: {
        userId_itemId: { userId, itemId },
      },
    });
  } else {
    // Kalau belum ada, berarti user klik untuk MENAMBAHKAN ke watchlist
    await db.watchlist.create({
      data: { userId, itemId },
    });
  }

  // Refresh cache data Next.js biar UI-nya langsung terupdate otomatis
  revalidatePath("/");
}

// Fungsi 2: Cek status apakah suatu item sudah di-bookmark oleh user yang sedang login
export async function checkIsBookmarked(itemId: string) {
  const session = await auth();
  if (!session?.user?.id) return false;

  const existing = await db.watchlist.findUnique({
    where: {
      userId_itemId: {
        userId: session.user.id,
        itemId,
      },
    },
  });

  return !!existing; // Mengembalikan true jika ada, false jika tidak ada
}