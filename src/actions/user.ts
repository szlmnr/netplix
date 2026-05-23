"use server"

import { db } from "@/lib/db"; // Sesuaikan path prisma lu
import { revalidatePath } from "next/cache";

export async function updateProfile(userId: string, data: { username: string; image: string }) {
  try {
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        image: data.image,
      },
    });
    
    revalidatePath("/profile");
    
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Database Update Error:", error);
    return { success: false, error: "Gagal menyimpan ke database" };
  }
}