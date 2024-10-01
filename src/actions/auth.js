'use server'

import prisma from "@/lib/prisma"
import bcrypt from 'bcryptjs'

export async function signUp(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const username = formData.get('username')

  if (!email || !password || !username) {
    return { error: 'All fields are required' }
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    })

    if (existingUser) {
      return { error: 'Email or username already exists' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'user',
      },
    })

    return { success: true, user: { id: newUser.id, email: newUser.email, username: newUser.username } }
  } catch (error) {
    console.error('Signup error:', error)
    return { error: 'An unexpected error occurred' }
  }
}