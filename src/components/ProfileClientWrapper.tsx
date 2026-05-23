"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUploadThing } from "@/utils/uploadthing";
import { updateProfile } from "@/actions/user";
import { Icon } from "@iconify/react";

interface ContentItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  posterPath: string | null;
}

interface ProfileClientWrapperProps {
  user: {
    id: string;
    username: string | null;
    email: string;
    image: string | null;
  };
  watchlist: ContentItem[];
  history: ContentItem[];
}

export default function ProfileClientWrapper({ user, watchlist, history }: ProfileClientWrapperProps) {
  const [activeTab, setActiveTab] = useState<"watchlist" | "history">("watchlist");
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user.username || "");
  const [avatar, setAvatar] = useState(user.image || "/default-avatar.png");
  const { startUpload } = useUploadThing("imageUploader");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kasih loading state atau disable button di UI biar user gak klik berkali-kali
    let finalImageUrl = avatar;

    try {
      // 1. Cek apakah ada perubahan gambar (format base64)
      if (avatar.startsWith("data:image")) {
        const res = await fetch(avatar);
        const blob = await res.blob();
        const file = new File([blob], "avatar.png", { type: "image/png" });

        // 2. Upload ke Cloud
        const uploadRes = await startUpload([file]);

        if (uploadRes && uploadRes.length > 0) {
          // ✅ Akses elemen pertama dulu, BARU ambil propertinya
          const fileData = uploadRes[0] as any;

          // Coba url langsung (UploadThing v6+), fallback ke serverData.url
          finalImageUrl = fileData.url ?? fileData.serverData?.url;

          if (!finalImageUrl) {
            throw new Error("URL gambar tidak ditemukan dalam response upload.");
          }
        } else {
          throw new Error("Gagal mengupload gambar ke cloud.");
        }
      }

      // 3. Simpan perubahan ke Database
      const result = await updateProfile(user.id, {
        username,
        image: finalImageUrl
      });

      if (result?.success) {
        alert("Profil berhasil diperbarui!");
        setIsEditing(false);
      } else {
        throw new Error(result?.error || "Terjadi kesalahan sistem.");
      }

    } catch (error) {
      // Ini bakal nampilin pesan asli dari sistem (misal: 401, 403, dll)
      console.error("DETAIL ERROR:", error);
      alert("Cek Console, error-nya: " + (error instanceof Error ? error.message : "Unknown Error"));
    }
  };

  const currentList = activeTab === "watchlist" ? watchlist : history;

  return (
    <div className="space-y-10">
      {/* KARTU PROFIL UTAMA */}
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/80 flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-red-600 bg-zinc-800 flex-shrink-0">
          <Image
            src={avatar}
            alt="Avatar"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="flex-1 w-full text-center md:text-left space-y-2">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-3.5 max-w-sm mx-auto md:mx-0">
              {/* 🟩 1. INPUT USERNAME */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username baru..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 text-zinc-100"
                  required
                />
              </div>

              {/* 🟩 2. PENGATURAN AVATAR (UPLOAD / PASTE / URL) */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Foto Profil / Avatar
                </label>

                {/* AREA DROPZONE & PASTE */}
                <div
                  onPaste={(e) => {
                    // 📋 FIX TS: Ambil file pertama dari clipboard
                    const files = e.clipboardData.files;
                    if (files && files.length > 0) {
                      const file = files[0];
                      // Cek tipe file dari objek 'file' (bukan dari 'files')
                      if (file.type.startsWith("image/")) {
                        const reader = new FileReader();
                        reader.onloadend = () => setAvatar(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }
                  }}
                  className="group relative border border-dashed border-zinc-800 hover:border-red-600/50 bg-zinc-950/60 rounded-xl p-4 text-center cursor-pointer transition-all duration-200"
                >
                  {/* Input file asli disembunyikan */}
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      // 📁 FITUR UPLOAD DARI PENYIMPANAN
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setAvatar(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  {/* FIX: Struktur teks dibersihkan agar JSX tidak salah baca identifier */}
                  <label htmlFor="avatar-upload" className="cursor-pointer block space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 group-hover:text-red-500 transition-colors">
                      <Icon icon="solar:folder-bold" className="w-3.5 h-3.5" />
                      Klik / Seret gambar ke sini buat upload
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      atau klik di sini terus tekan {" "}
                      <kbd className="bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800 text-zinc-400 font-mono text-[9px]">
                        Ctrl + V
                      </kbd>{" "}
                      buat paste gambar
                    </div>
                  </label>
                </div>

                {/* ALTERNATIF: TETEP DIKASIH INPUT URL BIASA BUAT CADANGAN */}
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[10px] font-bold text-zinc-600 uppercase">URL</span>
                  <input
                    type="text"
                    value={avatar.startsWith("data:image") ? "[ Gambar hasil Upload/Paste ]" : avatar}
                    disabled={avatar.startsWith("data:image")}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Atau tempel link URL gambar langsung di sini..."
                    className="w-full bg-zinc-950/40 border border-zinc-800/80 rounded-lg pl-10 pr-3 py-1.5 text-xs focus:outline-none focus:border-red-600 text-zinc-300 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  />
                  {avatar.startsWith("data:image") && (
                    <button
                      type="button"
                      onClick={() => setAvatar(user.image || "/default-avatar.png")}
                      className="absolute right-2 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* TOMBOL AKSI */}
              <div className="flex gap-2 pt-1">
                <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-2 rounded-md transition-all">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Balikin ke data awal kalau user mencet batal
                    setUsername(user.username || "");
                    setAvatar(user.image || "/default-avatar.png");
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs px-3.5 py-2 rounded-md transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-xl font-black tracking-tight text-white">{username || "User TokuCorner"}</h1>
              <p className="text-xs font-medium text-zinc-500 mb-2">{user.email}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-[11px] font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/50 px-3 py-1.5 rounded-lg transition-all"
              >
                Edit Profil & Avatar
              </button>
            </>
          )}
        </div>
      </div>

      {/* SISTEM NAVIGASI TAB */}
      <div className="space-y-6">
        <div className="flex border-b border-zinc-800 gap-6">
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`pb-3 text-sm font-bold tracking-tight transition-all relative ${activeTab === "watchlist" ? "text-red-500" : "text-zinc-500 hover:text-zinc-300"
              }`}
          >
            Watchlist ({watchlist.length})
            {activeTab === "watchlist" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-sm font-bold tracking-tight transition-all relative ${activeTab === "history" ? "text-red-500" : "text-zinc-500 hover:text-zinc-300"
              }`}
          >
            Riwayat Nonton ({history.length})
            {activeTab === "history" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-full" />}
          </button>
        </div>

        {/* GRID DAFTAR FILM / SERIES */}
        {currentList.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800">
            <p className="text-zinc-500 text-xs font-medium">Belum ada konten di daftar ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {currentList.map((item) => (
              <Link
                key={item.id}
                href={`/watch/${item.slug}`}
                className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-red-600/50 transition-all shadow-md aspect-[2/3]"
              >
                {item.posterPath ? (
                  <Image
                    src={item.posterPath}
                    alt={item.title}
                    fill
                    sizes="(max-w-768px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-center p-4">
                    <span className="text-[10px] font-bold text-zinc-600 line-clamp-2">{item.title}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-[11px] font-black tracking-tight text-white line-clamp-2">{item.title}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}