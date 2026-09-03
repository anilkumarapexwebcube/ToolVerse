/**
 * Feedback store — same Upstash-REST-or-file strategy as the device store.
 * Persists user feedback so the owner can read it in the admin panel.
 */

export interface Feedback {
  id: string;
  type: string;
  email: string;
  message: string;
  ua: string;
  ip: string;
  createdAt: number;
}

const REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "";
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "";
const configured = Boolean(REST_URL && REST_TOKEN);

const IDS_KEY = "tv:feedback";
const key = (id: string) => `tv:fb:${id}`;

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
    return ((await res.json()) as { result: unknown }).result;
  } finally {
    clearTimeout(t);
  }
}

// lazy file fallback (dev)
let _fs: typeof import("node:fs") | null = null;
let _file = "";
async function fsref() {
  if (!_fs) {
    const [fs, os, path] = await Promise.all([import("node:fs"), import("node:os"), import("node:path")]);
    _fs = fs;
    _file = path.join(os.tmpdir(), "toolverse-feedback-store.json");
  }
  return { fs: _fs, file: _file };
}
async function readMap(): Promise<Record<string, Feedback>> {
  const { fs, file } = await fsref();
  try { return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, Feedback>; } catch { return {}; }
}
async function writeMap(m: Record<string, Feedback>): Promise<void> {
  const { fs, file } = await fsref();
  try { fs.writeFileSync(file, JSON.stringify(m), "utf8"); } catch { /* ignore */ }
}

export async function addFeedback(f: Feedback): Promise<void> {
  if (!configured) {
    const m = await readMap();
    m[f.id] = f;
    await writeMap(m);
    return;
  }
  await redis(["SET", key(f.id), JSON.stringify(f)]);
  await redis(["SADD", IDS_KEY, f.id]);
}

export async function deleteFeedback(id: string): Promise<void> {
  if (!configured) {
    const m = await readMap();
    delete m[id];
    await writeMap(m);
    return;
  }
  await redis(["DEL", key(id)]);
  await redis(["SREM", IDS_KEY, id]);
}

export async function listFeedback(): Promise<Feedback[]> {
  if (!configured) {
    return Object.values(await readMap()).sort((a, b) => b.createdAt - a.createdAt);
  }
  const ids = ((await redis(["SMEMBERS", IDS_KEY])) as string[]) || [];
  if (!ids.length) return [];
  const raws = (await redis(["MGET", ...ids.map(key)])) as (string | null)[];
  const out: Feedback[] = [];
  for (const raw of raws) if (raw) out.push(JSON.parse(raw) as Feedback);
  return out.sort((a, b) => b.createdAt - a.createdAt);
}
