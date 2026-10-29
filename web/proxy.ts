import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminHeaders } from "./lib/admin-auth";

export function proxy(request: NextRequest) {
  const auth = adminAuth(request.headers.get("authorization"));
  if (auth !== "ok") {
    return new NextResponse(auth === "unconfigured" ? "Admin access is not configured." : "Authentication required.", {
      status: auth === "unconfigured" ? 503 : 401,
      headers: { ...adminHeaders, ...(auth === "denied" ? { "WWW-Authenticate": 'Basic realm="Site owner analytics", charset="UTF-8"' } : {}) },
    });
  }
  const response = NextResponse.next();
  for (const [name, value] of Object.entries(adminHeaders)) response.headers.set(name, value);
  return response;
}

export const config = { matcher: ["/admin/analytics/:path*"] };
