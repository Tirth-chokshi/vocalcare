import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { fetchAllocatedPatients} from '@/actions/actions';
import PatientProgress from '@/components/PatientProgress';

export default function TherapistDashboard() {
    const [allocatedPatients, setAllocatedPatients] = useState([]);
    const [therapyPlans, setTherapyPlans] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [planDialogOpen, setPlanDialogOpen] = useState(false);
    const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
    const [planGoals, setPlanGoals] = useState('');
    const [planActivities, setPlanActivities] = useState('');
    const [sessionDuration, setSessionDuration] = useState(0);
    const [sessionNotes, setSessionNotes] = useState('');

    useEffect(() => {
        const loadData = async () => {
            const patientsData = await fetchAllocatedPatients();
            const therapyPlansData = await fetchTherapyPlans();
            setAllocatedPatients(patientsData);
            setTherapyPlans(therapyPlansData);
        };
        loadData();
    }, []);

    const handleCreatePlan = async () => {
        if (selectedPatient && planGoals && planActivities) {
            const result = await createTherapyPlan(selectedPatient.id, planGoals, planActivities);
            if (result.success) {
                alert('Therapy plan created successfully');
                setPlanDialogOpen(false);
                const therapyPlansData = await fetchTherapyPlans();
                setTherapyPlans(therapyPlansData);
            } else {
                alert('Failed to create therapy plan: ' + result.error);
            }
        } else {
            alert('Please fill in all fields');
        }
    };

    const handleCreateSession = async () => {
        if (selectedPatient && sessionDuration && sessionNotes) {
            const result = await createTherapySession(selectedPatient.id, sessionDuration, sessionNotes);
            if (result.success) {
                alert('Therapy session recorded successfully');
                setSessionDialogOpen(false);
                // Optionally, refresh therapy plans or patient data here
            } else {
                alert('Failed to record therapy session: ' + result.error);
            }
        } else {
            alert('Please fill in all fields');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Therapist Dashboard</h1>
{/*             
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Allocated Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Diagnosis</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allocatedPatients.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell>{patient.user.username}</TableCell>
                                        <TableCell>{patient.diagnosis}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" onClick={() => {
                                                setSelectedPatient(patient);
                                                setPlanDialogOpen(true);
                                            }}>Create Plan</Button>
                                            <Button variant="outline" className="ml-2" onClick={() => {
                                                setSelectedPatient(patient);
                                                setSessionDialogOpen(true);
                                            }}>Record Session</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Therapy Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Goals</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {therapyPlans.map((plan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell>{plan.patient.user.username}</TableCell>
                                        <TableCell>{plan.goals}</TableCell>
                                        <TableCell>{plan.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div> */}

            <PatientProgress allocatedPatients={allocatedPatients} />
            {/* <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Therapy Plan</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <h3 className="font-semibold mb-2">Patient: {selectedPatient?.user.username}</h3>
                        <Textarea
                            placeholder="Enter therapy goals..."
                            value={planGoals}
                            onChange={(e) => setPlanGoals(e.target.value)}
                            className="mb-4"
                        />
                        <Textarea
                            placeholder="Enter planned activities..."
                            value={planActivities}
                            onChange={(e) => setPlanActivities(e.target.value)}
                            className="mb-4"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreatePlan}>Create Plan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Therapy Session</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <h3 className="font-semibold mb-2">Patient: {selectedPatient?.user.username}</h3>
                        <Input
                            type="number"
                            placeholder="Session duration (minutes)"
                            value={sessionDuration}
                            onChange={(e) => setSessionDuration(parseInt(e.target.value))}
                            className="mb-4"
                        />
                        <Textarea
                            placeholder="Session notes..."
                            value={sessionNotes}
                            onChange={(e) => setSessionNotes(e.target.value)}
                            className="mb-4"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateSession}>Record Session</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}

        </div>
    );
}