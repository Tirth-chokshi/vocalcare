import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { fetchTherapists, fetchPatients, allocatePatientToTherapist, fetchTherapyPlans, fetchClinicalRatings, reviewTherapyPlan } from '@/actions/actions';
import PatientProgress from './PatientProgress';

export default function SupervisorDashboard() {
    const [therapists, setTherapists] = useState([]);
    const [patients, setPatients] = useState([]);
    const [therapyPlans, setTherapyPlans] = useState([]);
    const [clinicalRatings, setClinicalRatings] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [reviewComment, setReviewComment] = useState('');
    const [ratingScore, setRatingScore] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            const therapistsData = await fetchTherapists();
            const patientsData = await fetchPatients();
            const therapyPlansData = await fetchTherapyPlans();
            const clinicalRatingsData = await fetchClinicalRatings();
            setTherapists(therapistsData);
            setPatients(patientsData);
            setTherapyPlans(therapyPlansData);
            setClinicalRatings(clinicalRatingsData);
        };
        loadData();
    }, []);

    const handleAllocate = async () => {
        if (selectedPatient && selectedTherapist) {
            const result = await allocatePatientToTherapist(selectedPatient, selectedTherapist);
            if (result.success) {
                alert('Patient allocated successfully');
                const patientsData = await fetchPatients();
                setPatients(patientsData);
            } else {
                alert('Failed to allocate patient: ' + result.error);
            }
        } else {
            alert('Please select both a patient and a therapist');
        }
    };

    const handleReviewClick = (plan) => {
        setSelectedPlan(plan);
        setReviewDialogOpen(true);
    };

    const handleReviewSubmit = async () => {
        if (selectedPlan && reviewComment && ratingScore) {
            const result = await reviewTherapyPlan(selectedPlan.id, reviewComment, ratingScore, 1); // Assuming supervisor ID is 1
            if (result.success) {
                alert('Therapy plan reviewed successfully');
                setReviewDialogOpen(false);
                setReviewComment('');
                setRatingScore(0);
                // Refresh therapy plans and clinical ratings
                const therapyPlansData = await fetchTherapyPlans();
                const clinicalRatingsData = await fetchClinicalRatings();
                setTherapyPlans(therapyPlansData);
                setClinicalRatings(clinicalRatingsData);
            } else {
                alert('Failed to review therapy plan: ' + result.error);
            }
        } else {
            alert('Please provide a review comment and rating score');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Supervisor Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                                {therapyPlans.map((plan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell>{plan.therapist.user.username}</TableCell>
                                        <TableCell>{plan.patient.user.username}</TableCell>
                                        <TableCell>{plan.status}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" onClick={() => handleReviewClick(plan)}>Review</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <PatientProgress />

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Recent Clinical Ratings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Therapist</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clinicalRatings.map((rating) => (
                                <TableRow key={rating.id}>
                                    <TableCell>{rating.therapyPlan.therapist.user.username}</TableCell>
                                    <TableCell>{rating.therapyPlan.patient.user.username}</TableCell>
                                    <TableCell>{rating.ratingScore}/5</TableCell>
                                    <TableCell>{new Date(rating.ratingDate).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Therapy Plan</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <h3 className="font-semibold mb-2">Therapist: {selectedPlan?.therapist.user.username}</h3>
                        <h3 className="font-semibold mb-2">Patient: {selectedPlan?.patient.user.username}</h3>
                        <h3 className="font-semibold mb-2">Goals: {selectedPlan?.goals}</h3>
                        <h3 className="font-semibold mb-2">Activities: {selectedPlan?.activities}</h3>
                        <Textarea
                            placeholder="Enter your review comments here..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="mb-4"
                        />
                        <Input
                            type="number"
                            placeholder="Rating Score (1-5)"
                            min="1"
                            max="5"
                            value={ratingScore}
                            onChange={(e) => setRatingScore(parseInt(e.target.value))}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleReviewSubmit}>Submit Review</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}