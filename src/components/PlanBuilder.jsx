"use client"
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function PlanBuilder({ patients, onCreateTherapyPlan }) {
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [planData, setPlanData] = useState({
    goals: '',
    activities: '',
    startDate: '',
    endDate: '',
  })

  const patientsWithoutPlans = patients.filter(patient => !patient.therapyPlans || patient.therapyPlans.length === 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedPatient) {
      onCreateTherapyPlan(selectedPatient.id, planData)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPlanData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Create Therapy Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select onValueChange={(value) => setSelectedPatient(patientsWithoutPlans.find(p => p.id === parseInt(value)))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a patient" />
            </SelectTrigger>
            <SelectContent>
              {patientsWithoutPlans.map((patient) => (
                <SelectItem key={patient.id} value={patient.id.toString()}>
                  {patient.user?.username || 'Unnamed Patient'} - {patient.diagnosis}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPatient && (
            <Tabs defaultValue="goals" className="w-full">
              <TabsList>
                <TabsTrigger value="goals">Goals & Activities</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              <TabsContent value="goals">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goals">Goals</Label>
                    <Textarea
                      id="goals"
                      name="goals"
                      placeholder="Enter therapy goals"
                      value={planData.goals}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="activities">Activities</Label>
                    <Textarea
                      id="activities"
                      name="activities"
                      placeholder="Enter planned activities"
                      value={planData.activities}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="timeline">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={planData.startDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={planData.endDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <Button type="submit" disabled={!selectedPatient}>Create Plan</Button>
        </form>
      </CardContent>
    </Card>
  )
}