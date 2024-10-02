import { getServerSession } from "next-auth/next"
// import { authOptions } from "@/app/auth"
import { redirect } from "next/navigation"

export default async function Dashboard() {
  const session = await getServerSession()

  if (!session) {
    return <h1>auth not done</h1>
  }

  return (
    <h1>
      Welcome, {session.user.email}  - Role: {session.user.role}
    </h1>
  )
}