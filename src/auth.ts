import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"

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

        // 🟩 Cari user di database berdasarkan email yang diinput
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        // 🟩 Jika user gak ketemu ATAU password-nya gak cocok, tolak!
        // (Catatan: Nanti kalau udah pakai bcrypt, ganti jadi: !(await bcrypt.compare(password, user.password)))
        if (!user || user.password !== credentials.password) {
          return null
        }

        // 🟩 Jika sukses, kembalikan data user untuk disimpan ke token session
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // Membawa role (USER/ADMIN/VIP)
        }
      }
    })
  ],
  // 🟩 TAMBAHKAN BLOK CALLBACKS INI, FREN!
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        // Jika ke depan lu butuh session.user.role di Client Component, tinggal tambah di sini
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  }
})