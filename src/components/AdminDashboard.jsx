
"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster, toast } from 'sonner';
import CreateUser from './CreateUser';
import UserTable from './UserTable';
import { fetchTherapists, fetchPatients, fetchSupervisors, allocatePatientToTherapist } from '@/actions/actions';

export default function AdminDashboard() {
    const [allocation, setAllocation] = useState({ patientId: '', therapistId: '' });
    const [therapists, setTherapists] = useState([]);
    const [patients, setPatients] = useState([]);
    const [supervisors, setSupervisors] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [therapistsData, patientsData, supervisorsData] = await Promise.all([
                    fetchTherapists(),
                    fetchPatients(),
                    fetchSupervisors()
                ]);
                setTherapists(therapistsData);
                setPatients(patientsData);
                setSupervisors(supervisorsData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to fetch data. Please try again.');
            }
        };

        fetchData();
    }, []);

    const handleAllocatePatient = async (e) => {
        e.preventDefault();
        const result = await allocatePatientToTherapist(allocation.patientId, allocation.therapistId);
        if (result.success) {
            toast.success('Patient allocated successfully');
            setAllocation({ patientId: '', therapistId: '' });
        } else {
            toast.error('Failed to allocate patient: ' + result.error);
        }
    };

    const handleViewMore = (userId, userType) => {
        toast.info(`Viewing more details for ${userType} with ID: ${userId}`);
    };

    return (
        <div className="container mx-auto p-4">
            <Toaster />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <CreateUser />

                <div className="p-4  rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Allocate Patient to Therapist</h2>
                    <form onSubmit={handleAllocatePatient} className="space-y-4">
                        <Select
                            value={allocation.patientId}
                            onValueChange={(value) => setAllocation({ ...allocation, patientId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                            <SelectContent>
                                {patients.map((patient) => (
                                    <SelectItem key={patient.id} value={patient.id.toString()}>
                                        {patient.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={allocation.therapistId}
                            onValueChange={(value) => setAllocation({ ...allocation, therapistId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select therapist" />
                            </SelectTrigger>
                            <SelectContent>
                                {therapists.map((therapist) => (
                                    <SelectItem key={therapist.id} value={therapist.id.toString()}>
                                        {therapist.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="submit">Allocate Patient</Button>
                    </form>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Patients</h2>
                    <UserTable users={patients} userType="patient" onViewMore={handleViewMore} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Therapists</h2>
                    <UserTable users={therapists} userType="therapist" onViewMore={handleViewMore} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Supervisors</h2>
                    <UserTable users={supervisors} userType="supervisor" onViewMore={handleViewMore} />
                </div>
            </div>
        </div>
    );
}