"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchPatientProgressData } from '@/actions/actions';

export default function ProgressReport() {
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const result = await fetchPatientProgressData(page);
                if (result.success) {
                    setProgressData(result.data);
                    setPagination(result.pagination);
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
    }, [page]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Patient Progress Overview</h1>
            {progressData.map((patient) => (
                <Card key={patient.id} className="mb-6">
                    <CardHeader>
                        <CardTitle>{patient.user.username} - Patient</CardTitle>
                        <p>Therapist: {patient.assignedTherapist.user.username}</p>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="progress-report">
                                <AccordionTrigger>Latest Progress Report</AccordionTrigger>
                                <AccordionContent>
                                    {patient.progressReports.length > 0 ? (
                                        <div>
                                            <p><strong>Date:</strong> {new Date(patient.progressReports[0].reportDate).toLocaleDateString()}</p>
                                            <p><strong>Summary:</strong> {patient.progressReports[0].summary}</p>
                                            <p><strong>Overall Progress:</strong> {patient.progressReports[0].overallProgress}</p>
                                        </div>
                                    ) : (
                                        <p>No progress reports available.</p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="therapy-plans">
                                <AccordionTrigger>Active Therapy Plans</AccordionTrigger>
                                <AccordionContent>
                                    {patient.therapyPlans.length > 0 ? (
                                        patient.therapyPlans.map((plan) => (
                                            <div key={plan.id} className="mb-4">
                                                <h4 className="font-semibold">Plan Start Date: {new Date(plan.startDate).toLocaleDateString()}</h4>
                                                <p><strong>Goals:</strong> {plan.goals}</p>
                                                <p><strong>Activities:</strong> {plan.activities}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No active therapy plans.</p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="therapy-sessions">
                                <AccordionTrigger>Recent Therapy Sessions</AccordionTrigger>
                                <AccordionContent>
                                    {patient.therapyPlans.some(plan => plan.therapySessions.length > 0) ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Duration</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Progress Note</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {patient.therapyPlans.flatMap(plan => 
                                                    plan.therapySessions.map(session => (
                                                        <TableRow key={session.id}>
                                                            <TableCell>{new Date(session.sessionDate).toLocaleString()}</TableCell>
                                                            <TableCell>{session.duration} minutes</TableCell>
                                                            <TableCell>{session.status}</TableCell>
                                                            <TableCell>
                                                                {session.progressNote ? (
                                                                    <details>
                                                                        <summary>View Note</summary>
                                                                        <p><strong>Observations:</strong> {session.progressNote.observations}</p>
                                                                        <p><strong>Recommendations:</strong> {session.progressNote.recommendations}</p>
                                                                    </details>
                                                                ) : (
                                                                    'No note available'
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <p>No recent therapy sessions.</p>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            ))}
            {pagination && (
                <div className="flex justify-between items-center mt-4">
                    <Button 
                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <span>Page {page} of {pagination.totalPages}</span>
                    <Button 
                        onClick={() => setPage(prev => Math.min(prev + 1, pagination.totalPages))}
                        disabled={page === pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}