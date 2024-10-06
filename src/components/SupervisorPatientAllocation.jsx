"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchPatientAllocationData } from '@/actions/actions';

export default function SupervisorPatientAllocation() {
    const [allocationData, setAllocationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await fetchPatientAllocationData();
                if (result.success) {
                    setAllocationData(result.data);
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError('An error occurred while fetching data.');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Patient Allocation Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allocationData.map((therapist) => (
                    <Card key={therapist.id} className="mb-4">
                        <CardHeader>
                            <CardTitle>{therapist.user.username} - Therapist</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {therapist.patients.map((patient) => (
                                        <TableRow key={patient.id}>
                                            <TableCell>{patient.user.username}</TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">View Details</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl">
                                                        <DialogHeader>
                                                            <DialogTitle>{patient.user.username} - Patient Details</DialogTitle>
                                                        </DialogHeader>
                                                        <ScrollArea className="max-h-[80vh] overflow-y-auto">
                                                            <div className="space-y-4 p-4">
                                                                <h4 className="font-semibold">Therapy Plans</h4>
                                                                {patient.therapyPlans.length > 0 ? (
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead>Start Date</TableHead>
                                                                                <TableHead>End Date</TableHead>
                                                                                <TableHead>Goals</TableHead>
                                                                                <TableHead>Activities</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {patient.therapyPlans.map((plan) => (
                                                                                <TableRow key={plan.id}>
                                                                                    <TableCell>{new Date(plan.startDate).toLocaleDateString()}</TableCell>
                                                                                    <TableCell>{new Date(plan.endDate).toLocaleDateString()}</TableCell>
                                                                                    <TableCell>{plan.goals}</TableCell>
                                                                                    <TableCell>{plan.activities}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                ) : (
                                                                    <p>No active therapy plans.</p>
                                                                )}

                                                                <h4 className="font-semibold mt-4">Therapy Sessions</h4>
                                                                {patient.therapyPlans.some(plan => plan.therapySessions.length > 0) ? (
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead>Date</TableHead>
                                                                                <TableHead>Duration (minutes)</TableHead>
                                                                                <TableHead>Status</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {patient.therapyPlans.flatMap(plan => 
                                                                                plan.therapySessions.map(session => (
                                                                                    <TableRow key={session.id}>
                                                                                        <TableCell>{new Date(session.sessionDate).toLocaleString()}</TableCell>
                                                                                        <TableCell>{session.duration}</TableCell>
                                                                                        <TableCell>{session.status}</TableCell>
                                                                                    </TableRow>
                                                                                ))
                                                                            )}
                                                                        </TableBody>
                                                                    </Table>
                                                                ) : (
                                                                    <p>No therapy sessions recorded.</p>
                                                                )}
                                                            </div>
                                                        </ScrollArea>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}