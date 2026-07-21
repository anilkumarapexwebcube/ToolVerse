"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ArrowLeft, TrendingUp, Calendar, Link2, ShieldCheck, Server,
  Globe, CheckCircle, XCircle, AlertCircle, Download, Copy, Zap, Info,
  Lock, Building2, FileText, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import type { DomainInsights } from "@/lib/domain-insights";

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
function fmtRank(n: number | null): string {
  return n == null ? "—" : `#${n.toLocaleString()}`;
}
function fmtDate(s: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  return Number.isNaN(d.getTime())
    ? s
    : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
function scoreColor(score: number): string {
  if (score >= 70) return "#16a34a";
  if (score >= 40) return "#c9a84c";
  return "#dc2626";
}
function authorityVerdict(score: number): string {
  if (score >= 80) return "Excellent authority";
  if (score >= 60) return "Strong authority";
  if (score >= 40) return "Moderate authority";
  if (score >= 20) return "Developing authority";
  return "Low authority";
}

// ── building blocks ──────────────────────────────────────────────────────────

/** small copy button shown at a card's corner */
function CopyBtn({ onCopy }: { onCopy: () => void }) {
  return (
    <button
      onClick={onCopy}
      title="Copy value"
      className="absolute bottom-3 right-3 p-1.5 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-theme-gold transition-all"
    >
      <Copy size={13} />
    </button>
  );
}

/** Flagship 0-100 metric card (DA / PA / DR) with a coloured progress bar */
function MetricCard({
  acronym, name, value, delay = 0, onCopy,
}: { acronym: string; name: string; value: number; delay?: number; onCopy: () => void }) {
  const color = scoreColor(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="card-base card-hover group p-5 relative overflow-hidden"
    >
      <span className="absolute top-4 right-4 text-[9px] font-bold px-1.5 py-0.5 rounded bg-theme-gold/10 text-theme-gold border border-theme-gold/20">
        EST
      </span>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-lg font-extrabold font-grotesk" style={{ color }}>{acronym}</span>
        <span className="text-[11px] font-semibold text-theme-muted">{name}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-4xl font-bold font-grotesk leading-none" style={{ color }}>{value}</span>
        <span className="text-sm font-semibold text-theme-muted">/100</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, delay: delay + 0.1, ease: "easeOut" }} />
      </div>
      <CopyBtn onCopy={onCopy} />
    </motion.div>
  );
}

/** Flagship traffic card (used for both total & organic) */
function TrafficBig({
  title, subtitle, visits, foot, color, delay = 0, onCopy,
}: {
  title: string; subtitle: string; visits: string; foot: React.ReactNode;
  color: string; delay?: number; onCopy: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="card-base card-hover group p-5 relative overflow-hidden"
    >
      <span className="absolute top-4 right-4 text-[9px] font-bold px-1.5 py-0.5 rounded bg-theme-gold/10 text-theme-gold border border-theme-gold/20">
        EST
      </span>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-lg font-extrabold font-grotesk" style={{ color }}>{title}</span>
        <span className="text-[11px] font-semibold text-theme-muted">{subtitle}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-4xl font-bold font-grotesk leading-none" style={{ color }}>{visits}</span>
        <span className="text-sm font-semibold text-theme-muted">/mo</span>
      </div>
      <div className="text-xs text-theme-muted">{foot}</div>
      <CopyBtn onCopy={onCopy} />
    </motion.div>
  );
}

/** Clean stat tile */
function Stat({
  icon, label, value, sub,
}: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-2 text-theme-muted mb-3">
        <span className="text-theme-gold">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-3xl font-bold font-grotesk text-theme-text leading-none">{value}</div>
      {sub && <div className="text-xs text-theme-muted mt-2">{sub}</div>}
    </div>
  );
}

/** A clean labelled card with definition rows */
function InfoCard({
  icon, title, children,
}: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-theme-gold">{icon}</span>
        <h3 className="font-bold font-grotesk text-theme-text">{title}</h3>
      </div>
      <dl className="divide-y divide-slate-100">{children}</dl>
    </motion.div>
  );
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-sm text-theme-muted">{label}</dt>
      <dd className="text-sm font-semibold text-theme-text text-right break-words max-w-[60%]">{value ?? "—"}</dd>
    </div>
  );
}
function Pill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
      ok ? "bg-green-50 text-green-700 border border-green-200"
         : "bg-slate-50 text-slate-400 border border-slate-200"}`}>
      {ok ? <CheckCircle size={11} /> : <XCircle size={11} />}{label}
    </span>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function DomainInsightsPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DomainInsights | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showAudit, setShowAudit] = useState(true);

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(""), 2500);
  }

  async function analyze(domainArg?: string) {
    const domain = (domainArg ?? input).trim();
    if (!domain) return;
    if (domainArg) setInput(domainArg);
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/domain-insights", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const json = await res.json();
      if (!res.ok) setError(json?.error || "Something went wrong.");
      else {
        setData(json as DomainInsights);
        showToast(`Analyzed ${json.domain}`);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  /** flat label→value pairs used by both Copy (text) and Export (CSV) */
  function reportRows(d: DomainInsights): [string, string][] {
    return [
      ["Domain", d.domain],
      ["DA (Domain Authority)", String(d.metrics.da)],
      ["PA (Page Authority)", String(d.metrics.pa)],
      ["DR (Domain Rating)", String(d.metrics.dr)],
      ["Traffic - Total (all channels)/mo", fmtNum(d.traffic.estimatedMonthlyVisits)],
      ["Traffic - Organic (search)/mo", fmtNum(d.traffic.organicVisits)],
      ["Organic Share (%)", String(d.traffic.organicSharePct)],
      ["Global Rank", d.traffic.globalRank ? `#${d.traffic.globalRank}` : "—"],
      ["Popularity Tier", d.traffic.tier],
      ["Backlinks (Referring Domains)", d.authority.referringDomains != null ? String(d.authority.referringDomains) : "—"],
      ["Open PageRank", d.authority.openPageRank != null ? String(d.authority.openPageRank) : "—"],
      ["Domain Age (years)", d.domainInfo.ageYears != null ? String(d.domainInfo.ageYears) : "—"],
      ["Created", fmtDate(d.domainInfo.createdAt)],
      ["Expires", fmtDate(d.domainInfo.expiresAt)],
      ["Registrar", d.domainInfo.registrar || "—"],
      ["IP Address", d.dns.ip || "—"],
      ["Mail Provider", d.dns.mailProvider || "—"],
      ["SPF", d.dns.hasSpf ? "Yes" : "No"],
      ["DMARC", d.dns.hasDmarc ? "Yes" : "No"],
      ["HTTPS", d.onPage.https ? "Yes" : "No"],
      ["Load Time (ms)", d.onPage.responseMs != null ? String(d.onPage.responseMs) : "—"],
      ["Title Length", String(d.onPage.titleLength)],
      ["Meta Description Length", String(d.onPage.metaDescriptionLength)],
      ["H1 Count", String(d.onPage.h1Count)],
      ["H2 Count", String(d.onPage.h2Count)],
      ["Word Count", String(d.onPage.wordCount)],
      ["Technologies", d.onPage.tech.join("; ") || "—"],
      ["SEO Health (%)", String(d.healthScore)],
    ];
  }

  function copyOne(label: string, value: string) {
    navigator.clipboard.writeText(`${label}: ${value}`);
    showToast(`${label} copied`);
  }

  function copyText() {
    if (!data) return;
    const text = reportRows(data)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    navigator.clipboard.writeText(`Domain Insights — ${data.domain}\n\n${text}`);
    showToast("Metrics copied as text");
  }

  function downloadCsv() {
    if (!data) return;
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const csv = ["Metric,Value", ...reportRows(data).map(([k, v]) => `${esc(k)},${esc(v)}`)].join("\r\n");
    // BOM so Excel opens UTF-8 correctly
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.domain}-insights.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV downloaded (opens in Excel)");
  }

  const passed = data ? data.checks.filter((c) => c.ok).length : 0;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-5xl w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-theme-muted hover:text-theme-text transition-colors">
          <ArrowLeft size={16} /> Back to ToolVerse
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-gold text-white shadow-md shadow-theme-gold/20">
            <Search size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-grotesk text-theme-text">Domain Insights</h1>
            <p className="text-sm mt-1 text-theme-muted">Check any website&rsquo;s authority, traffic &amp; SEO — free</p>
          </div>
        </motion.div>

        {/* Search bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-base p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input-base w-full pl-11 pr-4 py-3.5"
                placeholder="Enter a domain — e.g. ahrefs.com"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") analyze(); }}
                spellCheck={false}
                autoComplete="off"
              />
            </div>
            <button
              onClick={() => analyze()}
              disabled={loading || !input.trim()}
              className="btn-primary px-7 py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Zap size={16} />}
              {loading ? "Analyzing…" : "Analyze"}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle size={18} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && !data && (
          <div className="card-base p-8 animate-pulse">
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 rounded-full bg-slate-100 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-48 bg-slate-100 rounded" />
                <div className="h-4 w-32 bg-slate-100 rounded" />
                <div className="h-4 w-40 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-base p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-5 text-theme-gold">
              <Search size={30} />
            </div>
            <h3 className="font-bold font-grotesk text-theme-text text-lg mb-2">Analyze any domain, free</h3>
            <p className="text-sm text-theme-muted max-w-md mx-auto">
              Authority, popularity rank, estimated traffic, domain age, DNS and a full SEO audit — in one click. No sign-up.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              {["ahrefs.com", "vercel.com", "wikipedia.org", "github.com"].map((d) => (
                <button key={d} onClick={() => analyze(d)}
                  className="badge hover:border-theme-gold hover:text-theme-gold transition-colors cursor-pointer">{d}</button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* Identity bar */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="card-base p-5 flex items-center gap-4 flex-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://www.google.com/s2/favicons?domain=${data.domain}&sz=64`} alt="" className="w-9 h-9 rounded-lg" />
              <div className="flex-1 min-w-[180px]">
                <h2 className="text-xl font-bold font-grotesk text-theme-text break-all leading-tight">{data.domain}</h2>
                <p className="text-xs font-semibold" style={{ color: scoreColor(data.metrics.da) }}>
                  {authorityVerdict(data.metrics.da)}
                </p>
              </div>
              <div className="hidden sm:flex flex-wrap gap-2">
                <span className="badge"><Lock size={11} className={data.onPage.https ? "text-green-600" : "text-slate-400"} />
                  {data.onPage.https ? "Secure" : "No HTTPS"}</span>
                <span className="badge"><Calendar size={11} className="text-theme-gold" />
                  {data.domainInfo.ageYears != null ? `${data.domainInfo.ageYears}y` : "—"}</span>
                <span className="badge"><ShieldCheck size={11} className="text-theme-gold" />
                  {data.healthScore}% health</span>
              </div>
              <div className="flex gap-2">
                <button onClick={copyText} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"><Copy size={14} /> Copy</button>
                <button onClick={downloadCsv} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"><Download size={14} /> CSV</button>
              </div>
            </motion.div>

            {/* ── Authority metrics: DA · PA · DR ── */}
            <div className="grid grid-cols-3 gap-4">
              <MetricCard acronym="DA" name="Domain Authority" value={data.metrics.da} delay={0}
                onCopy={() => copyOne("DA", String(data.metrics.da))} />
              <MetricCard acronym="PA" name="Page Authority" value={data.metrics.pa} delay={0.06}
                onCopy={() => copyOne("PA", String(data.metrics.pa))} />
              <MetricCard acronym="DR" name="Domain Rating" value={data.metrics.dr} delay={0.12}
                onCopy={() => copyOne("DR", String(data.metrics.dr))} />
            </div>

            {/* ── Traffic: total (all channels) vs organic (search) ── */}
            <div className="grid sm:grid-cols-2 gap-4">
              <TrafficBig
                title="Traffic" subtitle="Total · all channels" color="var(--accent)"
                visits={fmtNum(data.traffic.estimatedMonthlyVisits)}
                foot={<>Global rank <span className="font-semibold text-theme-text">{fmtRank(data.traffic.globalRank)}</span> · {data.traffic.tier}</>}
                delay={0.16}
                onCopy={() => copyOne("Traffic (total)", `${fmtNum(data.traffic.estimatedMonthlyVisits)}/mo`)}
              />
              <TrafficBig
                title="Organic" subtitle="Google search only" color="#16a34a"
                visits={fmtNum(data.traffic.organicVisits)}
                foot={<>~{data.traffic.organicSharePct}% of total visits · Ahrefs-style</>}
                delay={0.22}
                onCopy={() => copyOne("Organic traffic", `${fmtNum(data.traffic.organicVisits)}/mo`)}
              />
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat icon={<TrendingUp size={15} />} label="Global Rank" value={fmtRank(data.traffic.globalRank)} sub={`${data.traffic.tier} popularity`} />
              <Stat icon={<Link2 size={15} />} label="Backlinks (ref. domains)"
                value={data.authority.referringDomains != null ? fmtNum(data.authority.referringDomains) : "—"}
                sub={data.authority.configured ? "linking sites" : "needs free API key"} />
              <Stat icon={<Calendar size={15} />} label="Domain Age"
                value={data.domainInfo.ageYears != null ? `${data.domainInfo.ageYears}y` : "—"}
                sub={data.domainInfo.createdAt ? `since ${new Date(data.domainInfo.createdAt).getFullYear()}` : "unknown"} />
              <Stat icon={<ShieldCheck size={15} />} label="SEO Health" value={`${data.healthScore}%`}
                sub={`${data.checks.filter((c) => c.ok).length}/${data.checks.length} checks passed`} />
            </div>

            {/* Detail cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <InfoCard icon={<Building2 size={18} />} title="Domain & Registration">
                <Row label="Created" value={fmtDate(data.domainInfo.createdAt)} />
                <Row label="Expires" value={fmtDate(data.domainInfo.expiresAt)} />
                <Row label="Registrar" value={data.domainInfo.registrar} />
                <Row label="First seen online" value={fmtDate(data.domainInfo.firstSeenWeb)} />
              </InfoCard>

              <InfoCard icon={<Server size={18} />} title="Hosting & Email">
                <Row label="IP address" value={data.dns.ip} />
                <Row label="Mail provider" value={data.dns.mailProvider} />
                <Row label="Email security" value={
                  <span className="inline-flex gap-1.5">
                    <Pill ok={data.dns.hasSpf} label="SPF" />
                    <Pill ok={data.dns.hasDmarc} label="DMARC" />
                  </span>} />
                <Row label="Nameserver" value={data.dns.nameservers[0]?.replace(/\.$/, "") || "—"} />
              </InfoCard>

              <InfoCard icon={<FileText size={18} />} title="Content & Speed">
                <Row label="Page title" value={data.onPage.title ? `${data.onPage.titleLength} chars` : "missing"} />
                <Row label="Meta description" value={data.onPage.metaDescription ? `${data.onPage.metaDescriptionLength} chars` : "missing"} />
                <Row label="Headings" value={`${data.onPage.h1Count} × H1 · ${data.onPage.h2Count} × H2`} />
                <Row label="Words on page" value={data.onPage.wordCount ? fmtNum(data.onPage.wordCount) : "—"} />
                <Row label="Load time" value={data.onPage.responseMs != null ? `${data.onPage.responseMs} ms` : "—"} />
              </InfoCard>

              <InfoCard icon={<Zap size={18} />} title="Technology">
                {data.onPage.tech.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {data.onPage.tech.map((t) => (
                      <span key={t} className="badge"><Server size={10} className="text-theme-gold" /> {t}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-theme-muted py-2">No technologies detected.</p>
                )}
                {data.onPage.server && <Row label="Web server" value={data.onPage.server} />}
              </InfoCard>
            </div>

            {/* SEO audit */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-base p-6">
              <button onClick={() => setShowAudit((v) => !v)} className="w-full flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-theme-gold" />
                  <h3 className="font-bold font-grotesk text-theme-text">SEO Audit</h3>
                  <span className="text-sm text-theme-muted">{passed}/{data.checks.length} passed</span>
                </div>
                <ChevronDown size={18} className={`text-theme-muted transition-transform ${showAudit ? "rotate-180" : ""}`} />
              </button>

              {/* progress bar */}
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden my-4">
                <motion.div className="h-full rounded-full" style={{ background: scoreColor(data.healthScore) }}
                  initial={{ width: 0 }} animate={{ width: `${data.healthScore}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
              </div>

              <AnimatePresence initial={false}>
                {showAudit && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 pt-1">
                      {data.checks.map((c) => (
                        <div key={c.label} className="flex items-center gap-2.5 py-2 border-b border-slate-50">
                          {c.ok ? <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                : <XCircle size={16} className="text-red-400 flex-shrink-0" />}
                          <span className="text-sm text-theme-text flex-1">{c.label}</span>
                          {c.detail && <span className="text-xs font-mono text-slate-400">{c.detail}</span>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Honesty note — single subtle line */}
            <p className="flex items-start gap-2 text-xs text-theme-muted leading-relaxed px-1">
              <Info size={13} className="text-theme-gold flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-theme-text">DA, PA, DR &amp; Traffic are estimates</strong> from open data
                (Open PageRank, Tranco, RDAP, Cloudflare DNS &amp; the Internet Archive). Moz DA/PA and Ahrefs DR are
                proprietary paid metrics — no free API returns those exact numbers, so these approximate them and are
                marked <span className="font-semibold text-theme-gold">EST</span>.{" "}
                <strong className="text-theme-text">Traffic here = total visits (all channels), SimilarWeb-style.</strong>{" "}
                Ahrefs&rsquo; &ldquo;Organic traffic&rdquo; counts Google-search visits only, so it is normally much lower —
                the two are not directly comparable.
                {data.warnings.length > 0 && <> Some sources were unavailable: {data.warnings.join(", ")}.</>}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} className="toast">
            <CheckCircle size={15} className="text-theme-gold" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
