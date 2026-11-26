import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// Next.js 16: "proxy" menggantikan "middleware". Lapis pertama proteksi /admin/*.
export async function proxy(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  const session = secret
    ? await verifySession(request.cookies.get(SESSION_COOKIE)?.value, secret)
    : null;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
