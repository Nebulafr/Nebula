import { PrismaClient } from './generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { env } from './confiig/env.js'


const connectionString = env.DATABASE_URL

const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
})

const adapter = new PrismaPg(pool)

const prismaClientSingleton = () => {
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma


