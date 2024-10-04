import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { fetchTherapists, fetchPatients, allocatePatientToTherapist, fetchTherapyPlans, fetchClinicalRatings, reviewTherapyPlan, fetchOngoingTherapySessions, reviewTherapySession } from '@/actions/actions';
import PatientProgress from '@/components/PatientProgress';

export default function SupervisorDashboard() {
    const [therapists, setTherapists] = useState([]);
    const [patients, setPatients] = useState([]);
    const [therapyPlans, setTherapyPlans] = useState([]);
    const [clinicalRatings, setClinicalRatings] = useState([]);
    const [ongoingSessions, setOngoingSessions] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedTherapist, setSelectedTherapist] = useState(null);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [reviewComment, setReviewComment] = useState('');
    const [ratingScore, setRatingScore] = useState(0);
    const [sessionReviewDialogOpen, setSessionReviewDialogOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [sessionReviewComment, setSessionReviewComment] = useState('');

    useEffect(() => {
        const loadData = async () => {
            const therapistsData = await fetchTherapists();
            const patientsData = await fetchPatients();
            const therapyPlansData = await fetchTherapyPlans();
            const clinicalRatingsData = await fetchClinicalRatings();
            const ongoingSessionsData = await fetchOngoingTherapySessions();
            setTherapists(therapistsData);
            setPatients(patientsData);
            setTherapyPlans(therapyPlansData);
            setClinicalRatings(clinicalRatingsData);
            setOngoingSessions(ongoingSessionsData);
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
            const result = await reviewTherapyPlan(selectedPlan.id, reviewComment, ratingScore);
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

    const handleSessionReviewClick = (session) => {
        setSelectedSession(session);
        setSessionReviewDialogOpen(true);
    };

    const handleSessionReviewSubmit = async () => {
        if (selectedSession && sessionReviewComment) {
            const result = await reviewTherapySession(selectedSession.id, sessionReviewComment);
            if (result.success) {
                alert('Therapy session reviewed successfully');
                setSessionReviewDialogOpen(false);
                setSessionReviewComment('');
                // Refresh ongoing sessions
                const ongoingSessionsData = await fetchOngoingTherapySessions();
                setOngoingSessions(ongoingSessionsData);
            } else {
                alert('Failed to review therapy session: ' + result.error);
            }
        } else {
            alert('Please provide a review comment');
        }
    };


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Supervisor Dashboard</h1>

            {/* Patient Allocation Card */}
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

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Ongoing Therapy Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Therapist</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Start Time</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ongoingSessions.map((session) => (
                                <TableRow key={session.id}>
                                    <TableCell>{session.therapist.user.username}</TableCell>
                                    <TableCell>{session.patient.user.username}</TableCell>
                                    <TableCell>{new Date(session.startTime).toLocaleTimeString()}</TableCell>
                                    <TableCell>{session.duration} minutes</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleSessionReviewClick(session)}>Review</Button>
                                    </TableCell>
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
            <Dialog open={sessionReviewDialogOpen} onOpenChange={setSessionReviewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Therapy Session</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <h3 className="font-semibold mb-2">Therapist: {selectedSession?.therapist.user.username}</h3>
                        <h3 className="font-semibold mb-2">Patient: {selectedSession?.patient.user.username}</h3>
                        <h3 className="font-semibold mb-2">Start Time: {new Date(selectedSession?.startTime).toLocaleString()}</h3>
                        <h3 className="font-semibold mb-2">Duration: {selectedSession?.duration} minutes</h3>
                        <Textarea
                            placeholder="Enter your review comments here..."
                            value={sessionReviewComment}
                            onChange={(e) => setSessionReviewComment(e.target.value)}
                            className="mb-4"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSessionReviewDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSessionReviewSubmit}>Submit Review</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}