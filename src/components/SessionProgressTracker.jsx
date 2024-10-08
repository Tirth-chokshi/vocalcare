"use client"
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { fetchApprovedTherapyPlansTherapist, updateSessionStatus, updateSessionNotes } from '@/actions/actions';
import { toast } from 'sonner';

const SessionProgressTracker = ({ therapistId }) => {
    const [activeTab, setActiveTab] = useState("scheduled");
    const [searchTerm, setSearchTerm] = useState("");
    const [sessions, setSessions] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date());
    const [useCalendarFilter, setUseCalendarFilter] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [observations, setObservations] = useState("");
    const [recommendations, setRecommendations] = useState("");

    useEffect(() => {
        loadSessions();
    }, [therapistId, date, useCalendarFilter]);

    useEffect(() => {
        filterSessions();
    }, [sessions, activeTab, searchTerm, date, useCalendarFilter]);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const dateString = format(date, 'yyyy-MM-dd');
            const plans = await fetchApprovedTherapyPlansTherapist(therapistId, useCalendarFilter ? dateString : null);
            const allSessions = plans.flatMap(plan =>
                plan.therapySessions.map(session => ({
                    ...session,
                    patientName: plan.patient.user.username,
                    planId: plan.id
                }))
            );
            setSessions(allSessions);
            console.log('Loaded sessions:', allSessions);
        } catch (error) {
            console.error('Error loading sessions:', error);
            toast.error('Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    const filterSessions = () => {
        let filtered = sessions;

        if (searchTerm) {
            filtered = filtered.filter(session =>
                session.patientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        filtered = filtered.filter(session =>
            (activeTab === "scheduled" && session.status === "scheduled") ||
            (activeTab === "completed" && session.status === "completed")
        );

        if (useCalendarFilter && date) {
            const selectedDate = format(date, 'yyyy-MM-dd');
            filtered = filtered.filter(session =>
                format(new Date(session.sessionDate), 'yyyy-MM-dd') === selectedDate
            );
        }

        setFilteredSessions(filtered);
        console.log('Filtered sessions:', filtered);
    };


    const handleCompleteSession = (session) => {
        setSelectedSession(session)
        setObservations(session.progressNote?.observations || "")
        setRecommendations(session.progressNote?.recommendations || "")
        setDialogOpen(true)
    }

    const handleSubmitCompletion = async () => {
        try {
            await updateSessionStatus(selectedSession.id, "completed")
            await updateSessionNotes(selectedSession.id, observations, recommendations)
            await loadSessions()
            setDialogOpen(false)
            toast.success('Session marked as completed and notes updated')
        } catch (error) {
            console.error('Error completing session:', error)
            toast.error('Failed to complete session')
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <Button
                        variant={useCalendarFilter ? "default" : "outline"}
                        onClick={() => setUseCalendarFilter(!useCalendarFilter)}
                    >
                        {useCalendarFilter ? "Using Calendar Filter" : "Show All Sessions"}
                    </Button>
                    {useCalendarFilter && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[280px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
                <Input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="scheduled">
                    {loading ? (
                        <p>Loading scheduled sessions...</p>
                    ) : filteredSessions.length === 0 ? (
                        <p>No scheduled sessions found.</p>
                    ) : (
                        filteredSessions.map(session => (
                            <Card key={session.id} className="mb-4">
                                <CardHeader>
                                    <CardTitle>{session.patientName}</CardTitle>
                                    <CardDescription>
                                        Date: {new Date(session.sessionDate).toLocaleString()}
                                        <br />
                                        Duration: {session.duration} minutes
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Button onClick={() => handleCompleteSession(session)}>
                                        Mark as Completed
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="completed">
                    {loading ? (
                        <p>Loading completed sessions...</p>
                    ) : filteredSessions.length === 0 ? (
                        <p>No completed sessions found.</p>
                    ) : (
                        filteredSessions.map(session => (
                            <Card key={session.id} className="mb-4">
                                <CardHeader>
                                    <CardTitle>{session.patientName}</CardTitle>
                                    <CardDescription>
                                        Date: {new Date(session.sessionDate).toLocaleString()}
                                        <br />
                                        Duration: {session.duration} minutes
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid w-full gap-4">
                                        <div className="flex flex-col space-y-1.5">
                                            <Label>Observations</Label>
                                            <p>{session.progressNote?.observations || 'No observations recorded'}</p>
                                        </div>
                                        <div className="flex flex-col space-y-1.5">
                                            <Label>Recommendations</Label>
                                            <p>{session.progressNote?.recommendations || 'No recommendations recorded'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Session</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="observations">Observations</Label>
                            <Textarea
                                id="observations"
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="recommendations">Recommendations</Label>
                            <Textarea
                                id="recommendations"
                                value={recommendations}
                                onChange={(e) => setRecommendations(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmitCompletion}>Submit and Complete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default SessionProgressTracker