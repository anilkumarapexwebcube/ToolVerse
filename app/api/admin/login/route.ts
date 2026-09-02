import type { NextRequest } from "next/server";
import { signSession, timingSafeEqual, ADMIN_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HITS = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  HITS.set(ip, arr);
  return arr.length > 6;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(ip)) return Response.json({ error: "Too many attempts. Wait a minute." }, { status: 429 });

  let keyInput = "";
  try {
    const body = await req.json();
    keyInput = String(body?.key ?? "").trim();
  } catch { /* ignore */ }

  const secret = process.env.AUTH_SECRET || "";
  const adminKey = process.env.ADMIN_KEY || "";
  if (!secret || !adminKey) return Response.json({ error: "Admin is not configured." }, { status: 503 });

  if (!keyInput || !timingSafeEqual(adminKey, keyInput)) {
    await new Promise((r) => setTimeout(r, 400));
    return Response.json({ error: "Invalid admin key." }, { status: 401 });
  }

  const ttl = (Number(process.env.SESSION_TTL_HOURS) || 168) * 3600;
  const token = await signSession("admin", ttl, secret);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const res = Response.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${ttl}`
  );
  return res;
}
