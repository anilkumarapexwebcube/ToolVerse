/**
 * Stateless signed-session auth using HMAC-SHA256 (Web Crypto — works in the
 * Node proxy runtime and route handlers). The session token is
 *   base64url(payload) . base64url(HMAC(payload, AUTH_SECRET))
 * and carries only { u, exp } — no secret ever reaches the client.
 */

export const SESSION_COOKIE = "tv_session";
export const DEVICE_COOKIE = "tv_device";
export const ADMIN_COOKIE = "tv_admin";

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(input: ArrayBuffer | Uint8Array): string {
  const arr = input instanceof Uint8Array ? input : new Uint8Array(input);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(str: string): Uint8Array {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** length-safe, content-constant-time string compare */
export function timingSafeEqual(a: string, b: string): boolean {
  const enca = enc.encode(a);
  const encb = enc.encode(b);
  // compare against a fixed length so early-exit doesn't leak length via timing
  const len = Math.max(enca.length, encb.length);
  let diff = enca.length ^ encb.length;
  for (let i = 0; i < len; i++) diff |= (enca[i] ?? 0) ^ (encb[i] ?? 0);
  return diff === 0;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

export async function signSession(user: string, ttlSeconds: number, secret: string): Promise<string> {
  const payload = { u: user, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const p = b64url(enc.encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(p));
  return `${p}.${b64url(sig)}`;
}

export async function verifySession(
  token: string | undefined | null,
  secret: string
): Promise<{ u: string; exp: number } | null> {
  if (!token || !secret) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const p = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const key = await hmacKey(secret);
    const expected = b64url(await crypto.subtle.sign("HMAC", key, enc.encode(p)));
    if (!timingSafeEqual(sig, expected)) return null;
    const payload = JSON.parse(dec.decode(b64urlToBytes(p)));
    if (typeof payload?.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (typeof payload?.u !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}
