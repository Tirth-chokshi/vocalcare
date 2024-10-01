'use client'

import { useSession } from 'next-auth/react'
import AdminDashboard from '@/components/AdminDashboard'
import TherapistDashboard from '@/components/TherapistDashboard'
import SupervisorDashboard from '@/components/SupervisorDashboard'
import PatientDashboard from '@/components/PatientDashboard'

export default function Dashboard() {
  const { data: session, status } = useSession()
  
  console.log('Session:', session)
  console.log('Status:', status)

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  switch (session?.user?.role) {
    case 'admin':
      return <AdminDashboard />
    case 'therapist':
      return <TherapistDashboard />
    case 'supervisor':
      return <SupervisorDashboard />
    case 'patient':
      return <PatientDashboard />
    default:
      return <div>Invalid user role: {session?.user?.role}</div>
  }
}