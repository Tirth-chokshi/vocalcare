"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchClinicalRatings } from '@/actions/actions';

export default function ClinicalRatings() {
    const [clinicalRatings, setClinicalRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const result = await fetchClinicalRatings(page);
                if (result.success) {
                    setClinicalRatings(result.data);
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
            <h1 className="text-2xl font-bold mb-6">Clinical Ratings</h1>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Supervisor</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Therapist</TableHead>
                        <TableHead>Rating Score</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {clinicalRatings.map((rating) => (
                        <TableRow key={rating.id}>
                            <TableCell>{new Date(rating.ratingDate).toLocaleDateString()}</TableCell>
                            <TableCell>{rating.supervisor.user.username}</TableCell>
                            <TableCell>{rating.therapyPlan.patient.user.username}</TableCell>
                            <TableCell>{rating.therapyPlan.therapist.user.username}</TableCell>
                            <TableCell>{rating.ratingScore}</TableCell>
                            <TableCell>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">View More</Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>Clinical Rating Details</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-right font-medium">Date:</label>
                                                <div className="col-span-3">{new Date(rating.ratingDate).toLocaleString()}</div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-right font-medium">Supervisor:</label>
                                                <div className="col-span-3">{rating.supervisor.user.username}</div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-right font-medium">Patient:</label>
                                                <div className="col-span-3">{rating.therapyPlan.patient.user.username}</div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-right font-medium">Therapist:</label>
                                                <div className="col-span-3">{rating.therapyPlan.therapist.user.username}</div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-right font-medium">Rating Score:</label>
                                                <div className="col-span-3">{rating.ratingScore}</div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <label className="text-right font-medium">Feedback:</label>
                                                <div className="col-span-3">{rating.feedback}</div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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