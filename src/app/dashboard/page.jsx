"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserRoleByEmail, getSupervisorIdByEmail, getTherapistIdByEmail, getPatientIdByEmail } from '@/actions/actions'
import AdminDashboard from '@/components/AdminDashboard';
import SupervisorDashboard from '@/components/SupervisorDashboard';
import PatientDashboard from '@/components/PatientDashboard';
import TherapistDashboard from '@/components/TherapistDashboard';
import MainDashboardNavbar from '@/components/Navbar';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [therapistId, setTherapistId] = useState(null);
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      if (session?.user?.email) {
        try {
          const [role, uId, tId, pId] = await Promise.all([
            getUserRoleByEmail(session.user.email),
            getSupervisorIdByEmail(session.user.email),
            getTherapistIdByEmail(session.user.email),
            getPatientIdByEmail(session.user.email)
          ]);
          setUserRole(role);
          setUserId(uId);
          setTherapistId(tId);
          setPatientId(pId);
        } catch (err) {
          setError('Failed to fetch user data. Please try refreshing the page.');
          console.error('Error fetching user data:', err);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (status === 'authenticated') {
      fetchUserData();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [session, status]);

  if (status === 'loading' || isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="flex justify-center items-center h-screen">Access Denied. Please sign in.</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  const DashboardComponent = (() => {
    switch (userRole) {
      case 'patient':
        return () => <PatientDashboard patientId={patientId} />;
      case 'therapist':
        return () => <TherapistDashboard therapistId={therapistId} />;
      case 'supervisor':
        return () => <SupervisorDashboard userId={userId} />;
      case 'admin':
        return AdminDashboard;
      default:
        return () => <div className="text-center mt-8">Invalid user role</div>;
    }
  })();

  return (
    <div className="flex flex-col h-screen">
      <MainDashboardNavbar userRole={userRole} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-4">
          <DashboardComponent />
        </div>
      </div>
    </div>
  );
}