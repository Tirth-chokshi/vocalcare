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
        [role]: { create: {} }, // This creates the related role-specific record
      },
      include: { [role]: true }, // This includes the created role-specific record in the response
    })

    return { success: true, user }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: error.message }
  }
}

export async function fetchTherapists() {
  try {
    const therapists = await prisma.therapist.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    })
    return therapists
  } catch (error) {
    console.error('Error fetching therapists:', error)
    return []
  }
}

export async function fetchPatients() {
  try {
    const patients = await prisma.patient.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    })
    return patients
  } catch (error) {
    console.error('Error fetching patients:', error)
    return []
  }
}

export async function fetchSupervisors() {
  try {
    const supervisors = await prisma.supervisor.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        }
      }
    })
    return supervisors
  } catch (error) {
    console.error('Error fetching supervisors:', error)
    return []
  }
}

export async function allocatePatientToTherapist(patientId, therapistId) {
  try {
    const updatedPatient = await prisma.patient.update({
      where: { id: parseInt(patientId) },
      data: { therapistId: parseInt(therapistId) },
    })
    return { success: true, patient: updatedPatient }
  } catch (error) {
    console.error('Error allocating patient to therapist:', error)
    return { success: false, error: error.message }
  }
}