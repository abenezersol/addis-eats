import { NextResponse } from "next/server";

// Cheap check only: is there a session cookie? Who it belongs to, and what they
// may touch, is verified again inside every page, action and handler.
export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    // The login page itself must stay reachable, or nobody could ever sign in.
    if (pathname === "/admin/login" || request.cookies.get("admin_session")) {
      return NextResponse.next();
    }
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!request.cookies.get("session")) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*", "/kitchen/:path*", "/admin/:path*"]
};
