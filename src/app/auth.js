import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from 'bcryptjs'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
      
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
      
        if (!user) {
          return null
        }
      
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
      
        if (!isPasswordValid) {
          return null
        }
      
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
  debug: process.env.NODE_ENV === 'development',
}

export const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }