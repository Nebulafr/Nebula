import { prisma } from "@/lib/prisma";
import { SkillLevel } from "../../../generated/prisma";
import { type UpdateStudentData } from "../utils/schemas";
import { NotFoundException } from "../utils/http-exception";
import sendResponse from "../utils/send-response";

function mapSkillLevelToEnum(skillLevel: string): SkillLevel {
  const normalizedLevel = skillLevel.toUpperCase();
  switch (normalizedLevel) {
    case "BEGINNER":
      return "BEGINNER";
    case "INTERMEDIATE":
      return "INTERMEDIATE";
    case "ADVANCED":
      return "ADVANCED";
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
        email: user.email,
        fullName: user.fullName,
        interestedProgram: data.interestedProgram,
        skillLevel: mappedSkillLevel,
        commitment: data.commitment,
        timeZone: data.timeZone || "UTC",
        learningGoals: data.learningGoals || [],
      });
    } else {
      student = await this.update(student.id, {
        interestedProgram: data.interestedProgram,
        skillLevel: mappedSkillLevel,
        commitment: data.commitment,
        timeZone: data.timeZone || student.timeZone || "UTC",
        learningGoals: data.learningGoals || student.learningGoals,
      });
    }

    return sendResponse.success(
      student,
      "Student profile updated successfully"
    );
  }

  static async getProfile(userId: string) {
    const student = await this.findByUserId(userId);
    if (!student) {
      throw new NotFoundException("Student profile not found");
    }

    return sendResponse.success(
      student,
      "Student profile fetched successfully"
    );
  }

  static async create(data: {
    userId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    interestedProgram: string;
    skillLevel: SkillLevel;
    commitment: string;
    timeZone?: string;
    learningGoals?: string[];
  }) {
    return prisma.student.create({
      data: {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
        avatarUrl: data.avatarUrl,
        interestedProgram: data.interestedProgram,
        skillLevel: data.skillLevel,
        commitment: data.commitment,
        timeZone: data.timeZone || "UTC",
        learningGoals: data.learningGoals || [],
        currentLevel: "BEGINNER",
        enrolledPrograms: [],
        completedSessions: [],
        upcomingSessions: [],
      },
    });
  }

  static async update(
    id: string,
    data: {
      interestedProgram?: string;
      skillLevel?: SkillLevel;
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
