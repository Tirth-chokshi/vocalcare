"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toaster, toast } from 'sonner';
import { fetchTherapyPlansForReview, submitTherapyPlanReview } from '@/actions/actions';
import { useSession } from 'next-auth/react';

export default function SupervisorDashboard() {
    const {data: session, status} = useSession
  const [therapyPlans, setTherapyPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [review, setReview] = useState({ ratingScore: '', feedback: '' });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const plans = await fetchTherapyPlansForReview();
      setTherapyPlans(plans);
    } catch (error) {
      console.error('Error fetching therapy plans:', error);
      toast.error('Failed to fetch therapy plans. Please try again.');
    }
  };

  const handleReview = (plan) => {
    setSelectedPlan(plan);
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    try {
      const result = await submitTherapyPlanReview(selectedPlan.id, review.ratingScore, review.feedback);
      if (result.success) {
        toast.success('Therapy plan review submitted successfully');
        setIsReviewDialogOpen(false);
        fetchPlans();
      } else {
        toast.error('Failed to submit therapy plan review: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting therapy plan review:', error);
      toast.error('An error occurred while submitting the review');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6">Supervisor Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Therapy Plans for Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Therapist</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Goals</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {therapyPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>{plan.patient.user.username}</TableCell>
                  <TableCell>{plan.therapist.user.username}</TableCell>
                  <TableCell>{new Date(plan.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{plan.goals}</TableCell>
                  <TableCell>
                    <Button onClick={() => handleReview(plan)}>Review</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Review Therapy Plan</DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Patient:</Label>
                  <p>{selectedPlan.patient.user.username}</p>
                </div>
                <div>
                  <Label className="font-bold">Therapist:</Label>
                  <p>{selectedPlan.therapist.user.username}</p>
                </div>
                <div>
                  <Label className="font-bold">Diagnosis:</Label>
                  <p>{selectedPlan.patient.diagnosis}</p>
                </div>
               
                <div>
                  <Label className="font-bold">Start Date:</Label>
                  <p>{new Date(selectedPlan.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-bold">End Date:</Label>
                  <p>{new Date(selectedPlan.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <Label className="font-bold">Goals:</Label>
                <p>{selectedPlan.goals}</p>
              </div>
              <div>
                <Label className="font-bold">Activities:</Label>
                <p>{selectedPlan.activities}</p>
              </div>
              <div>
                <Label htmlFor="rating" className="font-bold">Rating Score (1-10)</Label>
                <Input 
                  id="rating" 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={review.ratingScore} 
                  onChange={(e) => setReview({...review, ratingScore: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="feedback" className="font-bold">Feedback</Label>
                <Textarea 
                  id="feedback" 
                  value={review.feedback} 
                  onChange={(e) => setReview({...review, feedback: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSubmitReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}