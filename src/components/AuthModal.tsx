"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/register";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameVal, setUsernameVal] = useState<string>("");

  if (!isOpen) return null; 

  // Handle Aksi Login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", { email, password, redirect: false });

      if (res?.error) {
        setError("Email atau password lu salah, fren!");
      } else {
        onClose(); 
        router.refresh(); 
      }
    } catch (err) {
      setError("Ada gangguan server nih.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Aksi Register
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await registerUser(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Akun sukses dibuat! Membuka form login...");
        setTimeout(() => {
          setSuccess(null);
          setIsRegister(false); 
          setUsernameVal(""); // 🟩 Sekalian reset input username biar bersih pas balik login
        }, 1500);
      }
    } catch (err) {
      setError("Gagal mendaftar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-zinc-900/90 border border-zinc-800/80 p-6 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">

        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 text-xs">✕</button>

        <div className="text-center mb-6">
          <h1 className="text-xl font-black uppercase tracking-tighter text-white font-syne">
            Toku<span className={isRegister ? "text-red-600" : "text-blue-500"}>Corner</span>
          </h1>
          <p className="text-zinc-500 text-[11px] mt-1">
            {isRegister ? "Daftar akun baru TokuCorner" : "Masuk untuk menyimpan watchlist serumu"}
          </p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] p-2.5 rounded-xl mb-4 text-center font-medium">{error}</div>}
        {success && <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] p-2.5 rounded-xl mb-4 text-center font-medium">{success}</div>}

        {/* SWAP FORM BERDASARKAN STATE */}
        {!isRegister ? (
          /* 🟦 FORM LOGIN */
          <form key="form-login" onSubmit={handleLogin} className="space-y-4"> {/* 🟩 Dikasih key unik */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" name="email" required placeholder="admin@toku.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" name="password" required placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-800 text-white font-bold text-xs py-2.5 rounded-xl transition mt-2">
              {isLoading ? "Memproses..." : "Masuk Akun"}
            </button>
            <p className="text-center text-zinc-500 text-[11px] mt-4">
              Belum punya akun?{" "}
              <button type="button" onClick={() => { setIsRegister(true); setError(null); }} className="text-zinc-300 hover:text-white font-bold underline">Daftar gratis</button>
            </p>
          </form>
        ) : (
          /* 🟥 FORM REGISTER */
          <form key="form-register" onSubmit={handleRegister} className="space-y-4"> {/* 🟩 Dikasih key unik */}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                required
                value={usernameVal} 
                onChange={(e) => setUsernameVal(e.target.value.replace(/\s/g, ""))} 
                placeholder="riderbaru"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email</label>
              <input type="email" name="email" required placeholder="rider@toku.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" name="password" required placeholder="••••••••" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-600 transition" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-bold text-xs py-2.5 rounded-xl transition mt-2">
              {isLoading ? "Memproses..." : "Daftar Akun"}
            </button>
            <p className="text-center text-zinc-500 text-[11px] mt-4">
              Sudah punya akun?{" "}
              <button type="button" onClick={() => { setIsRegister(false); setError(null); }} className="text-zinc-300 hover:text-white font-bold underline">Masuk di sini</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}