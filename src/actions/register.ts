"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!username || !email || !password) {
    return { error: "Semua kolom wajib diisi, fren!" };
  }

  if (/\s/.test(username)) {
    return { error: "Username gak boleh pakai spasi, fren!" };
  }

  try {
    // 🟩 2. HIT API VALIDATOR (ABSTRACT API)
    const apiKey = process.env.ABSTRACT_EMAIL_API_KEY;
    
    // Kita kasih try-catch internal khusus API biar kalau API-nya down, pendaftaran gak macet
    try {
      const apiRes = await fetch(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`
      );

      if (apiRes.ok) {
        const emailData = await apiRes.json();
        
        // Cek deliverability dari hasil simulasi SMTP Abstract API
        if (emailData.deliverability === "UNDELIVERABLE") {
          return { error: "Email lu gak terdaftar atau gak aktif, fren! Pake email asli ya." };
        }
      } else {
        console.error("Abstract API merespon dengan status error, user diloloskan demi UX.");
      }
    } catch (apiError) {
      // Strategi Fail-Open: Kalau Abstract API down/RTO, tetap loloskan user biar web kita gak ikut crash
      console.error("Gagal terhubung ke Abstract API:", apiError);
    }

    const existingUserByEmail = await db.user.findUnique({ where: { email } });
    if (existingUserByEmail) {
      return { error: "Email ini udah dipake Rider lain, fren!" };
    }

    // Cek Username Unik (Cukup SEKALI deklarasi di sini, bos)
    const existingUserByUsername = await db.user.findUnique({ where: { username } });
    if (existingUserByUsername) {
      return { error: "Username ini udah diambil Rider lain, cari yang lebih keren!" };
    }

    // 🟩 4. PROSES ENKRIPSI PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🟩 5. INPUT DATA KE NEON DB
    await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return { success: "Akun berhasil dibuat! Silakan login, fren." };
  } catch (error) {
    console.error("Register Error:", error); // Biar gampang debug kalau ada apa-apa di terminal
    return { error: "Waduh, gagal ngedaftar nih. Coba lagi nanti!" };
  }
}