import { prisma } from "@/lib/prisma";
import { EnrollmentStatus } from "@/generated/prisma";

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

  // async getEnrollmentById(enrollmentId: string, studentId: string) {
  //   try {
  //     const enrollment = await prisma.enrollment.findFirst({
  //       where: {
  //         id: enrollmentId,
  //         studentId,
  //       },
  //       include: {
  //         program: {
  //           include: {
  //             category: true,
  //             coach: {
  //               include: {
  //                 user: {
  //                   select: {
  //                     id: true,
  //                     fullName: true,
  //                     avatarUrl: true,
  //                   },
  //                 },
  //               },
  //             },
  //             modules: {
  //               orderBy: {
  //                 week: 'asc',
  //               },
  //             },
  //           },
  //         },
  //         coach: {
  //           include: {
  //             user: {
  //               select: {
  //                 id: true,
  //                 fullName: true,
  //                 avatarUrl: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     if (!enrollment) {
  //       throw new Error("Enrollment not found");
  //     }

  //     return {
  //       id: enrollment.id,
  //       status: enrollment.status,
  //       enrollmentDate: enrollment.enrollmentDate,
  //       completionDate: enrollment.completionDate,
  //       progress: enrollment.progress,
  //       paymentStatus: enrollment.paymentStatus,
  //       program: {
  //         id: enrollment.program.id,
  //         title: enrollment.program.title,
  //         slug: enrollment.program.slug,
  //         description: enrollment.program.description,
  //         category: enrollment.program.category?.name || "General",
  //         difficulty: enrollment.program.difficulty,
  //         duration: enrollment.program.duration,
  //         price: enrollment.program.price,
  //         imageUrl: enrollment.program.imageUrl,
  //         modules: enrollment.program.modules,
  //       },
  //       coach: {
  //         id: enrollment.coach.id,
  //         fullName: enrollment.coach.user.fullName,
  //         avatarUrl: enrollment.coach.user.avatarUrl,
  //         rating: enrollment.coach.rating,
  //         totalReviews: enrollment.coach.totalReviews,
  //       },
  //       createdAt: enrollment.createdAt,
  //       updatedAt: enrollment.updatedAt,
  //     };
  //   } catch (error) {
  //     console.error("Error fetching enrollment details:", error);
  //     throw new Error("Failed to fetch enrollment details");
  //   }
  // },

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
};
