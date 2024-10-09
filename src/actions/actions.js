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

export async function getTherapistIdByEmail(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      therapist: {
        select: {
          id: true
        }
      }
    }
  })

  if (!user) return null;

  if (user.role === 'therapist' && user.therapist) {
    return user.therapist.id;
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

    // Create a notification for the therapist
    const therapist = await prisma.therapist.findUnique({
      where: { id: parseInt(therapistId) },
      include: { user: true },
    });

    if (therapist) {
      await prisma.notification.create({
        data: {
          userId: therapist.userId,
          message: `A new patient (ID: ${patientId}) has been allocated to you.`,
          isRead: false,
        },
      });
    }

    return { success: true, patient: updatedPatient };
  } catch (error) {
    console.error('Error allocating patient to therapist:', error);
    return { success: false, error: error.message };
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
      include: { therapist: true },
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
    
    await prisma.notification.create({
      data: {
        userId: updatedPlan.therapist.userId,
        message: `Your therapy plan (ID: ${planId}) has been approved.`,
        isRead: false,
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
                status: {
                  in: ['pending', 'approved']
                }
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

export async function fetchAllocatedPatients(therapistId) {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        therapistId: parseInt(therapistId),
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          }
        },
        therapyPlans: {
          where: {
            status: {
              in: ['pending', 'approved']
            }
          }
        }
      }
    });
    return patients;
  } catch (error) {
    console.error('Error fetching allocated patients:', error);
    throw error;
  }
}

export async function createTherapyPlan(therapistId, patientId, planData) {
  try {
    const newPlan = await prisma.therapyPlan.create({
      data: {
        therapist: { connect: { id: parseInt(therapistId) } },
        patient: { connect: { id: parseInt(patientId) } },
        goals: planData.goals,
        activities: planData.activities,
        startDate: new Date(planData.startDate),
        endDate: new Date(planData.endDate),
        status: 'pending',
      },
      include: {
        therapist: {
          include: {
            user: true
          }
        }
      }
    });

    // Fetch all supervisors
    const supervisors = await prisma.supervisor.findMany({
      include: {
        user: true
      }
    });

    // Create notifications for all supervisors
    for (const supervisor of supervisors) {
      await prisma.notification.create({
        data: {
          userId: supervisor.userId,
          message: `New therapy plan (ID: ${newPlan.id}) created by ${newPlan.therapist.user.username} and is pending review.`,
          isRead: false,
        },
      });
    }

    return newPlan;
  } catch (error) {
    console.error('Error creating therapy plan:', error);
    throw error;
  }
}
export async function fetchDetailedAllocatedPatients(therapistId) {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        therapistId: parseInt(therapistId),
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          }
        },
        therapyPlans: {
          where: {
            status: {
              in: ['pending', 'approved']
            }
          },
          include: {
            therapySessions: {
              include: {
                progressNote: true
              }
            }
          }
        }
      }
    });
    return patients;
  } catch (error) {
    console.error('Error fetching detailed allocated patients:', error);
    throw error;
  }
}

export async function fetchApprovedTherapyPlans(therapistId) {
  try {
    const approvedPlans = await prisma.therapyPlan.findMany({
      where: {
        therapistId: parseInt(therapistId),
        status: 'approved'
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });
    return approvedPlans;
  } catch (error) {
    console.error('Error fetching approved therapy plans:', error);
    throw error;
  }
}

export async function fetchPatientHistory(patientId) {
  try {
    const sessions = await prisma.therapySession.findMany({
      where: {
        patientId: parseInt(patientId)
      },
      orderBy: {
        sessionDate: 'desc'
      },
      take: 5 // Get the last 5 sessions
    });

    const lastSession = sessions[0]?.sessionDate || null;
    const totalSessions = await prisma.therapySession.count({
      where: {
        patientId: parseInt(patientId)
      }
    });

    // This is a placeholder. In a real application, you'd have a more sophisticated way to calculate progress
    const progress = totalSessions > 0 ? 'Ongoing' : 'Not started';

    return {
      totalSessions,
      lastSession,
      progress,
      recentSessions: sessions
    };
  } catch (error) {
    console.error('Error fetching patient history:', error);
    throw error;
  }
}

export async function createTherapySession(sessionData) {
  try {
    const { planId, sessionDateTime, duration, notes, therapistId } = sessionData;

    // First, fetch the therapy plan to get the patient ID
    const therapyPlan = await prisma.therapyPlan.findUnique({
      where: { id: parseInt(planId) },
      select: { patientId: true }
    });

    if (!therapyPlan) {
      throw new Error('Therapy plan not found');
    }

    const newSession = await prisma.therapySession.create({
      data: {
        therapyPlan: { connect: { id: parseInt(planId) } },
        therapist: { connect: { id: parseInt(therapistId) } },
        patient: { connect: { id: therapyPlan.patientId } },
        sessionDate: new Date(sessionDateTime),
        duration: parseInt(duration),
        status: 'scheduled',
        progressNote: {
          create: {
            observations: notes || '',
            recommendations: ''
          }
        }
      },
      include: {
        therapyPlan: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    username: true
                  }
                }
              }
            },
            therapist: {
              include: {
                user: {
                  select: {
                    username: true
                  }
                }
              }
            }
          }
        },
        therapist: {
          include: {
            user: {
              select: {
                username: true
              }
            }
          }
        },
        patient: {
          include: {
            user: {
              select: {
                username: true
              }
            }
          }
        }
      }
    });

    // Fetch all supervisors
    const supervisors = await prisma.supervisor.findMany({
      include: {
        user: true
      }
    });

    // Create notifications for all supervisors
    for (const supervisor of supervisors) {
      await prisma.notification.create({
        data: {
          userId: supervisor.userId,
          message: `New therapy session (ID: ${newSession.id}) scheduled by ${newSession.therapist.user.username} for patient ${newSession.patient.user.username}.`,
          isRead: false,
        },
      });
    }

    return { success: true, session: newSession };
  } catch (error) {
    console.error('Error creating therapy session:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchApprovedTherapyPlansTherapist(therapistId, date) {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  return await prisma.therapyPlan.findMany({
    where: {
      therapistId: parseInt(therapistId),
      status: 'approved',
      therapySessions: {
        some: {
          sessionDate: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      }
    },
    include: {
      patient: {
        include: {
          user: {
            select: {
              username: true
            }
          }
        }
      },
      therapySessions: {
        where: {
          sessionDate: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          progressNote: true
        }
      }
    }
  })
}

export async function updateSessionStatus(sessionId, status) {
  return await prisma.therapySession.update({
    where: { id: parseInt(sessionId) },
    data: { status }
  })
}

export async function updateSessionNotes(sessionId, observations, recommendations) {
  return await prisma.therapySession.update({
    where: { id: parseInt(sessionId) },
    data: {
      progressNote: {
        upsert: {
          create: { observations, recommendations },
          update: { observations, recommendations }
        }
      }
    }
  })
}
export async function fetchTherapyPlansByStatus(therapistId) {
  try {
    const therapyPlans = await prisma.therapyPlan.findMany({
      where: {
        therapistId: parseInt(therapistId),
        status: {
          in: ['pending', 'approved']
        }
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
        therapySessions: {
          include: {
            progressNote: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    const pendingPlans = therapyPlans.filter(plan => plan.status === 'pending');
    const approvedPlans = therapyPlans.filter(plan => plan.status === 'approved');

    return { pendingPlans, approvedPlans };
  } catch (error) {
    console.error('Error fetching therapy plans:', error);
    throw error;
  }
}

export async function getUnreadNotifications(userId) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: parseInt(userId),
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId) {
  try {
    const updatedNotification = await prisma.notification.update({
      where: { id: parseInt(notificationId) },
      data: { isRead: true },
    });

    return updatedNotification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}