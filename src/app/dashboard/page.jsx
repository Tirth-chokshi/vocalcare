"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getUserRoleByEmail } from '@/actions/actions'
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

  useEffect(() => {
    async function fetchUserRole() {
      if (session?.user?.email) {
        try {
          const role = await getUserRoleByEmail(session.user.email);
          setUserRole(role);
        } catch (err) {
          setError('Failed to fetch user role');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    }

    if (status === 'authenticated') {
      fetchUserRole();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [session, status]);

  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Access Denied. Please sign in.</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  let DashboardComponent;
  switch (userRole) {
    case 'patient':
      DashboardComponent = PatientDashboard;
      break;
    case 'therapist':
      DashboardComponent = TherapistDashboard;
      break;
    case 'supervisor':
      DashboardComponent = SupervisorDashboard;
      break;
    case 'admin':
      DashboardComponent = AdminDashboard;
      break;
    default:
      return <div>Invalid user role</div>;
  }

  return (
    <>
      <div className="flex flex-col h-screen">
        <MainDashboardNavbar userRole={userRole} />
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4">
            <DashboardComponent />
          </div>
        </div>
      </div>
    </>
  );
}