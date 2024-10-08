import React, { useState, useEffect } from 'react';
import { createTherapySession, fetchApprovedTherapyPlans, fetchPatientHistory } from '@/actions/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function SessionBuilder({ therapistId }) {
  const [approvedPlans, setApprovedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientHistory, setPatientHistory] = useState(null);
  const [formData, setFormData] = useState({
    planId: '',
    sessionDateTime: null,
    duration: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadApprovedPlans = async () => {
      try {
        const plans = await fetchApprovedTherapyPlans(therapistId);
        setApprovedPlans(plans);
        setLoading(false);
      } catch (error) {
        console.error('Error loading approved plans:', error);
        toast.error('Failed to load approved therapy plans');
        setLoading(false);
      }
    };

    loadApprovedPlans();
  }, [therapistId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateTimeSelect = (dateTime) => {
    setFormData(prev => ({ ...prev, sessionDateTime: dateTime }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.planId) newErrors.planId = "Please select a therapy plan";
    if (!formData.sessionDateTime) newErrors.sessionDateTime = "Session date and time is required";
    if (!formData.duration) newErrors.duration = "Duration is required";
    else if (formData.duration < 15) newErrors.duration = "Session must be at least 15 minutes";
    else if (formData.duration > 180) newErrors.duration = "Session cannot exceed 180 minutes";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const sessionData = {
          ...formData,
          therapistId // Add the therapistId to the session data
        };
        const result = await createTherapySession(sessionData);
        if (result.success) {
          toast.success('Therapy session created successfully');
          setFormData({
            planId: '',
            sessionDateTime: null,
            duration: '',
            notes: ''
          });
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Error creating therapy session:', error);
        toast.error('Failed to create therapy session');
      }
    }
  };

  const selectedPlanDetails = approvedPlans.find(plan => plan.id === parseInt(formData.planId));

  useEffect(() => {
    const loadPatientHistory = async () => {
      if (selectedPlanDetails) {
        try {
          const history = await fetchPatientHistory(selectedPlanDetails.patient.id);
          setPatientHistory(history);
        } catch (error) {
          console.error('Error loading patient history:', error);
          toast.error('Failed to load patient history');
        }
      }
    };

    loadPatientHistory();
  }, [selectedPlanDetails]);

  if (loading) return <div>Loading approved therapy plans...</div>;

  return (
    <div className="p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold mb-4">Create Therapy Session</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="planId" className="block text-sm font-medium mb-2">
            Select Therapy Plan
          </label>
          <Select
            name="planId"
            value={formData.planId}
            onValueChange={(value) => handleInputChange({ target: { name: 'planId', value } })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              {approvedPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toString()}>
                  {plan.patient.user.username} - {format(new Date(plan.startDate), 'PPP')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.planId && <p className="text-red-500 text-sm mt-1">{errors.planId}</p>}
        </div>

        {selectedPlanDetails && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="plan-details">
              <AccordionTrigger>Selected Plan Details</AccordionTrigger>
              <AccordionContent>
                <div className="p-4 rounded-md">
                  <p><strong>Patient:</strong> {selectedPlanDetails.patient.user.username}</p>
                  <p><strong>Goals:</strong> {selectedPlanDetails.goals}</p>
                  <p><strong>Activities:</strong> {selectedPlanDetails.activities}</p>
                  <p><strong>Start Date:</strong> {format(new Date(selectedPlanDetails.startDate), 'PPP')}</p>
                  <p><strong>End Date:</strong> {format(new Date(selectedPlanDetails.endDate), 'PPP')}</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {patientHistory && (
              <AccordionItem value="patient-history">
                <AccordionTrigger>Patient History</AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 rounded-md">
                    <p><strong>Total Sessions:</strong> {patientHistory.totalSessions}</p>
                    <p><strong>Last Session:</strong> {patientHistory.lastSession ? format(new Date(patientHistory.lastSession), 'PPP') : 'N/A'}</p>
                    <p><strong>Progress:</strong> {patientHistory.progress}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}

        <div>
          <label htmlFor="sessionDateTime" className="block text-sm font-medium mb-2">
            Session Date and Time
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={`w-full justify-start text-left font-normal ${!formData.sessionDateTime && "text-muted-foreground"}`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.sessionDateTime ? format(formData.sessionDateTime, "PPP HH:mm") : <span>Pick a date and time</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.sessionDateTime}
                onSelect={handleDateTimeSelect}
                initialFocus
              />
              <div className="p-2 border-t">
                <Input
                  type="time"
                  value={formData.sessionDateTime ? format(formData.sessionDateTime, "HH:mm") : ""}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const newDateTime = formData.sessionDateTime ? new Date(formData.sessionDateTime) : new Date();
                    newDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                    handleDateTimeSelect(newDateTime);
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
          {errors.sessionDateTime && <p className="text-red-500 text-sm mt-1">{errors.sessionDateTime}</p>}
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium mb-2">
            Duration (minutes)
          </label>
          <Input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            className="w-full"
          />
          {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            Session Notes
          </label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full"
            rows={4}
            placeholder="Enter any pre-session notes or objectives here..."
          />
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <div className="flex">
            <div className="py-1">
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-4" />
            </div>
            <div>
              <p className="font-bold">Important Reminder</p>
              <p className="text-sm">Ensure all necessary materials are prepared before starting the session. Review the patien&lsquo;s history and previous session notes if available.</p>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Create and Start Session
        </Button>
      </form>
    </div>
  );
}