import React, { useState, useEffect } from 'react';
import { fetchCurrentTherapyPlan } from '@/actions/patientActions';

export default function TherapyPlanView({ patientId }) {
  const [therapyPlan, setTherapyPlan] = useState(null);

  useEffect(() => {
    async function loadTherapyPlan() {
      const plan = await fetchCurrentTherapyPlan(patientId);
      setTherapyPlan(plan);
    }
    loadTherapyPlan();
  }, [patientId]);

  if (!therapyPlan) {
    return <div>Loading therapy plan...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Current Therapy Plan</h2>
      <p><strong>Start Date:</strong> {new Date(therapyPlan.startDate).toLocaleDateString()}</p>
      <p><strong>End Date:</strong> {new Date(therapyPlan.endDate).toLocaleDateString()}</p>
      <p><strong>Goals:</strong> {therapyPlan.goals}</p>
      <p><strong>Activities:</strong> {therapyPlan.activities}</p>
    </div>
  );
}