import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("user_session")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/signin");
  const isProtectedPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/coworkers") ||
    pathname.startsWith("/products");

  // 1. If not logged in and trying to access protected pages -> redirect to /signin
  if (isProtectedPage && !session) {
    const loginUrl = new URL("/signin", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If already logged in and visiting /signin -> redirect to /dashboard
  if (isAuthPage && session) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/coworkers/:path*",
    "/products/:path*",
    "/signin",
  ],
};