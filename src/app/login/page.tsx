"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // 🟩 Import fungsi signIn bawaan client NextAuth

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // 🟩 Eksekusi login menggunakan provider 'credentials'
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, // Kita matikan auto-redirect bawaan biar bisa kita atur manual via router
      });

      if (res?.error) {
        setError("Email atau password lu salah, fren!");
      } else {
        // 🔥 Login Sukses! Lempar user balik ke homepage, lalu refresh bodi web
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Waduh, ada gangguan server nih. Coba lagi nanti!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 font-sans">
      <div className="w-full max-w-sm bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl backdrop-blur-md shadow-xl">
        {/* Header Logo */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-black uppercase tracking-tighter text-white">
            Toku<span className="text-blue-500">Corner</span>
          </h1>
          <p className="text-zinc-500 text-[11px] mt-1">Masuk untuk menyimpan watchlist serumu</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="admin@toku.com"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Password</label>
            <input 
              type="password" 
              name="password" 
              required 
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition mt-2 shadow-lg shadow-blue-600/10 active:scale-[0.98]"
          >
            Masuk Akun
          </button>
        </form>
      </div>
    </div>
  );
}