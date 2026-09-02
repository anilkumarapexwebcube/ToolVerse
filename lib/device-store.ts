/**
 * Device registry — the source of truth for which systems may access the app.
 *
 * Uses Upstash Redis (REST) so approvals persist and are shared across all
 * serverless instances. It reads whichever env var names are present:
 *   - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN  (Upstash direct)
 *   - KV_REST_API_URL / KV_REST_API_TOKEN                (Vercel Marketplace)
 *
 * If none are set it falls back to a local JSON file (dev only — Vercel's
 * filesystem is per-instance and ephemeral, so production needs the REST store).
 * The `node:fs` fallback is imported lazily so this module stays Edge-safe.
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

const REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
export const storeConfigured = Boolean(REST_URL && REST_TOKEN);

const IDS_KEY = "tv:devices";
const key = (id: string) => `tv:device:${id}`;

// ── Upstash / Vercel-KV REST helper (fetch only → Edge-safe) ─────────────────
async function redis(cmd: (string | number)[]): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(REST_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${REST_TOKEN}`, "content-type": "application/json" },
      body: JSON.stringify(cmd),
      cache: "no-store",
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`KV ${res.status}`);
    const json = (await res.json()) as { result: unknown };
    return json.result;
  } finally {
    clearTimeout(t);
  }
}

// ── Lazy file fallback (dev only) ────────────────────────────────────────────
let _fs: typeof import("node:fs") | null = null;
let _file = "";
async function fsref() {
  if (!_fs) {
    const [fs, os, path] = await Promise.all([import("node:fs"), import("node:os"), import("node:path")]);
    _fs = fs;
    _file = path.join(os.tmpdir(), "toolverse-device-store.json");
  }
  return { fs: _fs, file: _file };
}
async function readMap(): Promise<Record<string, Device>> {
  const { fs, file } = await fsref();
  try { return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, Device>; } catch { return {}; }
}
async function writeMap(map: Record<string, Device>): Promise<void> {
  const { fs, file } = await fsref();
  try { fs.writeFileSync(file, JSON.stringify(map), "utf8"); } catch { /* ignore */ }
}

// ── Public API ───────────────────────────────────────────────────────────────
export async function getDevice(id: string): Promise<Device | null> {
  if (!id) return null;
  if (!storeConfigured) return (await readMap())[id] ?? null;
  const raw = (await redis(["GET", key(id)])) as string | null;
  return raw ? (JSON.parse(raw) as Device) : null;
}

export async function putDevice(d: Device): Promise<void> {
  if (!storeConfigured) {
    const m = await readMap();
    m[d.id] = d;
    await writeMap(m);
    return;
  }
  await redis(["SET", key(d.id), JSON.stringify(d)]);
  await redis(["SADD", IDS_KEY, d.id]);
}

export async function deleteDevice(id: string): Promise<void> {
  if (!storeConfigured) {
    const m = await readMap();
    delete m[id];
    await writeMap(m);
    return;
  }
  await redis(["DEL", key(id)]);
  await redis(["SREM", IDS_KEY, id]);
}

export async function listDevices(): Promise<Device[]> {
  if (!storeConfigured) {
    return Object.values(await readMap()).sort((a, b) => b.updatedAt - a.updatedAt);
  }
  const ids = ((await redis(["SMEMBERS", IDS_KEY])) as string[]) || [];
  if (!ids.length) return [];
  const raws = (await redis(["MGET", ...ids.map(key)])) as (string | null)[];
  const out: Device[] = [];
  for (const raw of raws) if (raw) out.push(JSON.parse(raw) as Device);
  return out.sort((a, b) => b.updatedAt - a.updatedAt);
}
