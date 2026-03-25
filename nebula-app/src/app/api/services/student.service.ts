import { prisma } from "@/lib/providers";
import { ExperienceLevel } from "@/generated/prisma";
import { UpdateStudentData } from "@/lib/validations";
import { NotFoundException } from "../utils/http-exception";

export class StudentService {
  private mapSkillLevelToEnum(skillLevel: string): ExperienceLevel {
    const normalizedLevel = skillLevel.toUpperCase();
    switch (normalizedLevel) {
      case "BEGINNER":
        return ExperienceLevel.BEGINNER;
      case "INTERMEDIATE":
        return ExperienceLevel.INTERMEDIATE;
      case "ADVANCED":
        return ExperienceLevel.ADVANCED;
      default:
        throw new Error(`Invalid skill level: ${skillLevel}`);
    }
  }

  async findByUserId(userId: string) {
    return prisma.student.findUnique({
      where: { userId },
      include: {
        interestedCategories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async updateProfile(userId: string, data: UpdateStudentData) {
    const mappedSkillLevel = this.mapSkillLevelToEnum(data.skillLevel);

    if (data.country || data.countryIso) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.country ? { country: data.country } : {}),
          ...(data.countryIso ? { countryIso: data.countryIso } : {}),
        },
      });
    }

    let student = await this.findByUserId(userId);

    if (!student) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullName: true },
      });

      if (!user || !user.email || !user.fullName) {
        throw new NotFoundException("User not found or incomplete user data");
      }

      student = await this.create({
        userId,
        interestedCategoryIds: data.interestedCategoryIds,
        skillLevel: mappedSkillLevel,
        commitment: data.commitment,
        timeZone: data.timeZone || "UTC",
        learningGoals: data.learningGoals || [],
      });
    } else {
      student = await this.update(student.id, {
        interestedCategoryIds: data.interestedCategoryIds,
        skillLevel: mappedSkillLevel,
        commitment: data.commitment,
        timeZone: data.timeZone || student.timeZone || "UTC",
        learningGoals: data.learningGoals || student.learningGoals,
      });
    }

    return student;
  }

  async getProfile(userId: string) {
    const student = await this.findByUserId(userId);
    if (!student) {
      throw new NotFoundException("Student profile not found");
    }

    const transformedStudent = {
      ...student,
      interestedCategoryIds: student.interestedCategories.map((ic: { categoryId: string }) => ic.categoryId),
    };

    return transformedStudent;
  }

  async create(data: {
    userId: string;
    interestedCategoryIds: string[];
    skillLevel: ExperienceLevel;
    commitment: string;
    timeZone?: string;
    learningGoals?: string[];
  }) {
    return prisma.student.create({
      data: {
        userId: data.userId,
        interestedCategoryId: data.interestedCategoryIds[0] || null,
        interestedCategories: {
          create: data.interestedCategoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
        skillLevel: data.skillLevel,
        commitment: data.commitment,
        timeZone: data.timeZone || "UTC",
        learningGoals: data.learningGoals || [],
        currentLevel: "BEGINNER",
      },
      include: {
        interestedCategories: {
          include: {
            category: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      interestedCategoryIds?: string[];
      skillLevel?: ExperienceLevel;
      commitment?: string;
      timeZone?: string;
      learningGoals?: string[];
    }
  ) {
    const { interestedCategoryIds, ...rest } = data;

    return prisma.student.update({
      where: { id },
      data: {
        ...rest,
        ...(interestedCategoryIds && {
          interestedCategoryId: interestedCategoryIds[0] || null,
          interestedCategories: {
            deleteMany: {},
            create: interestedCategoryIds.map((categoryId) => ({
              categoryId,
            })),
          },
        }),
      },
      include: {
        interestedCategories: {
          include: {
            category: true,
          },
        },
      },
    });
  }
}

export const studentService = new StudentService();
