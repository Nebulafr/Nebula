import { prisma } from "@/lib/prisma";
import { EnrollmentStatus } from "@/generated/prisma";
import { NotFoundException, BadRequestException } from "../utils/http-exception";

export const enrollmentService = {
  async getStudentEnrollments(studentId: string, status?: EnrollmentStatus) {
    try {
      const whereClause: any = {
        studentId,
      };

      if (status) {
        whereClause.status = status;
      }

      const enrollments = await prisma.enrollment.findMany({
        where: whereClause,
        include: {
          program: {
            include: {
              category: true,
              modules: {
                orderBy: {
                  week: "asc",
                },
              },
              coach: {
                include: {
                  user: {
                    select: {
                      id: true,
                      fullName: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },
          coach: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          enrollmentDate: "desc",
        },
      });

      return enrollments.map((enrollment) => {
        const totalModules = enrollment.program.modules.length;
        
        return {
          id: enrollment.id,
          status: enrollment.status,
          enrollmentDate: enrollment.enrollmentDate,
          completionDate: enrollment.completionDate,
          progress: enrollment.progress,
          paymentStatus: enrollment.paymentStatus,
          coach: {
            id: enrollment.coach.id,
            fullName: enrollment.coach.user.fullName,
            avatarUrl: enrollment.coach.user.avatarUrl,
            name: enrollment.coach.user.fullName, 
            avatar: enrollment.coach.user.avatarUrl,  
          },
          program: {
            id: enrollment.program.id,
            title: enrollment.program.title,
            slug: enrollment.program.slug,
            description: enrollment.program.description,
            objectives: enrollment.program.objectives,
            category: enrollment.program.category.name,
            modules: enrollment.program.modules.map((module, index) => {
              const moduleThreshold = ((index + 1) / totalModules) * 100;
              const isCompleted = enrollment.progress >= moduleThreshold;
              
              return {
                id: module.id,
                title: module.title,
                description: module.description,
                week: module.week,
                materials: module.materials,
                status: isCompleted ? "Completed" : "Upcoming",
              };
            }),
          },
          title: enrollment.program.title,
          slug: enrollment.program.slug,
          sessions: enrollment.program.modules.map((module, index) => {
            const moduleThreshold = ((index + 1) / totalModules) * 100;
            const isCompleted = enrollment.progress >= moduleThreshold;
            return {
              title: module.title,
              status: isCompleted ? "Completed" : "Upcoming",
            };
          }),
        };
      });
    } catch (error) {
      console.error("Error fetching student enrollments:", error);
      throw error;
    }
  },

 
  async updateEnrollmentProgress(
    enrollmentId: string,
    studentId: string,
    progress: number
  ) {
    try {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          id: enrollmentId,
          studentId,
        },
      });

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      const updatedEnrollment = await prisma.enrollment.update({
        where: {
          id: enrollmentId,
        },
        data: {
          progress: Math.max(0, Math.min(100, progress)), // Clamp between 0 and 100
          completionDate: progress >= 100 ? new Date() : null,
          status:
            progress >= 100 ? EnrollmentStatus.COMPLETED : enrollment.status,
        },
      });

      return updatedEnrollment;
    } catch (error) {
      console.error("Error updating enrollment progress:", error);
      throw error;
    }
  },

  async enrollInProgram(studentId: string, slug: string, enrollmentData: any) {
    const { coachId, time, date } = enrollmentData;

    const program = await prisma.program.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        cohorts: {
          where: {
            status: "UPCOMING",
            startDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            startDate: "asc",
          },
          include: {
            _count: {
              select: { enrollments: true },
            },
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException("Program not found");
    }

    let cohortId: string | null = null;
    if (program.cohorts && program.cohorts.length > 0) {
      const cohort = program.cohorts.find(
        (c) => c._count.enrollments < c.maxStudents,
      );

      if (!cohort) {
        throw new BadRequestException(
          "All upcoming cohorts for this program are currently full",
        );
      }
      cohortId = cohort.id;
    }

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId,
        programId: program.id,
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException(
        "You are already enrolled in this program"
      );
    }

    if (
      program.maxStudents &&
      (program.currentEnrollments || 0) >= program.maxStudents
    ) {
      throw new BadRequestException(
        "This program has reached its maximum enrollment capacity"
      );
    }

    return await prisma.$transaction(async (prisma) => {
      const enrollment = await prisma.enrollment.create({
        data: {
          programId: program.id,
          coachId: coachId,
          studentId: studentId,
          cohortId: cohortId,
          time: time,
          enrollmentDate: new Date(
            date || new Date().toISOString().split("T")[0]
          ),
          status: "ACTIVE",
        },
      });

      await prisma.program.update({
        where: { id: program.id },
        data: {
          currentEnrollments: { increment: 1 },
        },
      });

      return {
        enrollmentId: enrollment.id,
        programId: program.id,
      };
    });
  },
};
