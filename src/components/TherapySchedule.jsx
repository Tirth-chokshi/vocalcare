import React, { useState, useEffect } from 'react';
import { fetchUpcomingTherapySessions } from '@/actions/patientActions';

export default function TherapySchedule({ patientId }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    async function loadSessions() {
      const upcomingSessions = await fetchUpcomingTherapySessions(patientId);
      setSessions(upcomingSessions);
    }
    loadSessions();
  }, [patientId]);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Upcoming Therapy Sessions</h2>
      {sessions.length > 0 ? (
        <ul>
          {sessions.map((session) => (
            <li key={session.id} className="mb-2">
              <p>{new Date(session.sessionDate).toLocaleString()}</p>
              <p>Duration: {session.duration} minutes</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming sessions scheduled.</p>
      )}
    </div>
  );
}