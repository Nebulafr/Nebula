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

      // Transform the data to match frontend expectations (my-sessions page structure)
      return enrollments.map((enrollment) => ({
        title: enrollment.program.title,
        coach: {
          name: enrollment.coach.user.fullName,
          avatar: enrollment.coach.user.avatarUrl,
        },
        progress: enrollment.progress,
        slug: enrollment.program.slug,
        sessions: [
          // Note: This would need to be populated from actual program modules/sessions
          // For now, we'll create mock sessions based on program modules if available
          {
            title: "Program Introduction",
            status: enrollment.progress > 0 ? "Completed" : "Upcoming",
          },
          {
            title: "Core Concepts",
            status: enrollment.progress > 33 ? "Completed" : "Upcoming",
          },
          {
            title: "Advanced Techniques",
            status: enrollment.progress > 66 ? "Completed" : "Upcoming",
          },
        ],
        // Additional fields for internal use
        id: enrollment.id,
        status: enrollment.status,
        enrollmentDate: enrollment.enrollmentDate,
        completionDate: enrollment.completionDate,
        paymentStatus: enrollment.paymentStatus,
      }));
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
