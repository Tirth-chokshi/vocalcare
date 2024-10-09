import React, { useState, useEffect } from 'react';
import { fetchUpcomingTherapySessions } from '@/actions/patientActions';

export default function PatientTherapySchedule({ patientId }) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        const upcomingSessions = await fetchUpcomingTherapySessions(patientId);
        setSessions(upcomingSessions);
      } catch (err) {
        setError('Failed to load upcoming sessions. Please try again later.');
        console.error('Error loading sessions:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSessions();
  }, [patientId]);

  if (isLoading) return <div>Loading sessions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className=" shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Upcoming Therapy Sessions</h2>
      {sessions.length === 0 ? (
        <p>No upcoming sessions scheduled.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li key={session.id} className="border-b pb-2">
              <div className="font-semibold">
                {new Date(session.sessionDate).toLocaleString()}
              </div>
              <div>Duration: {session.duration} minutes</div>
              <div>Status: {session.status}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}