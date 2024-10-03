"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchPatients, fetchTherapyPlans } from '@/actions/actions';

export default function PatientProgress() {
    const [patients, setPatients] = useState([]);
    const [therapyPlans, setTherapyPlans] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const patientsData = await fetchPatients();
            const therapyPlansData = await fetchTherapyPlans();
            setPatients(patientsData);
            setTherapyPlans(therapyPlansData);
        };
        loadData();
    }, []);

    const getPatientProgress = (patientId) => {
        const patientPlans = therapyPlans.filter(plan => plan.patientId === patientId);
        const completedPlans = patientPlans.filter(plan => plan.status === 'Completed');
        return {
            totalPlans: patientPlans.length,
            completedPlans: completedPlans.length,
            progressPercentage: patientPlans.length > 0 
                ? ((completedPlans.length / patientPlans.length) * 100).toFixed(2)
                : 0
        };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Patient Progress</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Patient Name</TableHead>
                            <TableHead>Assigned Therapist</TableHead>
                            <TableHead>Total Plans</TableHead>
                            <TableHead>Completed Plans</TableHead>
                            <TableHead>Progress</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {patients.map((patient) => {
                            const progress = getPatientProgress(patient.id);
                            return (
                                <TableRow key={patient.id}>
                                    <TableCell>{patient.user.username}</TableCell>
                                    <TableCell>{patient.assignedTherapist?.user.username || 'Unassigned'}</TableCell>
                                    <TableCell>{progress.totalPlans}</TableCell>
                                    <TableCell>{progress.completedPlans}</TableCell>
                                    <TableCell>{progress.progressPercentage}%</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}