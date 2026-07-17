import type { NextRequest } from "next/server";
import { getDomainInsights, normalizeDomain } from "@/lib/domain-insights";

// external network calls + live fetch → always run on the Node runtime, dynamic
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// naive in-memory cache + rate limit (per warm serverless instance)
const CACHE = new Map<string, { at: number; data: unknown }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 min
const HITS = new Map<string, number[]>();
const RATE_WINDOW = 60 * 1000;
const RATE_MAX = 20; // requests / IP / minute

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  arr.push(now);
  HITS.set(ip, arr);
  return arr.length > RATE_MAX;
}

async function resolveDomain(req: NextRequest): Promise<string | null> {
  const fromQuery = req.nextUrl.searchParams.get("domain");
  if (fromQuery) return fromQuery;
  try {
    const body = await req.json();
    return typeof body?.domain === "string" ? body.domain : null;
  } catch {
    return null;
  }
}

async function handle(req: NextRequest, raw: string | null) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "local";

  if (rateLimited(ip)) {
    return Response.json(
      { error: "Rate limit reached. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  const domain = normalizeDomain(raw || "");
  if (!domain) {
    return Response.json(
      { error: "Enter a valid domain, e.g. example.com" },
      { status: 400 }
    );
  }

  const cached = CACHE.get(domain);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return Response.json({ cached: true, ...(cached.data as object) });
  }

  try {
    const data = await getDomainInsights(domain, process.env.OPENPAGERANK_API_KEY);
    CACHE.set(domain, { at: Date.now(), data });
    return Response.json({ cached: false, ...data });
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error
            ? `Analysis failed: ${err.message}`
            : "Analysis failed unexpectedly.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return handle(req, await resolveDomain(req));
}

export async function GET(req: NextRequest) {
  return handle(req, req.nextUrl.searchParams.get("domain"));
}
