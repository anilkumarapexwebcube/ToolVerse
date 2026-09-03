import type { NextRequest } from "next/server";
import { addFeedback, type Feedback } from "@/lib/feedback-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HITS = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < 60_000);
  arr.push(now);
  HITS.set(ip, arr);
  return arr.length > 10;
}

function esc(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

// Best-effort email via Resend (only if RESEND_API_KEY is set). Never throws.
async function emailOwner(fb: Feedback) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const to = process.env.FEEDBACK_TO_EMAIL || "anilkumar.apexweb.cube@gmail.com";
  const from = process.env.FEEDBACK_FROM_EMAIL || "ToolVerse <onboarding@resend.dev>";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        ...(fb.email ? { reply_to: fb.email } : {}),
        subject: `ToolVerse feedback · ${fb.type}${fb.email ? ` · ${fb.email}` : ""}`,
        html: `<h2>New ${esc(fb.type)} feedback</h2>
<p><b>From:</b> ${fb.email ? esc(fb.email) : "anonymous"}<br/>
<b>When:</b> ${new Date(fb.createdAt).toLocaleString()}<br/>
<b>IP:</b> ${esc(fb.ip)}</p>
<p style="white-space:pre-wrap;border-left:3px solid #c9a84c;padding-left:12px">${esc(fb.message)}</p>`,
      }),
    });
  } catch {
    /* email is best-effort — feedback is already stored */
  }
}

// submit feedback (any approved device — the proxy already gates access)
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(ip)) return Response.json({ error: "Too many submissions. Please wait a minute." }, { status: 429 });

  let message = "", email = "", type = "";
  try {
    const b = await req.json();
    message = String(b?.message ?? "").trim();
    email = String(b?.email ?? "").trim().toLowerCase();
    type = String(b?.type ?? "Other").trim();
  } catch { /* ignore */ }

  if (message.length < 3) return Response.json({ error: "Please write a bit more." }, { status: 400 });
  if (message.length > 4000) message = message.slice(0, 4000);

  const fb: Feedback = {
    id: crypto.randomUUID(),
    type: ["Bug", "Idea", "Question", "Other"].includes(type) ? type : "Other",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "",
    message,
    ua: req.headers.get("user-agent") || "",
    ip,
    createdAt: Date.now(),
  };
  await addFeedback(fb);
  await emailOwner(fb); // best-effort; won't fail the request
  return Response.json({ ok: true });
}
