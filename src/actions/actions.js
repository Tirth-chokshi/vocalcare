'use server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getUserRoleByEmail(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true }
  })

  return user?.role
}