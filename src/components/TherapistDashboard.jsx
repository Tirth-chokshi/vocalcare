"use client"
import React, { useState, useEffect } from 'react'
import { fetchDetailedAllocatedPatients, getUnreadNotifications, markNotificationAsRead } from '@/actions/actions'
import { toast } from 'sonner'
import AllocatedPatientsList from './AllocatedPatientsList'
import PlanBuilder from './PlanBuilder'
import SessionBuilder from './SessionBuilder'
import TherapyPlansComponent from './TherapyPlansComponent'
import { Button } from '@/components/ui/button'

export default function TherapistDashboard({ therapistId }) {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientsData, notificationsData] = await Promise.all([
          fetchDetailedAllocatedPatients(therapistId),
          getUnreadNotifications(therapistId)
        ]);
        setPatients(patientsData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    loadData();

    // Polling for new data every minute
    const intervalId = setInterval(loadData, 60000);

    return () => clearInterval(intervalId);
  }, [therapistId]);

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Therapist Dashboard</h3>
      </div>
      <AllocatedPatientsList patients={patients} />
      <PlanBuilder patients={patients} />
      <SessionBuilder therapistId={therapistId} />
      <TherapyPlansComponent therapistId={therapistId} />
    </div>
  )
}