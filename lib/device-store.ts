/**
 * Device registry — the source of truth for which systems may access the app.
 *
 * In production it uses Upstash Redis (REST) so approvals persist across
 * serverless instances. If Upstash env vars are absent it falls back to an
 * in-memory Map (fine for local dev; NOT persistent — do not use in prod).
 */

export type DeviceStatus = "pending" | "approved" | "revoked";
export interface Device {
  id: string;
  name: string;
  email: string;
  status: DeviceStatus;
  ua: string;
  ip: string;
  createdAt: number;
  updatedAt: number;
  lastSeen: number;
}

const URL_ = process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
export const storeConfigured = Boolean(URL_ && TOKEN);

const IDS_KEY = "tv:devices";
const key = (id: string) => `tv:device:${id}`;

// ── Upstash REST helper ──────────────────────────────────────────────────────
async function redis(cmd: (string | number)[]): Promise<unknown> {
  const res = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const json = (await res.json()) as { result: unknown };
  return json.result;
}

// ── File fallback (dev only) ─────────────────────────────────────────────────
// A JSON file on the local machine so the Proxy and Route Handlers (separate
// module instances) still share the same registry. Not for production — Vercel's
// filesystem is ephemeral and per-instance; use Upstash there.
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const FILE = join(tmpdir(), "toolverse-device-store.json");

function readFile(): Record<string, Device> {
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as Record<string, Device>;
  } catch {
    return {};
  }
}
function writeFile(map: Record<string, Device>): void {
  try {
    writeFileSync(FILE, JSON.stringify(map), "utf8");
  } catch {
    /* ignore */
  }
}

// ── Public API ───────────────────────────────────────────────────────────────
export async function getDevice(id: string): Promise<Device | null> {
  if (!id) return null;
  if (!storeConfigured) return readFile()[id] ?? null;
  const raw = (await redis(["GET", key(id)])) as string | null;
  return raw ? (JSON.parse(raw) as Device) : null;
}

export async function putDevice(d: Device): Promise<void> {
  if (!storeConfigured) {
    const m = readFile();
    m[d.id] = d;
    writeFile(m);
    return;
  }
  await redis(["SET", key(d.id), JSON.stringify(d)]);
  await redis(["SADD", IDS_KEY, d.id]);
}

export async function deleteDevice(id: string): Promise<void> {
  if (!storeConfigured) {
    const m = readFile();
    delete m[id];
    writeFile(m);
    return;
  }
  await redis(["DEL", key(id)]);
  await redis(["SREM", IDS_KEY, id]);
}

export async function listDevices(): Promise<Device[]> {
  if (!storeConfigured) {
    return Object.values(readFile()).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  const ids = ((await redis(["SMEMBERS", IDS_KEY])) as string[]) || [];
  if (!ids.length) return [];
  const raws = (await redis(["MGET", ...ids.map(key)])) as (string | null)[];
  const out: Device[] = [];
  for (const raw of raws) if (raw) out.push(JSON.parse(raw) as Device);
  return out.sort((a, b) => b.updatedAt - a.updatedAt);
}

/** touch lastSeen without a full read-modify-write race (best effort) */
export async function markSeen(id: string): Promise<void> {
  const d = await getDevice(id);
  if (!d) return;
  d.lastSeen = Date.now();
  await putDevice(d);
}
