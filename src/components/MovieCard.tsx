"use client";

import AuthModal from "@/components/AuthModal";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleWatchlist } from "@/actions/watchlist";
import { Icon } from '@iconify/react'

interface CatalogItem {
  id: string;
  slug: string;
  title: string;
  type: "MOVIE" | "SERIES";
  posterPath?: string;
  releaseDate?: string;
}

interface MovieCardProps {
  item: any;
  isLoggedIn: boolean;
  initialIsBookmarked: boolean;
  onAuthRequired: () => void; // 🟩 Terima prop fungsi dari grid
}

export default function MovieCard({ item,
  isLoggedIn,
  initialIsBookmarked,
  onAuthRequired // 🟩 Terima prop
}: MovieCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);

  const href = item.type === "MOVIE" ? `/movie/${item.slug}` : `/series/${item.slug}`;

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }

    // Optimistic UI (Ubah warna instan di mata user)
    setIsBookmarked(!isBookmarked);

    startTransition(async () => {
      try {
        await toggleWatchlist(item.id);
      } catch (err) {
        setIsBookmarked(isBookmarked); // Kembalikan warna jika DB error
        alert("Gagal memperbarui watchlist nih!");
      }
    });
  };

  return (
    <Link
      href={href}
      className="group relative bg-zinc-900/40 rounded-xl overflow-hidden border border-zinc-900 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1"
    >
      {/* 🍿 TOMBOL WATCHLIST MINI (Pojok Kanan Atas) */}
      <button
        onClick={handleWatchlistClick}
        disabled={isPending}
        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-zinc-950/60 backdrop-blur-md border border-white/5 transition active:scale-95 disabled:opacity-50"
        title={isBookmarked ? "Hapus dari Watchlist" : "Tambah ke Watchlist"}
      >
        <Icon
          // Jika di-bookmark pakai ikon 'bold', jika tidak pakai 'linear'
          icon={isBookmarked ? "solar:bookmark-bold" : "solar:bookmark-linear"}
          // Jika di-bookmark warnanya otomatis amber (kuning), jika tidak warna zinc (abu-abu)
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors duration-200 ${isBookmarked
              ? "text-amber-400"
              : "text-zinc-400 hover:text-amber-400"
            }`}
        />
      </button>

      {/* Type Badge (Movie / Series) */}
      <span
        className={`absolute top-0 left-0 z-10 font-black tracking-widest uppercase transition-all duration-300
        text-[8px] px-2 py-0.5 rounded-br-lg 
        sm:text-[10px] sm:px-3 sm:py-1 sm:rounded-br-xl 
        backdrop-blur-sm ${item.type === "MOVIE" ? "bg-blue-700/80 text-white" : "bg-red-700/80 text-white"
          }`}
      >
        {item.type === "MOVIE" ? "Movie" : "Series"}
      </span>

      {/* Poster Gambar */}
      <div className="aspect-2/3 w-full bg-zinc-900 overflow-hidden">
        {item.posterPath ? (
          <img
            src={item.posterPath}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px]">No Poster</span>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Metadata Teks */}
      <div className="p-2 sm:p-3 transition-all">
        <h3 className="font-bold text-[11px] sm:text-xs line-clamp-1 text-zinc-300 group-hover:text-white transition-colors tracking-wide">
          {item.title}
        </h3>
        <p className="text-[9px] sm:text-[10px] text-zinc-500 mt-0.5 sm:mt-1 font-semibold tracking-wider">
          {item.releaseDate ? item.releaseDate.substring(0, 4) : "—"}
        </p>
      </div>
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Link>
  );
}