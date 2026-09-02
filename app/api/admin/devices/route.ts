import type { NextRequest } from "next/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/auth";
import { listDevices, getDevice, putDevice, deleteDevice, storeConfigured } from "@/lib/device-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin(req: NextRequest): Promise<boolean> {
  const secret = process.env.AUTH_SECRET || "";
  const s = await verifySession(req.cookies.get(ADMIN_COOKIE)?.value, secret);
  return Boolean(s && s.u === "admin");
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ devices: await listDevices(), persistent: storeConfigured });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let action = "", id = "", name = "";
  try {
    const body = await req.json();
    action = String(body?.action ?? "");
    id = String(body?.id ?? "");
    name = String(body?.name ?? "");
  } catch { /* ignore */ }

  if (!id || !action) return Response.json({ error: "Missing action or id." }, { status: 400 });

  if (action === "delete") {
    await deleteDevice(id);
    return Response.json({ ok: true });
  }

  const d = await getDevice(id);
  if (!d) return Response.json({ error: "Device not found." }, { status: 404 });

  if (action === "approve") d.status = "approved";
  else if (action === "revoke") d.status = "revoked";
  else if (action === "rename") d.name = name.slice(0, 60) || d.name;
  else return Response.json({ error: "Unknown action." }, { status: 400 });

  d.updatedAt = Date.now();
  await putDevice(d);
  return Response.json({ ok: true, device: d });
}
