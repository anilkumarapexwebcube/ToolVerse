import type { NextRequest } from "next/server";
import { verifySession, ADMIN_COOKIE } from "@/lib/auth";
import { listFeedback, deleteFeedback } from "@/lib/feedback-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdmin(req: NextRequest): Promise<boolean> {
  const s = await verifySession(req.cookies.get(ADMIN_COOKIE)?.value, process.env.AUTH_SECRET || "");
  return Boolean(s && s.u === "admin");
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ feedback: await listFeedback() });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let id = "";
  try { id = String((await req.json())?.id ?? ""); } catch { /* ignore */ }
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  await deleteFeedback(id);
  return Response.json({ ok: true });
}
