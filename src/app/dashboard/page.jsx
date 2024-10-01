"use client"
import { useState, useEffect } from 'react'
import { getCurrentUser, getSession } from '@/utils/auth'
import prisma from '@/lib/prisma'


export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [userDetails, setUserDetails] = useState(null)

  useEffect(() => {
    async function fetchData() {
      const currentUser = await getCurrentUser()
      const currentSession = await getSession()
      setUser(currentUser)
      setSession(currentSession)

      if (currentUser) {
        // Fetch additional user details from the database using Prisma
        const details = await prisma.user.findUnique({
          where: { id: currentUser.id },
          include: { profile: true } // Assuming you have a profile relation
        })
        setUserDetails(details)
      }
    }
    fetchData()
  }, [])

  if (!user) {
    return <div>Not signed in</div>
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Your role is: {user.role}</p>
      {userDetails && (
        <div>
          <h2>User Details</h2>
          <p>Email: {userDetails.email}</p>
          {userDetails.profile && (
            <>
              <p>Bio: {userDetails.profile.bio}</p>
              <p>Location: {userDetails.profile.location}</p>
            </>
          )}
        </div>
      )}
      <h2>Session Information</h2>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  )
}