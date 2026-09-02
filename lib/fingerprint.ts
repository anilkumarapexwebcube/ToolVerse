/**
 * Client-side device fingerprint — a stable hash of hardware/OS signals.
 *
 * Tuned to stay the SAME across browser profiles, private/incognito windows AND
 * (best-effort) different browsers on the same machine. To do that it uses only
 * hardware/OS signals that browsers report consistently, and normalises the
 * noisy ones:
 *   - browser-specific strings (userAgent, languages) are excluded
 *   - zoom-dependent (devicePixelRatio) and vendor-only (deviceMemory) signals
 *     are excluded because they differ between browsers / with zoom
 *   - the GPU renderer is normalised to its model keyword so Chrome's
 *     "ANGLE (NVIDIA, GeForce RTX 3060 …)" and Firefox's "GeForce RTX 3060 …"
 *     collapse to the same value
 *
 * Not a perfect machine ID (browsers prevent that for privacy) but strong and
 * stable enough to recognise a trusted system without asking again.
 */

function osFamily(ua: string): string {
  if (/Windows NT 10/.test(ua)) return "win10";
  if (/Windows NT/.test(ua)) return "win";
  if (/Mac OS X/.test(ua)) return "macos";
  if (/Android/.test(ua)) return "android";
  if (/iPhone|iPad|iPod|iOS/.test(ua)) return "ios";
  if (/CrOS/.test(ua)) return "chromeos";
  if (/Linux/.test(ua)) return "linux";
  return "other";
}

function normalizeGpu(): string {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return "nogpu";
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const raw = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER) || "").toLowerCase();
    // pull the GPU model so different browsers' wrappers collapse together
    const m = raw.match(/(geforce|radeon|rtx|gtx|apple\s?m\d|apple|adreno|mali|iris|uhd graphics|hd graphics|vega|arc)[a-z0-9 ]*/);
    return (m ? m[0] : raw).replace(/\b(direct3d|opengl|vulkan|metal|angle|pcie|sse2|ssse3|d3d11|d3d9)\b/g, "").replace(/[^a-z0-9]/g, "");
  } catch {
    return "gpuerr";
  }
}

export async function getFingerprint(): Promise<string> {
  const ua = navigator.userAgent || "";
  const w = Math.max(screen.width, screen.height);
  const h = Math.min(screen.width, screen.height);
  const signals = [
    osFamily(ua),
    navigator.platform || "",
    String(navigator.hardwareConcurrency || ""),
    `${w}x${h}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    String(new Date().getTimezoneOffset()),
    String(navigator.maxTouchPoints || 0),
    normalizeGpu(),
  ].join("|");

  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(signals));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
