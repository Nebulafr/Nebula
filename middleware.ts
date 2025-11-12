import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Get pathname
  const { pathname } = request.nextUrl;

  const protectedRoutes = {
    "/dashboard": "student",
    "/coach-dashboard": "coach",
    "/admin": "admin",
    "/onboarding": "student",
    "/coach-onboarding": "coach",
  };

  const publicRoutes = [
    "/",
    "/login",
    "/signup",
    "/coach-login",
    "/coach-signup",
    "/forgot-password",
    "/coaches",
    "/programs",
    "/about",
    "/help-center",
    "/events",
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isProtectedRoute = Object.keys(protectedRoutes).some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
