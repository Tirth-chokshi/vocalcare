/**
 * @typedef {import('@prisma/client').PrismaClient} PrismaClient
 */

/**
 * @type {PrismaClient}
 */
let cachedPrisma;


import { PrismaClient} from '@prisma/client'

if (process.env.NODE_ENV === 'production' ){
    prisma = new PrismaClient()
} else {
    if (!global.cachedPrisma) { 
        global.cachedPrisma = new PrismaClient()
    }
    prisma = global.cachedPrisma
}
export const db = prisma