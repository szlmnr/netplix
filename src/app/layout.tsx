import type { Metadata } from "next";
import { Syne } from "next/font/google"; // 🟩 Import Syne
import "./globals.css";

// 🟩 Konfigurasi font Syne
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TokuCorner", 
  description: "Streaming Tokusatsu Sub Indonesia Terlengkap, Update Kamen Rider Zeztz dan Project R.E.D Sub Indonesia", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // 🟩 Suntik variabel --font-syne ke html
      className={`${syne.variable} h-full antialiased`} 
    >
      {/* 🟩 Tambahkan class font-sans di body */}
      <body className="min-h-full flex flex-col font-sans bg-zinc-950 text-white">
        {children}
      </body>
    </html>
  );
}
