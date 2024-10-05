'use server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function getUserRoleByEmail(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true }
  })

  return user?.role
}

export async function createUser(formData) {
  const username = formData.get('username')
  const email = formData.get('email')
  const password = formData.get('password')
  const role = formData.get('role')

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        [role]: { create: {} },
      },
      include: { [role]: true },
    })

    return { success: true, user }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: error.message }
  }
}
export async function fetchTherapists() {
  try {
    const therapists = await prisma.user.findMany({
      where: { role: 'therapist' },
      select: {
        id: true,
        username: true,
        email: true,
        therapist: true
      }
    });
    return therapists.map(t => ({
      id: t.id,
      username: t.username,
      email: t.email,
      ...t.therapist
    }));
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return [];
  }
}


export async function fetchPatients() {
  try {
    const patients = await prisma.user.findMany({
      where: { role: 'patient' },
      select: {
        id: true,
        username: true,
        email: true,
        patient: {
          include: {
            assignedTherapist: {
              include: {
                user: {
                  select: {
                    username: true,
                  }
                }
              }
            }
          }
        }
      }
    });
    return patients.map(p => ({
      id: p.id,
      username: p.username,
      email: p.email,
      ...p.patient
    }));
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}

export async function allocatePatientToTherapist(patientId, therapistId) {
  try {
    const updatedPatient = await prisma.patient.update({
      where: { id: parseInt(patientId) },
      data: { therapistId: parseInt(therapistId) },
    });
    return { success: true, patient: updatedPatient };
  } catch (error) {
    console.error('Error allocating patient to therapist:', error);
    return { success: false, error: error.message };
  }
}
export async function fetchAllocatedPatients(therapistId) {
  try {
    const patients = await prisma.patient.findMany({
      where: { 
        therapistId: therapistId,
        NOT: { therapistId: null } // Ensures only allocated patients are returned
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });
    return patients;
  } catch (error) {
    console.error('Error fetching allocated patients:', error);
    return [];
  }
}

export async function fetchTherapyPlans(therapistId) {
  try {
    const therapyPlans = await prisma.therapyPlan.findMany({
      where: { 
        therapistId: therapistId,
        status: 'In Progress'
      },
      include: {
        patient: { 
          include: { 
            user: {
              select: {
                username: true,
              }
            } 
          }
        },
      },
    });
    return therapyPlans;
  } catch (error) {
    console.error('Error fetching therapy plans:', error);
    return [];
  }
}

export async function fetchClinicalRatings() {
  try {
    const clinicalRatings = await prisma.clinicalRating.findMany({
      include: {
        therapyPlan: {
          include: {
            therapist: { 
              include: { 
                user: {
                  select: {
                    username: true,
                  }
                } 
              }
            },
            patient: { 
              include: { 
                user: {
                  select: {
                    username: true,
                  }
                } 
              }
            },
          },
        },
        supervisor: {
          include: {
            user: {
              select: {
                username: true,
              }
            }
          }
        }
      },
      orderBy: { ratingDate: 'desc' },
      take: 10,
    });
    return clinicalRatings;
  } catch (error) {
    console.error('Error fetching clinical ratings:', error);
    return [];
  }
}

export async function reviewTherapyPlan(planId, reviewComment, ratingScore) {
  try {
    const updatedPlan = await prisma.therapyPlan.update({
      where: { id: parseInt(planId) },
      data: {
        status: 'Reviewed',
        ratings: {
          create: {
            feedback: reviewComment,
            ratingScore: parseInt(ratingScore),
            ratingDate: new Date(),
            supervisorId: 1, // Replace with actual supervisor ID or fetch from session
          },
        },
      },
    });
    return { success: true, plan: updatedPlan };
  } catch (error) {
    console.error('Error reviewing therapy plan:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchSupervisors() {
  try {
    const supervisors = await prisma.user.findMany({
      where: { role: 'supervisor' },
      select: {
        id: true,
        username: true,
        email: true,
        supervisor: true
      }
    });
    return supervisors.map(s => ({
      id: s.id,
      username: s.username,
      email: s.email,
      ...s.supervisor
    }));
  } catch (error) {
    console.error('Error fetching supervisors:', error);
    return [];
  }
}

export async function fetchAssignedPatients(therapistId) {
  try {
    const patients = await prisma.patient.findMany({
      where: { therapistId: therapistId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    });
    return patients;
  } catch (error) {
    console.error('Error fetching assigned patients:', error);
    return [];
  }
}

export async function createTherapyPlan(patientId, goals, activities) {
  try {
    const newPlan = await prisma.therapyPlan.create({
      data: {
        patientId: parseInt(patientId),
        therapistId: 1, // Replace with actual therapist ID
        goals,
        activities,
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)), // 3 months from now
        status: 'In Progress',
      },
    });
    return { success: true, plan: newPlan };
  } catch (error) {
    console.error('Error creating therapy plan:', error);
    return { success: false, error: error.message };
  }
}

export async function updateTherapyPlan(planId, goals, activities, status) {
  try {
    const updatedPlan = await prisma.therapyPlan.update({
      where: { id: parseInt(planId) },
      data: { goals, activities, status },
    });
    return { success: true, plan: updatedPlan };
  } catch (error) {
    console.error('Error updating therapy plan:', error);
    return { success: false, error: error.message };
  }
}

export async function createTherapySession(patientId, duration, notes) {
  try {
    const newSession = await prisma.therapySession.create({
      data: {
        patientId: parseInt(patientId),
        therapistId: 1, // Replace with actual therapist ID
        planId: 1, // Replace with actual plan ID or fetch the latest plan for the patient
        sessionDate: new Date(),
        duration: parseInt(duration),
        status: 'Completed',
        progressNote: {
          create: {
            observations: notes,
            recommendations: '', // Add recommendations if needed
          }
        }
      },
    });
    return { success: true, session: newSession };
  } catch (error) {
    console.error('Error creating therapy session:', error);
    return { success: false, error: error.message };
  }
}
// In actions/actions.js

export async function fetchOngoingTherapySessions() {
  try {
    const ongoingSessions = await prisma.therapySession.findMany({
      where: { status: 'In Progress' },
      include: {
        therapist: { 
          include: { 
            user: {
              select: {
                username: true,
              }
            } 
          }
        },
        patient: { 
          include: { 
            user: {
              select: {
                username: true,
              }
            } 
          }
        },
      },
    });
    return ongoingSessions;
  } catch (error) {
    console.error('Error fetching ongoing therapy sessions:', error);
    return [];
  }
}

export async function reviewTherapySession(sessionId, reviewComment) {
  try {
    const updatedSession = await prisma.therapySession.update({
      where: { id: parseInt(sessionId) },
      data: {
        supervisorReview: reviewComment,
        // You might want to add a reviewDate or update the session status here
      },
    });
    return { success: true, session: updatedSession };
  } catch (error) {
    console.error('Error reviewing therapy session:', error);
    return { success: false, error: error.message };
  }
}