"use client"
import React, { useState, useEffect } from 'react';
import { fetchAllocatedPatients, createTherapyPlan } from '@/actions/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function TherapistDashboard({ therapistId }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await fetchAllocatedPatients(therapistId);
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
      // Refresh the patient list after creating a new plan
      const updatedPatients = await fetchAllocatedPatients(therapistId);
      setPatients(updatedPatients);
    } catch (err) {
      setError('Failed to create therapy plan');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Therapist Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <Card key={patient.id}>
            <CardHeader>
              <CardTitle>{patient.user.username}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Email: {patient.user.email}</p>
              <p>Diagnosis: {patient.diagnosis}</p>
              {patient.therapyPlans.length > 0 ? (
                <p>Active Therapy Plan: Yes</p>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Create Therapy Plan</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Therapy Plan for {patient.user.username}</DialogTitle>
                    </DialogHeader>
                    <TherapyPlanForm onSubmit={(planData) => handleCreateTherapyPlan(patient.id, planData)} />
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TherapyPlanForm({ onSubmit }) {
  const [planData, setPlanData] = useState({
    goals: '',
    activities: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(planData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Goals"
        value={planData.goals}
        onChange={(e) => setPlanData({ ...planData, goals: e.target.value })}
      />
      <Textarea
        placeholder="Activities"
        value={planData.activities}
        onChange={(e) => setPlanData({ ...planData, activities: e.target.value })}
      />
      <Input
        type="date"
        placeholder="Start Date"
        value={planData.startDate}
        onChange={(e) => setPlanData({ ...planData, startDate: e.target.value })}
      />
      <Input
        type="date"
        placeholder="End Date"
        value={planData.endDate}
        onChange={(e) => setPlanData({ ...planData, endDate: e.target.value })}
      />
      <Button type="submit">Create Plan</Button>
    </form>
  );
}