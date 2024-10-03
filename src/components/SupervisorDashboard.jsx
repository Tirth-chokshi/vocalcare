"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchTherapists, fetchPatients, allocatePatientToTherapist } from '@/actions/actions';

export default function SupervisorDashboard() {
    const [therapists, setTherapists] = useState([]);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedTherapist, setSelectedTherapist] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const therapistsData = await fetchTherapists();
            const patientsData = await fetchPatients();
            setTherapists(therapistsData);
            setPatients(patientsData);
        };
        loadData();
    }, []);

    const handleAllocate = async () => {
        if (selectedPatient && selectedTherapist) {
            const result = await allocatePatientToTherapist(selectedPatient, selectedTherapist);
            if (result.success) {
                alert('Patient allocated successfully');
                // Refresh patient list
                const patientsData = await fetchPatients();
                setPatients(patientsData);
            } else {
                alert('Failed to allocate patient: ' + result.error);
            }
        } else {
            alert('Please select both a patient and a therapist');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Supervisor Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Select Patient:</h3>
                            <select 
                                className="w-full p-2 border rounded"
                                onChange={(e) => setSelectedPatient(e.target.value)}
                            >
                                <option value="">Select a patient</option>
                                {patients.map((patient) => (
                                    <option key={patient.id} value={patient.id}>
                                        {patient.user.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Select Therapist:</h3>
                            <select 
                                className="w-full p-2 border rounded"
                                onChange={(e) => setSelectedTherapist(e.target.value)}
                            >
                                <option value="">Select a therapist</option>
                                {therapists.map((therapist) => (
                                    <option key={therapist.id} value={therapist.id}>
                                        {therapist.user.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button onClick={handleAllocate}>Allocate Patient</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Therapy Plans to Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Therapist</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* This would be populated with actual therapy plans */}
                                <TableRow>
                                    <TableCell>Sarah</TableCell>
                                    <TableCell>John Doe</TableCell>
                                    <TableCell>Pending Review</TableCell>
                                    <TableCell>
                                        <Button variant="outline">Review</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Recent Clinical Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Therapist</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* This would be populated with actual clinical ratings */}
                            <TableRow>
                                <TableCell>Sarah</TableCell>
                                <TableCell>4.5/5</TableCell>
                                <TableCell>2024-05-01</TableCell>
                                <TableCell>
                                    <Button variant="outline">View Details</Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}