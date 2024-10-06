"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
            {allocationData.map((therapist) => (
                <Card key={therapist.id} className="mb-6">
                    <CardHeader>
                        <CardTitle>{therapist.user.username} - Therapist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible>
                            {therapist.patients.map((patient) => (
                                <AccordionItem key={patient.id} value={`patient-${patient.id}`}>
                                    <AccordionTrigger>{patient.user.username} - Patient</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4">
                                            <div>
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
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">Therapy Sessions</h4>
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
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}