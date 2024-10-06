"use client"
import React, { useState, useEffect } from 'react';
import { fetchDetailedAllocatedPatients, createTherapyPlan } from '@/actions/actions';
import { toast } from 'sonner';
import AllocatedPatientsList from './AllocatedPatientsList';
import PlanBuilder from './PlanBuilder';

export default function TherapistDashboard({ therapistId }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await fetchDetailedAllocatedPatients(therapistId);
        setPatients(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load patients');
        setLoading(false);
      }
    };

    loadPatients();
  }, [therapistId]);

  const handleCreateTherapyPlan = async (patientId, planData) => {
    try {
      await createTherapyPlan(therapistId, patientId, planData);
      const updatedPatients = await fetchDetailedAllocatedPatients(therapistId);
      setPatients(updatedPatients);
      toast.success('Therapy Plan created')
    } catch (err) {
      setError('Failed to create therapy plan');
      toast.error('Failed to create therapy plan');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h3 className="text-2xl font-bold mb-4">Allocated Patients</h3>
      <AllocatedPatientsList 
        patients={patients} 
        onCreateTherapyPlan={handleCreateTherapyPlan} 
      />
      <PlanBuilder/>
    </div>
  );
}