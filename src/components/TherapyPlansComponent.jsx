"use client"
import React, { useState, useEffect } from 'react';
import { fetchTherapyPlansByStatus } from '@/actions/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const PlanTable = ({ plans, title, statusColor }) => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>
        {plans.length} {plans.length === 1 ? 'plan' : 'plans'} {title.toLowerCase()}
      </CardDescription>
    </CardHeader>
    <CardContent>
      {plans.length === 0 ? (
        <p className="text-muted-foreground">No {title.toLowerCase()} at the moment.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Goals</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map(plan => (
              <TableRow key={plan.id}>
                <TableCell>{plan.patient.user.username}</TableCell>
                <TableCell>{new Date(plan.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(plan.endDate).toLocaleDateString()}</TableCell>
                <TableCell>{plan.goals}</TableCell>
                <TableCell>{plan.therapySessions.length}</TableCell>
                <TableCell>
                  <Badge variant={statusColor === 'bg-yellow-50' ? 'warning' : 'success'}>
                    {plan.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-[250px]" />
    <Skeleton className="h-[200px] w-full" />
    <Skeleton className="h-8 w-[250px]" />
    <Skeleton className="h-[200px] w-full" />
  </div>
);

export default function TherapyPlansComponent({ therapistId }) {
  const [pendingPlans, setPendingPlans] = useState([]);
  const [approvedPlans, setApprovedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTherapyPlans() {
      try {
        const { pendingPlans, approvedPlans } = await fetchTherapyPlansByStatus(therapistId);
        setPendingPlans(pendingPlans);
        setApprovedPlans(approvedPlans);
        setLoading(false);
      } catch (err) {
        setError('Failed to load therapy plans. Please try again later.');
        setLoading(false);
      }
    }

    loadTherapyPlans();
  }, [therapistId]);

  if (loading) return <LoadingSkeleton />;
  
  if (error) return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Therapy Plans Overview</h1>
      <PlanTable 
        plans={pendingPlans} 
        title="Pending Therapy Plans" 
        statusColor="bg-yellow-50"
      />
      <PlanTable 
        plans={approvedPlans} 
        title="Approved Therapy Plans" 
        statusColor="bg-green-50"
      />
    </div>
  );
}