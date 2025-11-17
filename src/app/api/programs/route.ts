import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { withAuth } from "@/firebase/middleware";
import type { Module } from "@/models";
import {
  createProgramSchema,
  programsQuerySchema,
  validateRequest,
} from "@/lib/validations";

export const POST = withAuth(
  async (request: NextRequest, _context, auth) => {
    try {
      const body = await request.json();

      const validatedData = validateRequest(createProgramSchema, body);

      const {
        title,
        category,
        description,
        objectives,
        modules,
        price,
        duration,
        difficultyLevel,
        maxStudents,
        tags,
        prerequisites,
      } = validatedData;

      const coachId = auth.userId;
      const slug = title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      const programData = {
        title,
        category,
        description,
        objectives,
        coachId: coachId,
        coachRef: db.collection("coaches").doc(coachId),
        slug,
        rating: 0,
        totalReviews: 0,
        price: price || 0,
        duration: duration || "4 weeks",
        difficultyLevel: difficultyLevel || "beginner",
        maxStudents: maxStudents || 100,
        currentEnrollments: 0,
        isActive: true,
        tags: tags || [],
        prerequisites: prerequisites || [],
        modules: modules as Module[],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await db.collection("programs").add(programData);

      return NextResponse.json(
        {
          success: true,
          data: {
            programId: docRef.id,
          },
          message: "Program created successfully",
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Error creating program:", { error });

      if (error.message?.includes("Validation failed")) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            message: error.message,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Internal server error",
          message:
            "Failed to create program" +
            (error.message ? `: ${error.message}` : ""),
        },
        { status: 500 }
      );
    }
  },
  { requireRole: "coach" }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coachId = searchParams.get("coachId");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");

    let query = db.collection("programs").where("isActive", "==", true);

    if (coachId) {
      query = query.where("coachId", "==", coachId);
    }

    if (category) {
      query = query.where("category", "==", category);
    }

    query = query.orderBy("createdAt", "desc").limit(limit);

    const snapshot = await query.get();
    const programs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt:
        doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      updatedAt:
        doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        data: { programs },
        message: "Programs fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to fetch programs",
      },
      { status: 500 }
    );
  }
}
