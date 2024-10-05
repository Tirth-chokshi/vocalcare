"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { createUser } from '@/actions/actions'; // Assuming you've placed the createUser function in this file

export default function CreateUser() {
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        role: '',
        dateOfBirth: '',
        diagnosis: '',
        specialization: '',
        yearsExperience: '',
        department: '',
        accessLevel: '',
    });
    const [message, setMessage] = useState('');

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(newUser).forEach(key => {
            formData.append(key, newUser[key]);
        });

        const result = await createUser(formData);
        if (result.success) {
            setMessage('User created successfully');
            setNewUser({
                username: '',
                email: '',
                password: '',
                role: '',
                dateOfBirth: '',
                diagnosis: '',
                specialization: '',
                yearsExperience: '',
                department: '',
                accessLevel: '',
            });
        } else {
            setMessage(`Failed to create user: ${result.error}`);
        }
    };

    const renderRoleSpecificFields = () => {
        switch(newUser.role) {
            case 'patient':
                return (
                    <>
                        <Input
                            type="date"
                            placeholder="Date of Birth"
                            value={newUser.dateOfBirth}
                            onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                            required
                        />
                        <Input
                            type="text"
                            placeholder="Diagnosis"
                            value={newUser.diagnosis}
                            onChange={(e) => setNewUser({ ...newUser, diagnosis: e.target.value })}
                            required
                        />
                    </>
                );
            case 'therapist':
                return (
                    <>
                        <Input
                            type="text"
                            placeholder="Specialization"
                            value={newUser.specialization}
                            onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                            required
                        />
                        <Input
                            type="number"
                            placeholder="Years of Experience"
                            value={newUser.yearsExperience}
                            onChange={(e) => setNewUser({ ...newUser, yearsExperience: e.target.value })}
                            required
                        />
                    </>
                );
            case 'supervisor':
            case 'admin':
                return (
                    <>
                        <Input
                            type="text"
                            placeholder="Department"
                            value={newUser.department}
                            onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                            required
                        />
                        {newUser.role === 'admin' && (
                            <Input
                                type="text"
                                placeholder="Access Level"
                                value={newUser.accessLevel}
                                onChange={(e) => setNewUser({ ...newUser, accessLevel: e.target.value })}
                                required
                            />
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Create User</h2>
            {message && (
                <Alert className="mb-4">
                    <AlertTitle>Notification</AlertTitle>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}
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
                {renderRoleSpecificFields()}
                <Button type="submit">Create User</Button>
            </form>
        </div>
    );
}