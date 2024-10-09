"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AllocatedPatientsList({ patients }) {
  const [viewMode, setViewMode] = useState('dialog'); // 'dialog' or 'sheet'

  return (
    <div className="space-y-4">
      {/* <div className="flex justify-end mb-4">
        <Button
          onClick={() => setViewMode(viewMode === 'dialog' ? 'sheet' : 'dialog')}
          variant="outline"
        >
          Switch to {viewMode === 'dialog' ? 'Sheet' : 'Dialog'} View
        </Button>
      </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <Card key={patient.id}>
            <CardHeader>
              <CardTitle>{patient.user?.username || 'Unnamed Patient'}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* <p>Email: {patient.user?.email || 'Not provided'}</p> */}
              <p>Diagnosis: {patient.diagnosis || 'Not specified'}</p>
              {(patient.therapyPlans?.length ?? 0) > 0 ? (
                <p>Therapy Plan: Created</p>
              ) : (
                // <Dialog>
                //   <DialogTrigger asChild>
                //     <Button className="mt-2">Create Therapy Plan</Button>
                //   </DialogTrigger>
                //   <DialogContent>
                //     <DialogHeader>
                //       <DialogTitle>Create Therapy Plan for {patient.user?.username || 'Patient'}</DialogTitle>
                //     </DialogHeader>
                //     <TherapyPlanForm onSubmit={(planData) => onCreateTherapyPlan(patient.id, planData)} />
                //   </DialogContent>
                // </Dialog>
                <p>no active therapy plan</p>
              )}
              {viewMode === 'dialog' ? (
                <DialogDetailView patient={patient} />
              ) : (
                <SheetDetailView patient={patient} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DialogDetailView({ patient }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-2">View More</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{patient.user?.username || 'Patient'}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-2">Patient Details</h4>
            <p>Email: {patient.user?.email || 'Not provided'}</p>
            <p>Date of Birth: {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
            <p>Diagnosis: {patient.diagnosis || 'Not specified'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Therapy Plans</h4>
            {patient.therapyPlans && patient.therapyPlans.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goals</TableHead>
                    <TableHead>Activities</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.therapyPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.goals || 'Not specified'}</TableCell>
                      <TableCell>{plan.activities || 'Not specified'}</TableCell>
                      <TableCell>{plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'Not set'}</TableCell>
                      <TableCell>{plan.endDate ? new Date(plan.endDate).toLocaleDateString() : 'Not set'}</TableCell>
                      <TableCell>{plan.status || 'Unknown'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No therapy plans created yet.</p>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Therapy Sessions</h4>
            {patient.therapyPlans && patient.therapyPlans.some(plan => plan.therapySessions && plan.therapySessions.length > 0) ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.therapyPlans.flatMap(plan => plan.therapySessions || []).map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.sessionDate ? new Date(session.sessionDate).toLocaleDateString() : 'Not set'}</TableCell>
                      <TableCell>{session.duration ? `${session.duration} minutes` : 'Not specified'}</TableCell>
                      <TableCell>{session.status || 'Unknown'}</TableCell>
                      <TableCell>{session.progressNote?.observations || 'No notes'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No therapy sessions recorded yet.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SheetDetailView({ patient }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="mt-2">View More</Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] md:w-[720px]">
        <SheetHeader>
          <SheetTitle>{patient.user?.username || 'Patient'} Details</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-2">Patient Details</h4>
            <p>Email: {patient.user?.email || 'Not provided'}</p>
            <p>Date of Birth: {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
            <p>Diagnosis: {patient.diagnosis || 'Not specified'}</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Therapy Plans</h4>
            {patient.therapyPlans && patient.therapyPlans.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goals</TableHead>
                    <TableHead>Activities</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.therapyPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>{plan.goals || 'Not specified'}</TableCell>
                      <TableCell>{plan.activities || 'Not specified'}</TableCell>
                      <TableCell>{plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'Not set'}</TableCell>
                      <TableCell>{plan.endDate ? new Date(plan.endDate).toLocaleDateString() : 'Not set'}</TableCell>
                      <TableCell>{plan.status || 'Unknown'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No therapy plans created yet.</p>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Therapy Sessions</h4>
            {patient.therapyPlans && patient.therapyPlans.some(plan => plan.therapySessions && plan.therapySessions.length > 0) ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patient.therapyPlans.flatMap(plan => plan.therapySessions || []).map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.sessionDate ? new Date(session.sessionDate).toLocaleDateString() : 'Not set'}</TableCell>
                      <TableCell>{session.duration ? `${session.duration} minutes` : 'Not specified'}</TableCell>
                      <TableCell>{session.status || 'Unknown'}</TableCell>
                      <TableCell>{session.progressNote?.observations || 'No notes'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p>No therapy sessions recorded yet.</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
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