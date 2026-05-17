import * as dotenv from 'dotenv'
// Load env di awal agar string koneksi terbaca oleh driver pg
dotenv.config({ path: '.env.local' })

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
  // 1. Buat koneksi pool menggunakan driver PostgreSQL murni (pasti terbaca oleh Node.js)
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  
  // 2. Bungkus koneksi tersebut ke dalam Adapter Prisma 7
  const adapter = new PrismaPg(pool)
  
  // 3. Masukkan adapter ke dalam constructor PrismaClient
  prisma = new PrismaClient({ adapter })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }
}

export const db = prisma