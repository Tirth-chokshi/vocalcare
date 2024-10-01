import { getCurrentUser } from '@/utils/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/signin')
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.username}</p>
    </div>
  )
}