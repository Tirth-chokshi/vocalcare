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

export async function getSupervisorIdByEmail(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      supervisor: {
        select: {
          id: true
        }
      }
    }
  })

  if (!user) return null;

  if (user.role === 'supervisor' && user.supervisor) {
    return user.supervisor.id;
  }

  return user.id;
}


export async function createUser(formData) {
  const username = formData.get('username')
  const email = formData.get('email')
  const password = formData.get('password')
  const role = formData.get('role')

  // Additional fields based on role
  const dateOfBirth = formData.get('dateOfBirth')
  const diagnosis = formData.get('diagnosis')
  const specialization = formData.get('specialization')
  const yearsExperience = formData.get('yearsExperience')
  const department = formData.get('department')
  const accessLevel = formData.get('accessLevel')

  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    const userData = {
      username,
      email,
      password: hashedPassword,
      role,
    }

    let roleData = {}

    switch (role) {
      case 'patient':
        roleData = {
          dateOfBirth: new Date(dateOfBirth),
          diagnosis,
        }
        break
      case 'therapist':
        roleData = {
          specialization,
          yearsExperience: parseInt(yearsExperience),
        }
        break
      case 'supervisor':
      case 'admin':
        roleData = {
          department,
        }
        if (role === 'admin') {
          roleData.accessLevel = accessLevel
        }
        break
    }

    const user = await prisma.user.create({
      data: {
        ...userData,
        [role]: {
          create: roleData,
        },
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

// export async function fetchClinicalRatings() {
//   try {
//     const clinicalRatings = await prisma.clinicalRating.findMany({
//       include: {
//         therapyPlan: {
//           include: {
//             therapist: { 
//               include: { 
//                 user: {
//                   select: {
//                     username: true,
//                   }
//                 } 
//               }
//             },
//             patient: { 
//               include: { 
//                 user: {
//                   select: {
//                     username: true,
//                   }
//                 } 
//               }
//             },
//           },
//         },
//         supervisor: {
//           include: {
//             user: {
//               select: {
//                 username: true,
//               }
//             }
//           }
//         }
//       },
//       orderBy: { ratingDate: 'desc' },
//       take: 10,
//     });
//     return clinicalRatings;
//   } catch (error) {
//     console.error('Error fetching clinical ratings:', error);
//     return [];
//   }
// }

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
export async function approveTherapyPlan(planId) {
  try {
    const updatedPlan = await prisma.therapyPlan.update({
      where: { id: parseInt(planId) },
      data: { status: 'approved' },
    });
    return { success: true, plan: updatedPlan };
  } catch (error) {
    console.error('Error approving therapy plan:', error);
    return { success: false, error: error.message };
  }
}
export async function fetchTherapyPlansForReview() {
  try {
    const therapyPlans = await prisma.therapyPlan.findMany({
      where: {
        status: 'pending'
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
        therapist: {
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
    console.error('Error fetching therapy plans for review:', error);
    throw error;
  }
}
export async function submitTherapyPlanReview(userId, planId, ratingScore, feedback) {
  try {
    const updatedPlan = await prisma.therapyPlan.update({
      where: { id: parseInt(planId) },
      data: { status: 'approved' },
    });

    const newRating = await prisma.clinicalRating.create({
      data: {
        therapyPlanId: parseInt(planId),
        supervisorId: userId,
        ratingScore: parseInt(ratingScore),
        feedback: feedback,
        ratingDate: new Date(),
      },
    });

    return { success: true, plan: updatedPlan, rating: newRating };
  } catch (error) {
    console.error('Error submitting therapy plan review:', error);
    return { success: false, error: error.message };
  }
}
export async function fetchPatientAllocationData() {
  try {
    const data = await prisma.therapist.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
        patients: {
          include: {
            user: {
              select: {
                username: true,
              },
            },
            therapyPlans: {
              where: {
                status: 'approved',
              },
              include: {
                therapySessions: true,
              },
            },
          },
        },
      },
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching patient allocation data:', error);
    return { success: false, error: error.message };
  }
}
export async function fetchClinicalRatings(page = 1, pageSize = 5) {
  try {
    const skip = (page - 1) * pageSize;
    const [clinicalRatings, totalCount] = await prisma.$transaction([
      prisma.clinicalRating.findMany({
        skip,
        take: pageSize,
        orderBy: { ratingDate: 'desc' },
        include: {
          supervisor: {
            include: {
              user: {
                select: {
                  username: true,
                }
              }
            }
          },
          therapyPlan: {
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
              therapist: {
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
      }),
      prisma.clinicalRating.count()
    ]);

    return { 
      success: true, 
      data: clinicalRatings,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    };
  } catch (error) {
    console.error('Error fetching clinical ratings:', error);
    return { success: false, error: error.message };
  }
}
export async function fetchPatientProgressData(page = 1, pageSize = 5) {
  try {
    const skip = (page - 1) * pageSize;
    const [patientsWithProgress, totalCount] = await prisma.$transaction([
      prisma.patient.findMany({
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              username: true,
            }
          },
          assignedTherapist: {
            include: {
              user: {
                select: {
                  username: true,
                }
              }
            }
          },
          progressReports: {
            orderBy: {
              reportDate: 'desc'
            },
            take: 1
          },
          therapyPlans: {
            where: {
              status: 'approved'
            },
            include: {
              therapySessions: {
                orderBy: {
                  sessionDate: 'desc'
                },
                take: 5,
                include: {
                  progressNote: true
                }
              }
            }
          }
        }
      }),
      prisma.patient.count()
    ]);

    return { 
      success: true, 
      data: patientsWithProgress,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      }
    };
  } catch (error) {
    console.error('Error fetching patient progress data:', error);
    return { success: false, error: error.message };
  }
}
export async function fetchDetailedUserData(userId, userType) {
  try {
    let userData;
    switch (userType) {
      case 'patient':
        userData = await prisma.patient.findUnique({
          where: { id: parseInt(userId) },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                lastLogin: true,
              }
            },
            assignedTherapist: {
              include: {
                user: {
                  select: {
                    username: true,
                    email: true,
                  }
                }
              }
            },
            therapyPlans: {
              include: {
                therapySessions: {
                  include: {
                    progressNote: true
                  }
                }
              }
            },
            progressReports: true,
          }
        });
        break;
      case 'therapist':
        userData = await prisma.therapist.findUnique({
          where: { id: parseInt(userId) },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                lastLogin: true,
              }
            },
            patients: {
              include: {
                user: {
                  select: {
                    username: true,
                    email: true,
                  }
                }
              }
            },
            therapyPlans: {
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
                therapySessions: true,
              }
            },
          }
        });
        break;
      case 'supervisor':
        userData = await prisma.supervisor.findUnique({
          where: { id: parseInt(userId) },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true,
                createdAt: true,
                lastLogin: true,
              }
            },
            ratings: {
              include: {
                therapyPlan: {
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
                    therapist: {
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
            }
          }
        });
        break;
      default:
        throw new Error('Invalid user type');
    }

    return { success: true, userData };
  } catch (error) {
    console.error('Error fetching detailed user data:', error);
    return { success: false, error: error.message };
  }
}