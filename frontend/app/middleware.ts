import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to protect dashboard route
 * Checks for refresh token cookie presence (basic check)
 * Full auth verification handled client-side by useAuthStore
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // Check if refresh token cookie exists
    const refreshToken = request.cookies.get("refresh_token");
    
    // If no refresh token, redirect to login
    // Note: This is a basic check. Full verification happens client-side
    if (!refreshToken) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

