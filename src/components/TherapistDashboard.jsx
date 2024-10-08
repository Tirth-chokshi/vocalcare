"use client"
import React, { useState, useEffect } from 'react'
import { fetchDetailedAllocatedPatients, createTherapyPlan } from '@/actions/actions'
import { toast } from 'sonner'
import AllocatedPatientsList from './AllocatedPatientsList'
import PlanBuilder from './PlanBuilder'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button'
import SessionBuilder from './SessionBuilder'

export default function TherapistDashboard({ therapistId }) {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await fetchDetailedAllocatedPatients(therapistId)
        setPatients(data)
        checkForNewPatients(data)
        setLoading(false)
      } catch (err) {
        setError('Failed to load patients')
        setLoading(false)
      }
    }

    loadPatients()

    // Simulating periodic checks for new patients
    const intervalId = setInterval(loadPatients, 60000)

    return () => clearInterval(intervalId)
  }, [therapistId])

  const checkForNewPatients = (newPatients) => {
    const newNotifications = newPatients.filter(patient => {
      const isNew = !patients.some(p => p.id === patient.id)
      if (isNew) {
        return true
      }
      return false
    }).map(patient => ({
      id: patient.id,
      message: `New patient allocated: ${patient.user?.username || 'Unnamed Patient'}`,
      timestamp: new Date(),
    }))

    // if (newNotifications.length > 0) {
    //   setNotifications(prev => [...newNotifications, ...prev])
    //   newNotifications.forEach(notification => {
    //     toast.success(notification.message)
    //   })
    // }
  }

  const handleCreateTherapyPlan = async (patientId, planData) => {
    try {
      await createTherapyPlan(therapistId, patientId, planData)
      const updatedPatients = await fetchDetailedAllocatedPatients(therapistId)
      setPatients(updatedPatients)
      toast.success('Therapy Plan created')
    } catch (err) {
      setError('Failed to create therapy plan')
      toast.error('Failed to create therapy plan')
    }
  }

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Therapist Dashboard</h3>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2">
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <DropdownMenuItem>No new notifications</DropdownMenuItem>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} onSelect={() => clearNotification(notification.id)}>
                  {notification.message}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu> */}
      </div>

      <AllocatedPatientsList
        patients={patients}
        onCreateTherapyPlan={handleCreateTherapyPlan}
      />

      <PlanBuilder
        patients={patients}
        onCreateTherapyPlan={handleCreateTherapyPlan}
      />

      <SessionBuilder
        therapistId={therapistId}
      />
    </div>
  )
}