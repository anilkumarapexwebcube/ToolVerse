import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, DEVICE_COOKIE } from "@/lib/auth";
import { getDevice } from "@/lib/device-store";

// Device-gate is skipped for these zones (they protect themselves).
const OPEN = ["/access", "/api/device", "/admin", "/api/admin"];

function harden(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (OPEN.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return harden(NextResponse.next());
  }

  const secret = process.env.AUTH_SECRET || "";
  const session = await verifySession(req.cookies.get(DEVICE_COOKIE)?.value, secret);
  const device = session ? await getDevice(session.u) : null;

  if (device && device.status === "approved") {
    return harden(NextResponse.next());
  }

  // this system is not approved →
  if (pathname.startsWith("/api")) {
    return harden(NextResponse.json({ error: "This device is not authorized." }, { status: 401 }));
  }
  const url = req.nextUrl.clone();
  url.pathname = "/access";
  url.search = "";
  return harden(NextResponse.redirect(url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|robots.txt|sitemap.xml).*)"],
};
