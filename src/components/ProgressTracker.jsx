import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchPatientProgress } from '@/actions/patientActions';

export default function ProgressTracker({ patientId }) {
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    async function loadProgressData() {
      const data = await fetchPatientProgress(patientId);
      setProgressData(data);
    }
    loadProgressData();
  }, [patientId]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Progress Tracker</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={progressData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="progress" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}