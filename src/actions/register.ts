"use server";

import { db } from "@/lib/db";
// 🚨 TIPS: Di dunia nyata, password WAJIB di-hash (misal pake library 'bcryptjs') 
// sebelum masuk ke DB demi keamanan. Tapi buat simulasi lokal awal ini, kita simpan string biasa dulu biar ga ribet install package.

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Semua kolom wajib diisi, fren!" };
  }

  try {
    // 1. Cek apakah email sudah terdaftar di database
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email ini udah dipake Rider lain, fren!" };
    }

    // 2. Buat user baru di database
    await db.user.create({
      data: {
        name,
        email,
        password, // Idealnya di-hash: await bcrypt.hash(password, 10)
      },
    });

    return { success: "Akun berhasil dibuat! Silakan login, fren." };
  } catch (error) {
    return { error: "Waduh, gagal ngedaftar nih. Coba lagi nanti!" };
  }
}