import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma
} else {
  // Ambil URL database dari env bawaan Vercel/Next.js
  const connectionString = process.env.DATABASE_URL

  // PENGAMAN CRASH: Jika string kosong (saat build awal di Vercel), bungkus agar tidak meledak layar hitam
  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL belum terdeteksi di env runtime.")
  }

  // Buat pool koneksi menggunakan adapter pg resmi
  const pool = new Pool({ 
    connectionString: connectionString || "postgresql://mock:mock@localhost:5432/mock",
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })
  
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }
}

export const db = prisma