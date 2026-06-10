import { NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/admin-dashboard",
  "/manager-dashboard",
  "/trainers-dashboard",
  "/member-dashboard",
  "/users-dashboard",
  "/cafe-dashboard",
  "/reception-dashboard",
];

export function middleware(req) {
  const token = req.cookies.get("accessToken") || req.cookies.get("token");
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin-dashboard/:path*",
    "/manager-dashboard/:path*",
    "/trainers-dashboard/:path*",
    "/member-dashboard/:path*",
    "/users-dashboard/:path*",
    "/cafe-dashboard/:path*",
    "/reception-dashboard/:path*",
  ],
};
