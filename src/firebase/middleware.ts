import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "./admin";
import { cookies } from "next/headers";

export interface AuthenticatedRequest extends NextRequest {
  userId?: string;
  user?: any;
}

export async function authenticateRequest(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie =
      cookieStore.get("auth-token")?.value ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!sessionCookie) {
      return null;
    }

    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);

    return {
      userId: decodedToken.uid,
      user: decodedToken,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

/**
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: { params: any },
    auth: { userId: string; user: any }
  ) => Promise<any>,
  options: { requireAdmin?: boolean; requireRole?: string } = {}
) {
  return async (request: NextRequest, context: { params: any }) => {
    try {
      const authResult = await authenticateRequest(request);

      if (!authResult) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized - Please log in",
          },
          { status: 401 }
        );
      }

      if (options.requireRole || options.requireAdmin) {
        try {
          const userDoc = await db
            .collection("users")
            .doc(authResult.userId)
            .get();
          const userData = userDoc.data();

          if (options.requireAdmin && userData?.role !== "admin") {
            return NextResponse.json(
              {
                success: false,
                error: "Forbidden - Admin access required",
              },
              { status: 403 }
            );
          }

          if (options.requireRole && userData?.role !== options.requireRole) {
            return NextResponse.json(
              {
                success: false,
                error: `Forbidden - ${options.requireRole} access required`,
              },
              { status: 403 }
            );
          }
        } catch (dbError) {
          console.error("Database error in withAuth:", dbError);
          return NextResponse.json(
            {
              success: false,
              error: "Authentication verification failed",
            },
            { status: 500 }
          );
        }
      }

      return await handler(request, context, authResult);
    } catch (error) {
      console.error("withAuth middleware error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Authentication middleware error",
        },
        { status: 500 }
      );
    }
  };
}

export async function getUserFromRequest(request: NextRequest): Promise<any> {
  const auth = await authenticateRequest(request);
  if (!auth) return null;

  const userDoc = await db.collection("users").doc(auth.userId).get();
  if (!userDoc.exists) return null;

  return {
    userId: auth.userId,
    userData: userDoc.data(),
  };
}
