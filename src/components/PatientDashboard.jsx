"use client"
import React, { useState, useEffect } from 'react';
// import { fetchComprehensivePatientData } from '@/actions/patientActions';
// import PatientTherapySchedule from './PatientTherapySchedule';
// import TherapyPlan from './TherapyPlan';
// import ProgressReports from './ProgressReports';
// import MedicationList from './MedicationList';
// import DiagnosesList from './DiagnosesList';

export default function PatientDashboard({ patientId }) {
    // const [patientData, setPatientData] = useState(null);
    // const [isLoading, setIsLoading] = useState(true);
    // const [error, setError] = useState(null);

    // useEffect(() => {
    //     async function loadPatientData() {
    //         try {
    //             const data = await fetchComprehensivePatientData(patientId);
    //             setPatientData(data);
    //         } catch (err) {
    //             setError('Failed to load patient data. Please try again later.');
    //             console.error('Error loading patient data:', err);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     }

    //     loadPatientData();
    // }, [patientId]);

    // if (isLoading) return <div>Loading patient dashboard...</div>;
    // if (error) return <div className="text-red-500">{error}</div>;

    // const { patient } = patientData;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Welcome Patient</h1>
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PatientTherapySchedule sessions={patient.therapySessions} />
                <TherapyPlan plan={patient.therapyPlans[0]} />
                <ProgressReports reports={patient.progressReports} />
                <MedicationList medications={patient.medications} />
                <DiagnosesList diagnoses={patient.diagnoses} />
            </div> */}
        </div>
    );
}