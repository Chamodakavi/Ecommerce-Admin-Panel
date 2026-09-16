import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("user_session")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/signin");
  const isProtectedPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/sales") ||
    pathname.startsWith("/coworkers") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/invoice");

  // 1. Unauthenticated users -> redirect to /signin
  if (isProtectedPage && !sessionCookie) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // 2. Authenticated users on /signin -> redirect to /dashboard
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Block co-workers from Sales and Profile routes
  if (sessionCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(sessionCookie));
      const isOwnerOnlyRoute =
        pathname.startsWith("/sales") || pathname.startsWith("/profile");

      if (user.account_type === "coworker" && isOwnerOnlyRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (e) {
      console.error("Middleware session parsing failed:", e);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/sales/:path*",
    "/coworkers/:path*",
    "/products/:path*",
    "/orders/:path*",
    "/invoice/:path*",
    "/signin",
  ],
};