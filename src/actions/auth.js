'use server'

import prisma from "@/lib/prisma"
import bcrypt from 'bcryptjs'

const ADMIN_SECRET = 'adminsecret'

export async function signUp(formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const username = formData.get('username')
  const adminCode = formData.get('adminCode')

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

    let role = 'user'
    if (adminCode === ADMIN_SECRET) {
      role = 'admin'
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role,
      },
    })

    // If the user is an admin, create the Admin record
    if (role === 'admin') {
      await prisma.admin.create({
        data: {
          userId: newUser.id,
          department: 'General',  // You can modify this as needed
          accessLevel: 'Full',    // You can modify this as needed
        },
      })
    }

    return { success: true, user: { id: newUser.id, email: newUser.email, username: newUser.username, role } }
  } catch (error) {
    console.error('Signup error:', error)
    return { error: 'An unexpected error occurred' }
  }
}