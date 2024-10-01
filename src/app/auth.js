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
          console.log("Missing email or password")
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          console.log("User not found")
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          console.log("Invalid password")
          return null
        }

        console.log("User authenticated:", user)
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      }
    })
  ],
    async jwt({ token, user }) {
      console.log("JWT callback - token:", JSON.stringify(token, null, 2))
      console.log("JWT callback - user:", JSON.stringify(user, null, 2))
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - input session:", JSON.stringify(session, null, 2))
      console.log("Session callback - token:", JSON.stringify(token, null, 2))
      session.user.id = token.id;
      session.user.role = token.role;
      console.log("Session callback - output session:", JSON.stringify(session, null, 2))
      return session;
    },
  pages: {
    signIn: '/signin',
  },
  // debug: process.env.NODE_ENV === 'development',
}

export const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }