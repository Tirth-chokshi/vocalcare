"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUser, fetchTherapists, fetchPatients, allocatePatientToTherapist } from '@/actions/actions';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: '' });
    const [allocation, setAllocation] = useState({ patientId: '', therapistId: '' });
    const [therapists, setTherapists] = useState([]);
    const [patients, setPatients] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchTherapists().then(setTherapists);
        fetchPatients().then(setPatients);
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(newUser).forEach(([key, value]) => formData.append(key, value));
        
        const result = await createUser(formData);
        if (result.success) {
            setMessage('User created successfully');
            setNewUser({ username: '', email: '', password: '', role: '' });
        } else {
            setMessage('Failed to create user: ' + result.error);
        }
    };

    const handleAllocatePatient = async (e) => {
        e.preventDefault();
        const result = await allocatePatientToTherapist(allocation.patientId, allocation.therapistId);
        if (result.success) {
            setMessage('Patient allocated successfully');
            setAllocation({ patientId: '', therapistId: '' });
        } else {
            setMessage('Failed to allocate patient: ' + result.error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p className="mb-4">Welcome, {session?.user?.email}</p>

            {message && (
                <Alert className="mb-4">
                    <AlertTitle>Notification</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Create User</h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <Input
                            type="text"
                            placeholder="Username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            required
                        />
                        <Input
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            required
                        />
                        <Select
                            value={newUser.role}
                            onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="patient">Patient</SelectItem>
                                <SelectItem value="therapist">Therapist</SelectItem>
                                <SelectItem value="supervisor">Supervisor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button type="submit">Create User</Button>
                    </form>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2">Allocate Patient to Therapist</h2>
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
                                        {patient.user.username}
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
                                        {therapist.user.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button type="submit">Allocate Patient</Button>
                    </form>
                </div>
            </div>
        </div>
    );
}