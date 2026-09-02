import type { NextRequest } from "next/server";
import { signSession, DEVICE_COOKIE } from "@/lib/auth";
import { getDevice, putDevice, type Device } from "@/lib/device-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEVICE_TTL = 60 * 60 * 24 * 365; // 1 year

function friendlyName(ua: string): string {
  const os =
    /Windows NT 10/.test(ua) ? "Windows" :
    /Mac OS X/.test(ua) ? "macOS" :
    /Android/.test(ua) ? "Android" :
    /iPhone|iPad|iOS/.test(ua) ? "iOS" :
    /Linux/.test(ua) ? "Linux" : "Unknown OS";
  return os;
}

function setCookie(res: Response, id: string, secret: string) {
  return signSession(id, DEVICE_TTL, secret).then((token) => {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.headers.append(
      "Set-Cookie",
      `${DEVICE_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${DEVICE_TTL}`
    );
  });
}

/**
 * Resolve this machine. Recognises an already-approved system by its
 * fingerprint (so a new profile / private window on the same machine gets in
 * without asking again). Creates a pending record only when an email is given.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.AUTH_SECRET || "";
  if (!secret) return Response.json({ error: "Access is not configured." }, { status: 503 });

  let fp = "", email = "";
  try {
    const body = await req.json();
    fp = String(body?.fp ?? "").trim().toLowerCase();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch { /* ignore */ }

  if (!/^[a-f0-9]{64}$/.test(fp)) {
    return Response.json({ error: "Could not identify this device." }, { status: 400 });
  }

  const id = `d_${fp}`;
  const now = Date.now();
  const existing = await getDevice(id);

  if (existing) {
    existing.lastSeen = now;
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && existing.email !== email) {
      existing.email = email;
      existing.updatedAt = now;
    }
    await putDevice(existing);
    const res = Response.json({ status: existing.status, name: existing.name, email: existing.email });
    // bind this browser context so subsequent requests are fast
    await setCookie(res, id, secret);
    return res;
  }

  // unknown machine — only create a pending record once we have an email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ status: "none" });
  }

  const ua = req.headers.get("user-agent") || "";
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  const device: Device = {
    id,
    name: friendlyName(ua),
    email,
    status: "pending",
    ua,
    ip,
    createdAt: now,
    updatedAt: now,
    lastSeen: now,
  };
  await putDevice(device);

  const res = Response.json({ status: "pending", name: device.name, email });
  await setCookie(res, id, secret);
  return res;
}
