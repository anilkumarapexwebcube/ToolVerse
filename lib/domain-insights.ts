/* eslint-disable @typescript-eslint/no-explicit-any -- this module parses untyped third-party JSON (RDAP, DoH, Open PageRank, Wayback) */
/**
 * Domain Insights — free, transparent domain intelligence.
 *
 * IMPORTANT (honesty): Ahrefs DR, Moz DA and SEMrush traffic are proprietary,
 * paid-only metrics. Nothing here scrapes or fakes those numbers. Instead we
 * combine genuinely-free / open data sources and label every value with its
 * origin, marking derived numbers as estimates:
 *
 *   - Open PageRank (Keywords Everywhere)  → authority (0-100) + referring domains   [needs free API key]
 *   - Tranco list API                      → global popularity rank                  [keyless]
 *   - RDAP                                 → domain age, registrar, expiry           [keyless]
 *   - DNS-over-HTTPS (Cloudflare)          → IP, nameservers, mail/SPF               [keyless]
 *   - Wayback Machine (Internet Archive)   → first-seen-on-web date                  [keyless]
 *   - Live homepage fetch                  → HTTPS/SSL, title, meta, H1/H2, tech     [keyless]
 */

const UA =
  "Mozilla/5.0 (compatible; ToolVersePro-DomainInsights/1.0; +https://toolverse.pro)";

// ── Public types ───────────────────────────────────────────────────────────

export interface MetricSource {
  label: string; // human name of the data source
  estimate: boolean; // true = derived/approximate, not a measured value
}

export interface DomainInsights {
  domain: string;
  fetchedAt: string;
  /** overall 0-100 authority (real if OPR configured, else estimated) */
  authority: {
    score: number | null;
    estimated: boolean;
    openPageRank: number | null; // raw 0-10 value
    referringDomains: number | null;
    configured: boolean; // is the OPR API key present?
    source: MetricSource;
    note?: string;
  };
  /** headline SEO metrics by the names people expect (all estimated from open data) */
  metrics: {
    da: number; // Domain Authority (Moz-style), 0-100
    pa: number; // Page Authority (Moz-style) for the homepage, 0-100
    dr: number; // Domain Rating (Ahrefs-style), 0-100
    estimated: boolean; // always true unless a licensed provider is wired in
    configured: boolean; // is Open PageRank key present (anchors DR/DA)?
    source: MetricSource;
  };
  traffic: {
    globalRank: number | null; // Tranco global rank
    estimatedMonthlyVisits: number | null; // total visits, all channels (SimilarWeb-style)
    organicVisits: number | null; // estimated Google-organic visits (Ahrefs-style)
    organicSharePct: number; // modeled organic share used (0-100)
    tier: string; // human label e.g. "Very High", "Low"
    source: MetricSource;
  };
  domainInfo: {
    ageYears: number | null;
    createdAt: string | null;
    expiresAt: string | null;
    updatedAt: string | null;
    registrar: string | null;
    statuses: string[];
    firstSeenWeb: string | null; // Wayback earliest capture (YYYY-MM-DD)
    source: MetricSource;
  };
  dns: {
    ip: string | null;
    ipCount: number;
    nameservers: string[];
    mailProvider: string | null;
    hasMx: boolean;
    hasSpf: boolean;
    hasDmarc: boolean;
    source: MetricSource;
  };
  onPage: {
    reachable: boolean;
    finalUrl: string | null;
    httpStatus: number | null;
    https: boolean;
    responseMs: number | null;
    server: string | null;
    poweredBy: string | null;
    title: string | null;
    titleLength: number;
    metaDescription: string | null;
    metaDescriptionLength: number;
    h1Count: number;
    h2Count: number;
    wordCount: number;
    hasViewport: boolean;
    hasCanonical: boolean;
    hasOpenGraph: boolean;
    hasStructuredData: boolean;
    noindex: boolean;
    tech: string[];
    source: MetricSource;
  };
  /** 0-100 quick SEO health from the free on-page + trust signals */
  healthScore: number;
  checks: { label: string; ok: boolean; detail?: string }[];
  warnings: string[]; // per-source soft failures (timeouts etc.)
}

// ── Small utilities ──────────────────────────────────────────────────────────

/** fetch with a hard timeout; never throws — returns null on any failure */
async function safeFetch(
  url: string,
  opts: RequestInit & { timeoutMs?: number } = {}
): Promise<Response | null> {
  const { timeoutMs = 8000, ...rest } = opts;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...rest,
      signal: ctrl.signal,
      headers: { "user-agent": UA, ...(rest.headers || {}) },
      redirect: "follow",
      cache: "no-store",
    });
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Validate + normalise a raw user string into a bare hostname. */
export function normalizeDomain(raw: string): string | null {
  if (!raw) return null;
  let s = raw.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  s = s.split("/")[0].split("?")[0].split("#")[0].split(":")[0];
  // strict-ish hostname check, supports IDN (punycode/ascii) + multi-level TLDs
  const ok = /^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(s);
  return ok ? s : null;
}

// ── Source: Open PageRank (authority + referring domains) ────────────────────

async function fetchOpenPageRank(domain: string, apiKey: string | undefined) {
  if (!apiKey) {
    return {
      configured: false as const,
      found: false,
      openPageRank: null as number | null,
      globalRank: null as number | null,
      referringDomains: null as number | null,
    };
  }
  // New endpoint (Keywords Everywhere). Old openpagerank.com keys also work here
  // until 2026-09-30, after which only this endpoint remains.
  const res = await safeFetch(
    "https://openpagerank.keywordseverywhere.com/v1/domains/bulk",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ domains: [domain] }),
      timeoutMs: 9000,
    }
  );
  if (!res || !res.ok) {
    return {
      configured: true as const,
      found: false,
      openPageRank: null,
      globalRank: null,
      referringDomains: null,
      error: res ? `OPR HTTP ${res.status}` : "OPR unreachable",
    };
  }
  try {
    const json: any = await res.json();
    const row =
      json?.results?.[0] ?? json?.response?.[0] ?? json?.data?.[0] ?? json?.[0];
    const opr = Number(
      row?.open_page_rank ?? row?.page_rank_decimal ?? row?.rank_decimal
    );
    const refDomains = Number(row?.referring_domains);
    return {
      configured: true as const,
      found: Boolean(row?.found ?? !Number.isNaN(opr)),
      openPageRank: Number.isFinite(opr) ? opr : null,
      globalRank:
        row?.rank != null && !Number.isNaN(Number(row.rank))
          ? Number(row.rank)
          : null,
      referringDomains: Number.isFinite(refDomains) ? refDomains : null,
    };
  } catch {
    return {
      configured: true as const,
      found: false,
      openPageRank: null,
      globalRank: null,
      referringDomains: null,
      error: "OPR parse error",
    };
  }
}

// ── Source: Tranco (global popularity rank) ──────────────────────────────────

async function fetchTranco(domain: string): Promise<number | null> {
  const res = await safeFetch(
    `https://tranco-list.eu/api/ranks/domain/${encodeURIComponent(domain)}`,
    { headers: { accept: "application/json" }, timeoutMs: 8000 }
  );
  if (!res || !res.ok) return null;
  try {
    const json: any = await res.json();
    const ranks: any[] = json?.ranks || [];
    // ranks are chronological; take the most recent non-null entry
    for (let i = ranks.length - 1; i >= 0; i--) {
      const r = Number(ranks[i]?.rank);
      if (Number.isFinite(r) && r > 0) return r;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Source: RDAP (domain age / registrar) ────────────────────────────────────

async function fetchRdap(domain: string) {
  const res = await safeFetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
    headers: { accept: "application/rdap+json, application/json" },
    timeoutMs: 9000,
  });
  const empty = {
    createdAt: null as string | null,
    expiresAt: null as string | null,
    updatedAt: null as string | null,
    registrar: null as string | null,
    statuses: [] as string[],
  };
  if (!res || !res.ok) return empty;
  try {
    const json: any = await res.json();
    const events: any[] = json?.events || [];
    const byAction = (a: string) =>
      events.find((e) => e?.eventAction === a)?.eventDate ?? null;

    let registrar: string | null = null;
    for (const ent of json?.entities || []) {
      const roles: string[] = ent?.roles || [];
      if (roles.includes("registrar")) {
        // vCard: ["vcard", [ ["fn", {}, "text", "Registrar Name"], ... ]]
        const vcard: any[] = ent?.vcardArray?.[1] || [];
        const fn = vcard.find((f: any[]) => f?.[0] === "fn");
        registrar = fn?.[3] ?? ent?.handle ?? null;
        if (registrar) break;
      }
    }
    return {
      createdAt: byAction("registration"),
      expiresAt: byAction("expiration"),
      updatedAt: byAction("last changed") || byAction("last update of RDAP database"),
      registrar,
      statuses: Array.isArray(json?.status) ? json.status : [],
    };
  } catch {
    return empty;
  }
}

// ── Source: Wayback Machine (first seen on the web) ──────────────────────────

async function fetchWaybackFirstSeen(domain: string): Promise<string | null> {
  const res = await safeFetch(
    `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(
      domain
    )}&output=json&fl=timestamp&limit=1&from=1996`,
    { timeoutMs: 8000 }
  );
  if (!res || !res.ok) return null;
  try {
    const rows: any[] = await res.json();
    // first row is the header ["timestamp"]; second row is the earliest capture
    const ts: string | undefined = rows?.[1]?.[0];
    if (!ts || ts.length < 8) return null;
    return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
  } catch {
    return null;
  }
}

// ── Source: DNS-over-HTTPS (Cloudflare) ──────────────────────────────────────

async function dohQuery(domain: string, type: string): Promise<any[]> {
  const res = await safeFetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(
      domain
    )}&type=${type}`,
    { headers: { accept: "application/dns-json" }, timeoutMs: 6000 }
  );
  if (!res || !res.ok) return [];
  try {
    const json: any = await res.json();
    return json?.Answer || [];
  } catch {
    return [];
  }
}

async function fetchDns(domain: string) {
  const [a, ns, mx, txt, dmarc] = await Promise.all([
    dohQuery(domain, "A"),
    dohQuery(domain, "NS"),
    dohQuery(domain, "MX"),
    dohQuery(domain, "TXT"),
    dohQuery(`_dmarc.${domain}`, "TXT"),
  ]);

  const ips = a.filter((r) => r.type === 1).map((r) => r.data);
  const nameservers = ns
    .filter((r) => r.type === 2)
    .map((r) => String(r.data).replace(/\.$/, ""));
  const mxHosts = mx
    .filter((r) => r.type === 15)
    .map((r) => String(r.data).split(" ").pop()?.replace(/\.$/, "") || "");
  const txtRecords = txt.map((r) => String(r.data).replace(/^"|"$/g, ""));
  const dmarcRecords = dmarc.map((r) => String(r.data));

  const hasSpf = txtRecords.some((t) => /v=spf1/i.test(t));
  const hasDmarc = dmarcRecords.some((t) => /v=DMARC1/i.test(t));

  // best-effort mail provider guess from the first MX host
  let mailProvider: string | null = null;
  const mxJoined = mxHosts.join(" ").toLowerCase();
  if (/google|googlemail|aspmx/.test(mxJoined)) mailProvider = "Google Workspace";
  else if (/outlook|microsoft|office365|hotmail/.test(mxJoined))
    mailProvider = "Microsoft 365";
  else if (/zoho/.test(mxJoined)) mailProvider = "Zoho Mail";
  else if (/protonmail|proton\.me/.test(mxJoined)) mailProvider = "Proton Mail";
  else if (/yandex/.test(mxJoined)) mailProvider = "Yandex";
  else if (/amazonaws|amazonses/.test(mxJoined)) mailProvider = "Amazon SES";
  else if (mxHosts[0]) mailProvider = mxHosts[0];

  return {
    ip: ips[0] || null,
    ipCount: ips.length,
    nameservers,
    mailProvider,
    hasMx: mxHosts.length > 0,
    hasSpf,
    hasDmarc,
  };
}

// ── Source: live homepage fetch (on-page SEO + tech) ─────────────────────────

function extractTag(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1].trim().replace(/\s+/g, " ") : null;
}

async function fetchOnPage(domain: string) {
  const start = Date.now();
  const res = await safeFetch(`https://${domain}`, {
    timeoutMs: 10000,
    headers: {
      accept: "text/html,application/xhtml+xml",
      "accept-language": "en-US,en;q=0.9",
    },
  });
  const responseMs = Date.now() - start;

  const base = {
    reachable: false,
    finalUrl: null as string | null,
    httpStatus: null as number | null,
    https: false,
    responseMs: null as number | null,
    server: null as string | null,
    poweredBy: null as string | null,
    title: null as string | null,
    titleLength: 0,
    metaDescription: null as string | null,
    metaDescriptionLength: 0,
    h1Count: 0,
    h2Count: 0,
    wordCount: 0,
    hasViewport: false,
    hasCanonical: false,
    hasOpenGraph: false,
    hasStructuredData: false,
    noindex: false,
    tech: [] as string[],
  };
  if (!res) return base;

  const finalUrl = res.url || `https://${domain}`;
  const server = res.headers.get("server");
  const poweredBy = res.headers.get("x-powered-by");
  let html = "";
  try {
    // cap body read at ~500KB to stay fast
    const buf = await res.arrayBuffer();
    html = new TextDecoder("utf-8").decode(buf.slice(0, 500_000));
  } catch {
    /* ignore body errors, keep header data */
  }

  const title = extractTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription = extractTag(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i
  );
  const robots =
    extractTag(
      html,
      /<meta[^>]+name=["']robots["'][^>]+content=["']([\s\S]*?)["']/i
    ) || "";
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;

  // rough visible-word count
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ");
  const wordCount = (text.match(/\b[\p{L}\p{N}][\p{L}\p{N}'-]*\b/gu) || []).length;

  // tech fingerprinting (lightweight, header + html hints)
  const tech = new Set<string>();
  const lc = html.toLowerCase();
  if (poweredBy) tech.add(poweredBy);
  if (server) tech.add(server);
  if (/wp-content|wp-includes|wordpress/i.test(lc)) tech.add("WordPress");
  if (/\/_next\/|__next_data__/i.test(lc)) tech.add("Next.js");
  if (/data-reactroot|react\.production/i.test(lc)) tech.add("React");
  if (/cdn\.shopify\.com|shopify/i.test(lc)) tech.add("Shopify");
  if (/wix\.com|_wix/i.test(lc)) tech.add("Wix");
  if (/squarespace/i.test(lc)) tech.add("Squarespace");
  if (/drupal-settings-json|drupal/i.test(lc)) tech.add("Drupal");
  if (/joomla/i.test(lc)) tech.add("Joomla");
  if (/gtag\(|googletagmanager|google-analytics/i.test(lc))
    tech.add("Google Analytics");
  if (/cloudflare/i.test((server || "").toLowerCase())) tech.add("Cloudflare");

  return {
    reachable: true,
    finalUrl,
    httpStatus: res.status,
    https: finalUrl.startsWith("https://"),
    responseMs,
    server,
    poweredBy,
    title,
    titleLength: title?.length ?? 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length ?? 0,
    h1Count,
    h2Count,
    wordCount,
    hasViewport: /<meta[^>]+name=["']viewport["']/i.test(html),
    hasCanonical: /<link[^>]+rel=["']canonical["']/i.test(html),
    hasOpenGraph: /<meta[^>]+property=["']og:/i.test(html),
    hasStructuredData: /application\/ld\+json/i.test(html),
    noindex: /noindex/i.test(robots),
    tech: [...tech].slice(0, 10),
  };
}

// ── Derived: traffic estimate from popularity rank ───────────────────────────

function estimateTrafficFromRank(rank: number | null): {
  visits: number | null;
  tier: string;
} {
  if (!rank || rank <= 0) return { visits: null, tier: "Unranked (low)" };
  // piecewise log-log interpolation through anchors calibrated against public
  // SimilarWeb/Semrush figures for sites at those ranks. ESTIMATE only.
  const anchors: [number, number][] = [
    [1, 8.0e10],      // #1 google-scale (~80B/mo total)
    [10, 2.0e9],
    [100, 2.0e8],
    [1_000, 1.5e7],
    [10_000, 2.0e6],
    [100_000, 2.0e5],
    [1_000_000, 2.0e4],
  ];
  let visits: number;
  if (rank >= 1_000_000) {
    // extrapolate below the top-1M with the last segment's slope
    visits = 3.0e4 * Math.pow(1_000_000 / rank, 1);
  } else {
    let i = 0;
    while (i < anchors.length - 2 && rank > anchors[i + 1][0]) i++;
    const [r1, v1] = anchors[i];
    const [r2, v2] = anchors[i + 1];
    const t = (Math.log10(rank) - Math.log10(r1)) / (Math.log10(r2) - Math.log10(r1));
    visits = Math.pow(10, Math.log10(v1) + t * (Math.log10(v2) - Math.log10(v1)));
  }
  let tier = "Low";
  if (rank <= 1_000) tier = "Very High";
  else if (rank <= 10_000) tier = "High";
  else if (rank <= 100_000) tier = "Medium";
  else if (rank <= 1_000_000) tier = "Modest";
  return { visits: Math.round(clamp(visits, 50, 100_000_000_000)), tier };
}

/**
 * Estimated share of traffic that comes from Google organic search.
 * Real per-site organic share (Ahrefs-style) needs a keyword database (paid);
 * this models it from free on-page signals. ROUGH ESTIMATE.
 */
function estimateOrganicShare(args: {
  wordCount: number;
  ageYears: number | null;
  hasStructuredData: boolean;
  h2Count: number;
}): number {
  const { wordCount, ageYears, hasStructuredData, h2Count } = args;
  // baseline ~ typical organic share of total visits across the web (~25%)
  let share = 0.25;
  if (wordCount > 2000) share += 0.08; // content-heavy → more organic
  else if (wordCount < 300) share -= 0.10; // thin/app homepage → less organic
  if ((ageYears ?? 0) > 8) share += 0.04; // established sites rank more
  if (hasStructuredData) share += 0.03;
  if (h2Count >= 8) share += 0.03; // structured long-form content
  return clamp(share, 0.06, 0.55);
}

// ── Derived: estimated authority when Open PageRank is unavailable ────────────

function estimateAuthority(args: {
  rank: number | null;
  ageYears: number | null;
  https: boolean;
  reachable: boolean;
  hasSpf: boolean;
  onPageQualityHint: number; // 0-1
}): number {
  const { rank, ageYears, https, reachable, hasSpf, onPageQualityHint } = args;
  let score = 0;
  // popularity (up to 55 pts) — log scale over the top 1M
  if (rank && rank > 0) {
    score += clamp(55 * (1 - Math.log10(rank) / 6), 0, 55);
  }
  // domain age (up to 20 pts) — 10y ≈ full
  if (ageYears != null) score += clamp((ageYears / 10) * 20, 0, 20);
  // trust/tech signals (up to 25 pts)
  if (reachable) score += 6;
  if (https) score += 8;
  if (hasSpf) score += 3;
  score += clamp(onPageQualityHint * 8, 0, 8);
  return Math.round(clamp(score, 0, 100));
}

// ── Derived: DA / PA / DR estimates (the metrics people ask for by name) ──────
// NOTE: real Moz DA/PA & Ahrefs DR are proprietary paid metrics. These are
// transparent open-data ESTIMATES using the same 0-100 scale, anchored on Open
// PageRank when a key is present. They approximate, they do not replace, Moz/Ahrefs.

function computeMetrics(args: {
  oprScore: number | null; // Open PageRank mapped to 0-100 (null if not configured)
  referringDomains: number | null;
  rank: number | null;
  ageYears: number | null;
  https: boolean;
  reachable: boolean;
  hasSpf: boolean;
  onPageQuality: number; // 0-1
}): { da: number; pa: number; dr: number } {
  const { oprScore, referringDomains, rank, ageYears, https, reachable, hasSpf, onPageQuality } = args;

  const popScore = rank && rank > 0 ? clamp(100 * (1 - Math.log10(rank) / 6), 0, 100) : 0;
  const ageScore = ageYears != null ? clamp((ageYears / 12) * 100, 0, 100) : 0;
  const trustScore = (reachable ? 40 : 0) + (https ? 45 : 0) + (hasSpf ? 15 : 0); // 0-100
  const refScore =
    referringDomains != null
      ? clamp((Math.log10(referringDomains + 1) / 7) * 100, 0, 100) // 10M ref domains ≈ 100
      : null;

  // DR — Ahrefs-style, link-graph weighted → Open PageRank is the closest free
  // anchor (calibrated: OPR 9.5+ sites carry Ahrefs DR in the mid-90s).
  const drBase = refScore ?? clamp(0.7 * popScore + 0.3 * ageScore, 0, 100);
  const dr = Math.round(
    oprScore != null ? clamp(0.9 * oprScore + 0.1 * (refScore ?? oprScore), 0, 100) : drBase
  );

  // DA — Moz-style blended authority (link graph + popularity + age + trust + on-page).
  const daBlend = clamp(
    0.4 * popScore +
      0.2 * ageScore +
      0.2 * trustScore +
      0.1 * (onPageQuality * 100) +
      0.1 * (refScore ?? popScore),
    0,
    100
  );
  const da = Math.round(oprScore != null ? 0.65 * oprScore + 0.35 * daBlend : daBlend);

  // PA — Moz-style page authority for the homepage. Homepage PA typically tracks
  // a few points under DA for established sites, lifted by on-page quality.
  const pa = Math.round(clamp(0.8 * da + 0.15 * (onPageQuality * 100), 0, 100));

  return { da, pa, dr };
}

// ── Orchestrator ─────────────────────────────────────────────────────────────

export async function getDomainInsights(
  domain: string,
  apiKey?: string
): Promise<DomainInsights> {
  const warnings: string[] = [];

  const [opr, tranco, rdap, wayback, dns, onPage] = await Promise.all([
    fetchOpenPageRank(domain, apiKey).catch(() => null),
    fetchTranco(domain).catch(() => null),
    fetchRdap(domain).catch(() => null),
    fetchWaybackFirstSeen(domain).catch(() => null),
    fetchDns(domain).catch(() => null),
    fetchOnPage(domain).catch(() => null),
  ]);

  if (!dns) warnings.push("DNS lookup failed");
  if (!onPage) warnings.push("Homepage fetch failed");
  if (!rdap) warnings.push("RDAP (WHOIS) lookup failed");
  if (opr && "error" in opr && opr.error) warnings.push(opr.error as string);

  const onPageSafe =
    onPage ??
    ({
      reachable: false,
      finalUrl: null,
      httpStatus: null,
      https: false,
      responseMs: null,
      server: null,
      poweredBy: null,
      title: null,
      titleLength: 0,
      metaDescription: null,
      metaDescriptionLength: 0,
      h1Count: 0,
      h2Count: 0,
      wordCount: 0,
      hasViewport: false,
      hasCanonical: false,
      hasOpenGraph: false,
      hasStructuredData: false,
      noindex: false,
      tech: [],
    } as Awaited<ReturnType<typeof fetchOnPage>>);

  const dnsSafe =
    dns ??
    ({
      ip: null,
      ipCount: 0,
      nameservers: [],
      mailProvider: null,
      hasMx: false,
      hasSpf: false,
      hasDmarc: false,
    } as Awaited<ReturnType<typeof fetchDns>>);

  // domain age
  const createdAt = rdap?.createdAt ?? null;
  let ageYears: number | null = null;
  if (createdAt) {
    const created = new Date(createdAt).getTime();
    if (!Number.isNaN(created)) {
      ageYears = Math.round(((Date.now() - created) / 3.15576e10) * 10) / 10;
    }
  }

  // Traffic MUST use a popularity/visits-based rank (Tranco = aggregated real
  // usage), NOT Open PageRank's rank which is a link-authority ranking and would
  // wildly inflate traffic for heavily-linked-but-lower-traffic sites.
  const popularityRank = tranco ?? null;
  const globalRank = popularityRank; // "Global Rank" displayed = popularity rank
  const traffic = estimateTrafficFromRank(popularityRank);

  // split off an estimated Google-organic portion (Ahrefs-style metric)
  const organicShare = estimateOrganicShare({
    wordCount: onPageSafe.wordCount,
    ageYears,
    hasStructuredData: onPageSafe.hasStructuredData,
    h2Count: onPageSafe.h2Count,
  });
  const organicVisits =
    traffic.visits != null ? Math.round(traffic.visits * organicShare) : null;

  // on-page quality hint (0-1) for the fallback authority estimate
  const opq =
    (onPageSafe.title ? 0.25 : 0) +
    (onPageSafe.metaDescription ? 0.2 : 0) +
    (onPageSafe.h1Count > 0 ? 0.2 : 0) +
    (onPageSafe.wordCount > 300 ? 0.2 : 0) +
    (onPageSafe.hasCanonical ? 0.15 : 0);

  const oprConfigured = opr?.configured ?? false;
  const oprScore =
    oprConfigured && opr?.openPageRank != null
      ? Math.round(opr.openPageRank * 10)
      : null;

  const authorityEstimated = oprScore == null;
  const authorityScore =
    oprScore ??
    estimateAuthority({
      rank: globalRank,
      ageYears,
      https: onPageSafe.https,
      reachable: onPageSafe.reachable,
      hasSpf: dnsSafe.hasSpf,
      onPageQualityHint: opq,
    });

  // headline DA / PA / DR (named metrics the user expects)
  const metrics = computeMetrics({
    oprScore,
    referringDomains: opr?.referringDomains ?? null,
    rank: globalRank,
    ageYears,
    https: onPageSafe.https,
    reachable: onPageSafe.reachable,
    hasSpf: dnsSafe.hasSpf,
    onPageQuality: opq,
  });

  // ── SEO / trust health checks ──
  const checks: DomainInsights["checks"] = [
    { label: "Site reachable", ok: onPageSafe.reachable },
    { label: "HTTPS / SSL", ok: onPageSafe.https },
    {
      label: "Title tag present",
      ok: !!onPageSafe.title,
      detail: onPageSafe.title
        ? `${onPageSafe.titleLength} chars`
        : "missing",
    },
    {
      label: "Meta description",
      ok: !!onPageSafe.metaDescription,
      detail: onPageSafe.metaDescription
        ? `${onPageSafe.metaDescriptionLength} chars`
        : "missing",
    },
    {
      label: "Exactly one H1",
      ok: onPageSafe.h1Count === 1,
      detail: `${onPageSafe.h1Count} found`,
    },
    { label: "Mobile viewport", ok: onPageSafe.hasViewport },
    { label: "Canonical URL", ok: onPageSafe.hasCanonical },
    { label: "Open Graph tags", ok: onPageSafe.hasOpenGraph },
    { label: "Structured data", ok: onPageSafe.hasStructuredData },
    {
      label: "Indexable (not noindex)",
      ok: !onPageSafe.noindex,
      detail: onPageSafe.noindex ? "noindex set!" : undefined,
    },
    { label: "SPF email record", ok: dnsSafe.hasSpf },
    { label: "DMARC email record", ok: dnsSafe.hasDmarc },
    {
      label: "Fast response (<1.5s)",
      ok: onPageSafe.responseMs != null && onPageSafe.responseMs < 1500,
      detail:
        onPageSafe.responseMs != null ? `${onPageSafe.responseMs} ms` : undefined,
    },
  ];
  const healthScore = Math.round(
    (checks.filter((c) => c.ok).length / checks.length) * 100
  );

  return {
    domain,
    fetchedAt: new Date().toISOString(),
    authority: {
      score: authorityScore,
      estimated: authorityEstimated,
      openPageRank: opr?.openPageRank ?? null,
      referringDomains: opr?.referringDomains ?? null,
      configured: oprConfigured,
      source: {
        label: oprConfigured
          ? "Open PageRank (open web graph)"
          : "Estimated from open signals",
        estimate: authorityEstimated,
      },
      note: oprConfigured
        ? undefined
        : "Add a free Open PageRank API key (OPENPAGERANK_API_KEY) for a real authority score & referring-domain count.",
    },
    metrics: {
      da: metrics.da,
      pa: metrics.pa,
      dr: metrics.dr,
      estimated: true,
      configured: oprConfigured,
      source: {
        label: oprConfigured
          ? "Estimated (anchored on Open PageRank)"
          : "Estimated from open data",
        estimate: true,
      },
    },
    traffic: {
      globalRank,
      estimatedMonthlyVisits: traffic.visits,
      organicVisits,
      organicSharePct: Math.round(organicShare * 100),
      tier: traffic.tier,
      source: { label: "Tranco global rank → modeled visits", estimate: true },
    },
    domainInfo: {
      ageYears,
      createdAt,
      expiresAt: rdap?.expiresAt ?? null,
      updatedAt: rdap?.updatedAt ?? null,
      registrar: rdap?.registrar ?? null,
      statuses: rdap?.statuses ?? [],
      firstSeenWeb: wayback ?? null,
      source: { label: "RDAP + Internet Archive", estimate: false },
    },
    dns: {
      ...dnsSafe,
      source: { label: "Cloudflare DNS-over-HTTPS", estimate: false },
    },
    onPage: {
      ...onPageSafe,
      source: { label: "Live homepage fetch", estimate: false },
    },
    healthScore,
    checks,
    warnings,
  };
}
