const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcryptjs')

async function main() {
    const saltRounds = 10

    try {
        // Insert Users
        const users = await prisma.user.createMany({
            data: [
                { email: 'john.doe@example.com', password: await bcrypt.hash('therapist', saltRounds), username: 'john_doe', role: 'therapist', createdAt: new Date('2023-01-01'), lastLogin: new Date('2023-05-15 09:00:00') },
                { email: 'jane.smith@example.com', password: await bcrypt.hash('therapist', saltRounds), username: 'jane_smith', role: 'therapist', createdAt: new Date('2023-01-02'), lastLogin: new Date('2023-05-15 10:00:00') },
                { email: 'mike.johnson@example.com', password: await bcrypt.hash('therapist', saltRounds), username: 'mike_johnson', role: 'therapist', createdAt: new Date('2023-01-03'), lastLogin: new Date('2023-05-15 11:00:00') },
                { email: 'sarah.williams@example.com', password: await bcrypt.hash('therapist', saltRounds), username: 'sarah_williams', role: 'therapist', createdAt: new Date('2023-01-04'), lastLogin: new Date('2023-05-15 12:00:00') },
                { email: 'robert.brown@example.com', password: await bcrypt.hash('supervisor', saltRounds), username: 'robert_brown', role: 'supervisor', createdAt: new Date('2023-01-05'), lastLogin: new Date('2023-05-15 13:00:00') },
                { email: 'emily.davis@example.com', password: await bcrypt.hash('supervisor', saltRounds), username: 'emily_davis', role: 'supervisor', createdAt: new Date('2023-01-06'), lastLogin: new Date('2023-05-15 14:00:00') },
                { email: 'david.wilson@example.com', password: await bcrypt.hash('patient', saltRounds), username: 'david_wilson', role: 'patient', createdAt: new Date('2023-01-07'), lastLogin: new Date('2023-05-15 15:00:00') },
                { email: 'lisa.taylor@example.com', password: await bcrypt.hash('patient', saltRounds), username: 'lisa_taylor', role: 'patient', createdAt: new Date('2023-01-08'), lastLogin: new Date('2023-05-15 16:00:00') },
                { email: 'michael.anderson@example.com', password: await bcrypt.hash('patient', saltRounds), username: 'michael_anderson', role: 'patient', createdAt: new Date('2023-01-09'), lastLogin: new Date('2023-05-15 17:00:00') },
                { email: 'emma.thomas@example.com', password: await bcrypt.hash('patient', saltRounds), username: 'emma_thomas', role: 'patient', createdAt: new Date('2023-01-10'), lastLogin: new Date('2023-05-15 18:00:00') },
                { email: 'olivia.jackson@example.com', password: await bcrypt.hash('patient', saltRounds), username: 'olivia_jackson', role: 'patient', createdAt: new Date('2023-01-11'), lastLogin: new Date('2023-05-15 19:00:00') },
                { email: 'james.white@example.com', password: await bcrypt.hash('patient', saltRounds), username: 'james_white', role: 'patient', createdAt: new Date('2023-01-12'), lastLogin: new Date('2023-05-15 20:00:00') },
                { email: 'sophia.harris@example.com', password: await bcrypt.hash('patient', saltRounds), username: 'sophia_harris', role: 'patient', createdAt: new Date('2023-01-13'), lastLogin: new Date('2023-05-15 21:00:00') },
                { email: 'william.martin@example.com', password: await bcrypt.hash('patient', saltRounds), username: 'william_martin', role: 'patient', createdAt: new Date('2023-01-14'), lastLogin: new Date('2023-05-15 22:00:00') },
                { email: 'ava.thompson@example.com', password: await bcrypt.hash('patient', saltRounds), username: 'ava_thompson', role: 'patient', createdAt: new Date('2023-01-15'), lastLogin: new Date('2023-05-15 23:00:00') },
                { email: 'ethan.garcia@example.com', password: await bcrypt.hash('patient', saltRounds), username: 'ethan_garcia', role: 'patient', createdAt: new Date('2023-01-16'), lastLogin: new Date('2023-05-16 00:00:00') },
            ],
        })

        // Insert Therapists
        const therapists = await prisma.therapist.createMany({
            data: [
                { userId: 1, specialization: 'Articulation and Phonology', yearsExperience: 5 },
                { userId: 2, specialization: 'Language Disorders', yearsExperience: 7 },
                { userId: 3, specialization: 'Fluency Disorders', yearsExperience: 4 },
                { userId: 4, specialization: 'Voice Disorders', yearsExperience: 6 },
            ],
        })

        // Insert Supervisors
        const supervisors = await prisma.supervisor.createMany({
            data: [
                { userId: 5, department: 'Clinical Operations' },
                { userId: 6, department: 'Quality Assurance' },
            ],
        })

        // Insert Patients
        const patients = await prisma.patient.createMany({
            data: [
                { userId: 7, dateOfBirth: new Date('1990-05-15'), diagnosis: 'Articulation disorder', therapistId: 1 },
                { userId: 8, dateOfBirth: new Date('1985-08-22'), diagnosis: 'Expressive language disorder', therapistId: 2 },
                { userId: 9, dateOfBirth: new Date('1995-03-10'), diagnosis: 'Stuttering', therapistId: 3 },
                { userId: 10, dateOfBirth: new Date('1988-11-30'), diagnosis: 'Vocal nodules', therapistId: 4 },
                { userId: 11, dateOfBirth: new Date('1992-07-18'), diagnosis: 'Aphasia', therapistId: 1 },
                { userId: 12, dateOfBirth: new Date('1998-02-05'), diagnosis: 'Childhood apraxia of speech', therapistId: 2 },
                { userId: 13, dateOfBirth: new Date('1987-09-25'), diagnosis: 'Dysarthria', therapistId: 3 },
                { userId: 14, dateOfBirth: new Date('1993-12-08'), diagnosis: 'Selective mutism', therapistId: 4 },
                { userId: 15, dateOfBirth: new Date('1997-06-20'), diagnosis: 'Social communication disorder', therapistId: 1 },
                { userId: 16, dateOfBirth: new Date('1991-04-03'), diagnosis: 'Auditory processing disorder', therapistId: 2 },
            ],
        })

        // Insert Therapy Plans
        const therapyPlans = await prisma.therapyPlan.createMany({
            data: [
                { patientId: 1, therapistId: 1, goals: 'Improve articulation of /s/ and /z/ sounds', activities: 'Sound repetition, minimal pairs, storytelling', startDate: new Date('2023-05-01'), endDate: new Date('2023-07-31'), status: 'In Progress' },
                { patientId: 2, therapistId: 2, goals: 'Enhance expressive language skills', activities: 'Sentence formulation, vocabulary building, conversation practice', startDate: new Date('2023-05-02'), endDate: new Date('2023-08-01'), status: 'In Progress' },
                { patientId: 3, therapistId: 3, goals: 'Reduce stuttering frequency', activities: 'Fluency shaping, stuttering modification, relaxation techniques', startDate: new Date('2023-05-03'), endDate: new Date('2023-08-02'), status: 'In Progress' },
                { patientId: 4, therapistId: 4, goals: 'Improve vocal hygiene and reduce strain', activities: 'Vocal exercises, breathing techniques, hydration education', startDate: new Date('2023-05-04'), endDate: new Date('2023-08-03'), status: 'In Progress' },
                { patientId: 5, therapistId: 1, goals: 'Improve word-finding skills', activities: 'Word association, semantic feature analysis, circumlocution strategies', startDate: new Date('2023-05-05'), endDate: new Date('2023-08-04'), status: 'In Progress' },
                { patientId: 6, therapistId: 2, goals: 'Enhance motor planning for speech', activities: 'Oral motor exercises, syllable sequencing, multisensory cueing', startDate: new Date('2023-05-06'), endDate: new Date('2023-08-05'), status: 'In Progress' },
                { patientId: 7, therapistId: 3, goals: 'Improve speech intelligibility', activities: 'Articulation drills, rate control exercises, prosody training', startDate: new Date('2023-05-07'), endDate: new Date('2023-08-06'), status: 'In Progress' },
                { patientId: 8, therapistId: 4, goals: 'Increase verbal communication in social settings', activities: 'Gradual exposure, role-playing, anxiety management techniques', startDate: new Date('2023-05-08'), endDate: new Date('2023-08-07'), status: 'In Progress' },
                { patientId: 9, therapistId: 1, goals: 'Enhance pragmatic language skills', activities: 'Social stories, conversation skills training, perspective-taking activities', startDate: new Date('2023-05-09'), endDate: new Date('2023-08-08'), status: 'In Progress' },
                { patientId: 10, therapistId: 2, goals: 'Improve auditory discrimination and processing', activities: 'Auditory training exercises, phoneme discrimination tasks, following complex directions', startDate: new Date('2023-05-10'), endDate: new Date('2023-08-09'), status: 'In Progress' },
            ],
        })

        // Insert Therapy Sessions
        const therapySessions = await prisma.therapySession.createMany({
            data: [
                { planId: 1, therapistId: 1, patientId: 1, sessionDate: new Date('2023-05-15 10:00:00'), duration: 60, status: 'Completed' },
                { planId: 2, therapistId: 2, patientId: 2, sessionDate: new Date('2023-05-16 11:00:00'), duration: 60, status: 'Completed' },
                { planId: 3, therapistId: 3, patientId: 3, sessionDate: new Date('2023-05-17 13:00:00'), duration: 60, status: 'Completed' },
                { planId: 4, therapistId: 4, patientId: 4, sessionDate: new Date('2023-05-18 14:00:00'), duration: 60, status: 'Completed' },
                { planId: 5, therapistId: 1, patientId: 5, sessionDate: new Date('2023-05-19 10:00:00'), duration: 60, status: 'Scheduled' },
                { planId: 6, therapistId: 2, patientId: 6, sessionDate: new Date('2023-05-20 11:00:00'), duration: 60, status: 'Scheduled' },
                { planId: 7, therapistId: 3, patientId: 7, sessionDate: new Date('2023-05-21 13:00:00'), duration: 60, status: 'Scheduled' },
                { planId: 8, therapistId: 4, patientId: 8, sessionDate: new Date('2023-05-22 14:00:00'), duration: 60, status: 'Scheduled' },
                { planId: 9, therapistId: 1, patientId: 9, sessionDate: new Date('2023-05-23 10:00:00'), duration: 60, status: 'Scheduled' },
                { planId: 10, therapistId: 2, patientId: 10, sessionDate: new Date('2023-05-24 11:00:00'), duration: 60, status: 'Scheduled' },
            ],
        })

        // Insert Progress Notes
        const progressNotes = await prisma.progressNote.createMany({
            data: [
                { therapySessionId: 1, observations: 'Patient showed improvement in /s/ sound production', recommendations: 'Continue with current exercises, introduce /z/ sound next session' },
                { therapySessionId: 2, observations: 'Patient successfully formulated 5 complex sentences', recommendations: 'Increase difficulty of vocabulary words, introduce more abstract topics' },
                { therapySessionId: 3, observations: 'Stuttering frequency reduced by 20% during session', recommendations: 'Practice relaxation techniques more frequently, introduce speaking in front of small groups' },
                { therapySessionId: 4, observations: 'Patient demonstrated proper breathing techniques', recommendations: 'Continue vocal hygiene education, introduce more challenging vocal exercises' },
            ],
        })

        // Insert Progress Reports
        const progressReports = await prisma.progressReport.createMany({
            data: [
                { patientId: 1, reportDate: new Date('2023-05-31'), summary: 'Patient has shown significant improvement in articulating /s/ sound', overallProgress: 'Good' },
                { patientId: 2, reportDate: new Date('2023-05-31'), summary: 'Patient\'s expressive language skills have improved, especially in sentence complexity', overallProgress: 'Very Good' },
                { patientId: 3, reportDate: new Date('2023-05-31'), summary: 'Patient\'s stuttering frequency has decreased, and confidence has increased', overallProgress: 'Good' },
                { patientId: 4, reportDate: new Date('2023-05-31'), summary: 'Patient has adopted better vocal hygiene habits and shows reduced vocal strain', overallProgress: 'Satisfactory' },
            ],
        })

        // Insert Clinical Ratings
        const clinicalRatings = await prisma.clinicalRating.createMany({
            data: [
                { supervisorId: 1, therapyPlanId: 1, ratingScore: 4, feedback: 'Well-structured therapy plan with clear goals', ratingDate: new Date('2023-05-31') },
                { supervisorId: 2, therapyPlanId: 2, ratingScore: 5, feedback: 'Excellent choice of activities for expressive language improvement', ratingDate: new Date('2023-05-31') },
                { supervisorId: 1, therapyPlanId: 3, ratingScore: 4, feedback: 'Good combination of fluency shaping and stuttering modification techniques', ratingDate: new Date('2023-05-31') },
                { supervisorId: 2, therapyPlanId: 4, ratingScore: 4, feedback: 'Comprehensive approach to voice therapy, consider adding more counseling', ratingDate: new Date('2023-05-31') }
            ],
        });

        console.log('Database seeding completed successfully!')
    } catch (error) {
        console.error('Error during seeding:', error)
    } finally {
        await prisma.$disconnect()
    }
}


main()