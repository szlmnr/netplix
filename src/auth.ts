import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Cari user di database berdasarkan email yang diinput
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        // Jika user gak ketemu ATAU password-nya gak cocok, tolak!
        if (!user || !(await bcrypt.compare(credentials.password as string, user.password))) {
          return null
        }

        // 🟩 SINKRONISASI 1: Ganti 'name' menjadi 'username' sesuai DB baru
        return {
          id: user.id,
          username: user.username, // 👈 Pakai username sekarang bos!
          email: user.email,
          role: user.role, 
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.username = (user as any).username // 🟩 SINKRONISASI 2: Simpan username ke dalam token JWT
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        // @ts-ignore
        session.user.username = token.username as string // 🟩 SINKRONISASI 3: Lempar username ke object session utama
        // @ts-ignore
        session.user.role = token.role as string // Sekalian lempar rolenya biar gampang dipake nanti
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  }
})