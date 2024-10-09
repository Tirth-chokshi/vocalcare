'use server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function fetchComprehensivePatientData(patientId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to 00:00:00
  
    return await prisma.user.findUnique({
      where: { id: parseInt(patientId, 10) },
      include: {
        patient: {
          include: {
            therapyPlans: {
              orderBy: { startDate: 'desc' },
              take: 1,
            },
            progressReports: {
              orderBy: { reportDate: 'desc' },
              take: 5,
            },
            therapySessions: {
              where: {
                sessionDate: {
                  gte: today
                }
              },
              orderBy: { sessionDate: 'asc' },
              take: 5,
            },
            diagnosis: true,
          },
        },
      },
    });
  }

export async function fetchPatientData(patientId) {
  return await prisma.user.findUnique({
    where: { id: parseInt(patientId, 10) },
    include: { patient: true },
  })
}

export async function fetchUpcomingTherapySessions(patientId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to 00:00:00
  
    return await prisma.therapySession.findMany({
      where: {
        patientId: parseInt(patientId, 10),
        sessionDate: { gte: today },
      },
      orderBy: { sessionDate: 'asc' },
      take: 5,
    });
  }