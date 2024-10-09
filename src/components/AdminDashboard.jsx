"use client"
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster, toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import CreateUser from './CreateUser';
import UserTable from './UserTable';
import { fetchTherapists, fetchPatients, fetchSupervisors, allocatePatientToTherapist, fetchDetailedUserData } from '@/actions/actions';

export default function AdminDashboard() {
    const [allocation, setAllocation] = useState({ patientId: '', therapistId: '' });
    const [therapists, setTherapists] = useState([]);
    const [patients, setPatients] = useState([]);
    const [supervisors, setSupervisors] = useState([]);
    const [detailedUserData, setDetailedUserData] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

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
            // Refresh the patient and therapist lists
            const [updatedPatients, updatedTherapists] = await Promise.all([fetchPatients(), fetchTherapists()]);
            setPatients(updatedPatients);
            setTherapists(updatedTherapists);
        } else {
            toast.error('Failed to allocate patient: ' + result.error);
        }
    };

    const handleViewMore = async (userId, userType) => {
        try {
            const result = await fetchDetailedUserData(userId, userType);
            if (result.success) {
                setDetailedUserData(result.userData);
                setIsDialogOpen(true);
                toast.info(`Viewing more details for ${userType} with ID: ${userId}`);
            } else {
                toast.error('Failed to fetch user details: ' + result.error);
            }
        } catch (error) {
            console.error('Error in handleViewMore:', error);
            toast.error('An error occurred while fetching user details');
        }
    };

    const renderDetailedUserData = () => {
        if (!detailedUserData) return null;

        const { user, ...specificData } = detailedUserData;

        return (
            <div className="space-y-4">
                <p>Username: {user.username}</p>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <p>Created At: {new Date(user.createdAt).toLocaleString()}</p>
                <p>Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>

                {user.role === 'patient' && (
                    <>
                        <h3 className="text-lg font-semibold">Patient Details</h3>
                        <p>Date of Birth: {new Date(specificData.dateOfBirth).toLocaleDateString()}</p>
                        <p>Diagnosis: {specificData.diagnosis}</p>
                        <p>Assigned Therapist: {specificData?.assignedTherapist?.user?.username || 'Not Assigned'}</p>
                        <h4>Therapy Plans: {specificData?.therapyPlans?.length || 'No Plans'}</h4>
                        <h4>Progress Reports: {specificData?.progressReports?.length || 'No Reports'}</h4>
                    </>
                )}

                {user.role === 'therapist' && (
                    <>
                        <h3 className="text-lg font-semibold">Therapist Details</h3>
                        <p>Specialization: {specificData.specialization}</p>
                        <p>Years of Experience: {specificData.yearsExperience}</p>
                        <h4>Patients: {specificData.patients.length}</h4>
                        <h4>Therapy Plans: {specificData.therapyPlans.length}</h4>
                    </>
                )}

                {user.role === 'supervisor' && (
                    <>
                        <h3 className="text-lg font-semibold">Supervisor Details</h3>
                        <p>Department: {specificData.department}</p>
                        <h4>Clinical Ratings: {specificData.ratings.length}</h4>
                    </>
                )}
            </div>
        );
    };

    // Sort patients: unallocated first, then by creation date
    const sortedPatients = [...patients].sort((a, b) => {
        if (!a.therapistId && b.therapistId) return -1;
        if (a.therapistId && !b.therapistId) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Sort therapists by number of patients (ascending)
    const sortedTherapists = [...therapists].sort((a, b) => a.patientCount - b.patientCount);

    return (
        <div className="container mx-auto p-4">
            <Toaster />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <CreateUser />

                <div className="p-4 rounded-lg shadow">
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
                                {sortedPatients.map((patient) => (
                                    <SelectItem 
                                        key={patient.id} 
                                        value={patient.id.toString()}
                                        className={!patient.therapistId ? "font-bold" : ""}
                                    >
                                        {patient.username} {!patient.therapistId ? "(Unallocated)" : ""}
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
                                {sortedTherapists.map((therapist, index) => (
                                    <SelectItem 
                                        key={therapist.id} 
                                        value={therapist.id.toString()}
                                        className={index < 3 ? "bg-muted" : ""}
                                    >
                                        {therapist.username} ({therapist.patientCount} patients)
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
                    <h2 className="text-2xl font-bold mb-4">Supervisors</h2>
                    <UserTable users={supervisors} userType="supervisor" onViewMore={handleViewMore} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Therapists</h2>
                    <UserTable users={therapists} userType="therapist" onViewMore={handleViewMore} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Patients</h2>
                    <UserTable users={patients} userType="patient" onViewMore={handleViewMore} />
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            {renderDetailedUserData()}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}