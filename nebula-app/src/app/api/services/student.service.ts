import { prisma } from "@/lib/prisma";
import { ExperienceLevel } from "@/generated/prisma";
import { UpdateStudentData } from "@/lib/validations";
import { NotFoundException } from "../utils/http-exception";
import { sendSuccess } from "../utils/send-response";

function mapSkillLevelToEnum(skillLevel: string): ExperienceLevel {
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

export class StudentService {
  static async findByUserId(userId: string) {
    return prisma.student.findUnique({
      where: { userId },
    });
  }

  static async updateProfile(userId: string, data: UpdateStudentData) {
    const mappedSkillLevel = mapSkillLevelToEnum(data.skillLevel);

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
        interestedCategoryId: data.interestedCategoryId,
        skillLevel: mappedSkillLevel,
        commitment: data.commitment,
        timeZone: data.timeZone || "UTC",
        learningGoals: data.learningGoals || [],
      });
    } else {
      student = await this.update(student.id, {
        interestedCategoryId: data.interestedCategoryId,
        skillLevel: mappedSkillLevel,
        commitment: data.commitment,
        timeZone: data.timeZone || student.timeZone || "UTC",
        learningGoals: data.learningGoals || student.learningGoals,
      });
    }

    return sendSuccess(student, "Student profile updated successfully");
  }

  static async getProfile(userId: string) {
    const student = await this.findByUserId(userId);
    if (!student) {
      throw new NotFoundException("Student profile not found");
    }

    return sendSuccess(student, "Student profile fetched successfully");
  }

  static async create(data: {
    userId: string;
    interestedCategoryId: string;
    skillLevel: ExperienceLevel;
    commitment: string;
    timeZone?: string;
    learningGoals?: string[];
  }) {
    return prisma.student.create({
      data: {
        userId: data.userId,
        interestedCategoryId: data.interestedCategoryId,
        skillLevel: data.skillLevel,
        commitment: data.commitment,
        timeZone: data.timeZone || "UTC",
        learningGoals: data.learningGoals || [],
        currentLevel: "BEGINNER",
      },
    });
  }

  static async update(
    id: string,
    data: {
      interestedCategoryId?: string;
      skillLevel?: ExperienceLevel;
      commitment?: string;
      timeZone?: string;
      learningGoals?: string[];
    }
  ) {
    return prisma.student.update({
      where: { id },
      data,
    });
  }
}
