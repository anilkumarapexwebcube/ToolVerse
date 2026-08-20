"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- responses come from an external Google Apps Script endpoint (untyped JSON) */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CalendarClock, Play, Pause, Square, Download, Trash2,
  CheckCircle, Globe, Loader2, Info, Clock, Gauge,
} from "lucide-react";
import Link from "next/link";

// Same Google Apps Script backend used by the original tool (public web-app endpoint).
const WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbydUPonVySIRG_Icz2ygWRmDJ1_qEGjhS9vMP9INZF5_f_sD1ZX2d7kRnOqN8YbWeN_/exec";
const MAX_URLS = 100;
const CONCURRENCY = 4; // check several URLs in parallel for a big speed-up

type RunState = "idle" | "running" | "paused" | "stopped" | "completed";
type Row = {
  url: string;
  domain: string;
  accountKey: string;
  lastCrawlDate: string;
  indexStatus: string;
  property?: string;
  status: "pending" | "ok" | "error";
};

async function postWebhook(body: any): Promise<any> {
  const resp = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body),
  });
  return resp.json();
}

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default function GscCrawlCheck() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [runState, setRunState] = useState<RunState>("idle");
  const [detail, setDetail] = useState("");
  const [prog, setProg] = useState({ done: 0, total: 0, pct: 0, eta: "" });
  const [checking, setChecking] = useState<Set<number>>(new Set());
  const [elapsed, setElapsed] = useState(0);
  const [toast, setToast] = useState("");

  const wf = useRef({
    items: [] as any[],
    results: [] as Row[],
    queue: [] as number[],
    done: 0,
    active: 0,
    batchId: "",
    startTime: 0,
    state: "idle" as RunState,
  });
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(""), 2600);
  }
  function setState2(s: RunState) {
    wf.current.state = s;
    setRunState(s);
  }
  function sync() {
    setRows([...wf.current.results]);
  }
  function startTimer() {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - wf.current.startTime) / 1000));
    }, 1000);
  }
  function stopTimer() {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
  }
  function markChecking(i: number, on: boolean) {
    setChecking((prev) => {
      const n = new Set(prev);
      if (on) n.add(i); else n.delete(i);
      return n;
    });
  }
  function updateProgress() {
    const done = wf.current.done;
    const total = wf.current.items.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    let eta = "";
    if (wf.current.state === "running" && done > 0) {
      const el = (Date.now() - wf.current.startTime) / 1000;
      eta = fmtDuration(Math.max(0, Math.round((total - done) * (el / done))));
    }
    setProg({ done, total, pct, eta });
  }

  const counts = useMemo(() => {
    const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
    const unique = new Set(lines);
    const domains = new Set<string>();
    unique.forEach((u) => {
      const m = u.match(/^https?:\/\/([^/]+)/i);
      if (m) domains.add(m[1].toLowerCase().replace(/^www\./, ""));
    });
    return { total: lines.length, dupes: lines.length - unique.size, domains: domains.size };
  }, [input]);

  async function start() {
    const raw = input.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!raw.length) return showToast("Paste at least one URL");
    const seen = new Set<string>();
    const urls: string[] = [];
    let dup = 0;
    raw.forEach((u) => (seen.has(u) ? dup++ : (seen.add(u), urls.push(u))));
    if (urls.length > MAX_URLS) return showToast(`Max ${MAX_URLS} unique URLs per batch (you have ${urls.length})`);
    if (dup > 0) setInput(urls.join("\n"));

    setChecking(new Set());
    setState2("running");
    setDetail(dup > 0 ? `Validating ${urls.length} URLs (${dup} duplicate${dup === 1 ? "" : "s"} removed)…` : `Validating ${urls.length} URLs…`);
    try {
      const data = await postWebhook({ action: "validate_batch", urls });
      if (!data?.success) {
        setState2("stopped");
        setDetail(data?.error || "Validation failed");
        return;
      }
      const items = data.items || [];
      wf.current.items = items;
      wf.current.batchId = data.batchId || "";
      wf.current.results = items.map((i: any) => ({
        url: i.url,
        domain: i.domain || "-",
        accountKey: i.accountKey || "",
        lastCrawlDate: i.ready ? "Pending" : "Skipped",
        indexStatus: i.ready ? "Pending" : i.error || "Unknown",
        status: i.ready ? "pending" : "error",
      }));
      wf.current.queue = items.map((it: any, idx: number) => (it.ready ? idx : -1)).filter((x: number) => x >= 0);
      wf.current.done = items.length - wf.current.queue.length; // skipped count as done
      wf.current.active = 0;
      wf.current.startTime = Date.now();
      setElapsed(0);
      sync();
      updateProgress();

      if (wf.current.queue.length === 0) {
        setState2("completed");
        setDetail("No URLs matched a connected GSC property.");
        return;
      }
      setDetail(`Checking ${wf.current.queue.length} URLs — ${CONCURRENCY} in parallel…`);
      startTimer();
      const workers = Math.min(CONCURRENCY, wf.current.queue.length);
      for (let k = 0; k < workers; k++) worker();
    } catch (err: any) {
      setState2("stopped");
      setDetail("Connection failed: " + (err?.message || "network error"));
      stopTimer();
    }
  }

  async function worker() {
    while (wf.current.state === "running") {
      const i = wf.current.queue.shift();
      if (i === undefined) break;
      wf.current.active++;
      markChecking(i, true);
      try {
        const item = wf.current.items[i];
        const data = await postWebhook({
          action: "inspect_single",
          url: item.url,
          domain: item.domain,
          accountKey: item.accountKey,
          batchId: wf.current.batchId,
        });
        if (data?.success) {
          wf.current.results[i] = {
            url: data.url,
            domain: data.domain,
            accountKey: data.accountKey,
            lastCrawlDate: data.lastCrawlDate,
            indexStatus: data.indexStatus,
            property: data.property || "",
            status: "ok",
          };
        } else {
          const r = wf.current.results[i];
          r.lastCrawlDate = "Error";
          r.indexStatus = data?.error || "Unknown error";
          r.status = "error";
        }
      } catch {
        const r = wf.current.results[i];
        r.lastCrawlDate = "Error";
        r.indexStatus = "Network error";
        r.status = "error";
      }
      markChecking(i, false);
      wf.current.active--;
      wf.current.done++;
      sync();
      updateProgress();
    }
    finishIfDone();
  }

  function finishIfDone() {
    if (wf.current.active > 0) return;
    if (wf.current.state === "running" && wf.current.queue.length === 0) {
      setState2("completed");
      setDetail(`Done — ${wf.current.done} URLs checked in ${fmtDuration(Math.round((Date.now() - wf.current.startTime) / 1000))}.`);
      stopTimer();
    } else if (wf.current.state === "paused") {
      setDetail(`Paused — ${wf.current.done} of ${wf.current.items.length} done. Click Resume to continue.`);
      stopTimer();
    } else if (wf.current.state === "stopped") {
      stopTimer();
    }
  }

  function pause() {
    if (wf.current.state !== "running") return;
    setState2("paused");
    setDetail("Finishing in-flight checks, then pausing…");
  }
  function resume() {
    if (wf.current.state !== "paused") return;
    setState2("running");
    setDetail(`Resuming — ${wf.current.queue.length} left…`);
    wf.current.startTime = Date.now() - elapsed * 1000;
    startTimer();
    const workers = Math.min(CONCURRENCY, wf.current.queue.length);
    for (let k = 0; k < workers; k++) worker();
  }
  function stop() {
    if (wf.current.state !== "running" && wf.current.state !== "paused") return;
    setState2("stopped");
    setDetail(`Stopped — ${wf.current.done} of ${wf.current.items.length} URLs checked.`);
    stopTimer();
  }
  function reset() {
    stopTimer();
    wf.current = { items: [], results: [], queue: [], done: 0, active: 0, batchId: "", startTime: 0, state: "idle" };
    setRows([]);
    setRunState("idle");
    setDetail("");
    setProg({ done: 0, total: 0, pct: 0, eta: "" });
    setChecking(new Set());
    setElapsed(0);
  }

  function downloadCSV() {
    if (!rows.length) return showToast("No results to download yet");
    const header = ["URL", "Domain", "Last Crawl Date", "Index Status", "GSC Property"];
    const body = rows.map((r) => [r.url, r.domain, r.lastCrawlDate, r.indexStatus, r.property || ""]);
    const csv = [header, ...body]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gsc_crawl_dates_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV downloaded");
  }

  const stateColor =
    runState === "running" ? "#4f46e5"
    : runState === "completed" ? "#16a34a"
    : runState === "paused" ? "#c9a84c"
    : runState === "stopped" ? "#dc2626"
    : "#64748b";
  const okCount = rows.filter((r) => r.status === "ok").length;

  function dateBadge(r: Row, i: number) {
    if (checking.has(i))
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border bg-indigo-50 text-theme-accent border-indigo-200"><Loader2 size={11} className="animate-spin" /> Checking…</span>;
    if (r.status === "ok") {
      const cls = r.lastCrawlDate === "Never Crawled"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-green-50 text-green-700 border-green-200";
      return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${cls}`}>{r.lastCrawlDate}</span>;
    }
    if (r.status === "error")
      return <span className="px-2 py-0.5 rounded-md text-xs font-semibold border bg-red-50 text-red-600 border-red-200">{r.lastCrawlDate}</span>;
    return <span className="px-2 py-0.5 rounded-md text-xs font-semibold border bg-slate-50 text-slate-400 border-slate-200">Pending</span>;
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-[1400px] w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-theme-muted hover:text-theme-text transition-colors">
          <ArrowLeft size={16} /> Back to ToolVerse
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-gold text-white shadow-md shadow-theme-gold/20">
            <CalendarClock size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-grotesk text-theme-text">GSC Last Crawl Date Checker</h1>
            <p className="text-sm mt-1 text-theme-muted">Bulk-check last Google crawl date &amp; index status — up to 100 URLs, {CONCURRENCY}× parallel</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-6">
          {/* ── Left: input & controls ── */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="card-base p-6 flex flex-col gap-4 h-fit">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest font-grotesk text-theme-muted">URLs (one per line)</span>
              <span className={`text-xs font-mono ${counts.total > MAX_URLS ? "text-red-500 font-bold" : "text-slate-400"}`}>
                {counts.total} / {MAX_URLS}
                {counts.dupes > 0 && <span className="text-theme-gold"> · {counts.dupes} dup</span>}
              </span>
            </div>

            <textarea
              className="input-base w-full p-4 resize-none"
              style={{ minHeight: "300px" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={runState === "running" || runState === "paused"}
              spellCheck={false}
              placeholder={"https://example.com/page-1\nhttps://anotherdomain.com/about\nhttps://thirdsite.com/contact"}
            />

            {counts.domains > 0 && (
              <div className="flex items-center gap-2 text-xs text-theme-muted">
                <Globe size={13} className="text-theme-gold" /> {counts.domains} unique domain{counts.domains === 1 ? "" : "s"}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {runState !== "running" && runState !== "paused" ? (
                <button onClick={start} disabled={!counts.total} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Play size={15} /> Run Check
                </button>
              ) : runState === "running" ? (
                <button onClick={pause} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
                  <Pause size={15} /> Pause
                </button>
              ) : (
                <button onClick={resume} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
                  <Play size={15} /> Resume
                </button>
              )}
              <button onClick={stop} disabled={runState !== "running" && runState !== "paused"} className="btn-secondary px-4 py-2.5 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <Square size={14} /> Stop
              </button>
              <button onClick={reset} disabled={runState === "running"} className="btn-secondary px-4 py-2.5 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <Trash2 size={14} /> Reset
              </button>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-theme-muted leading-relaxed">
              <Info size={13} className="text-theme-gold flex-shrink-0 mt-0.5" />
              Each URL is inspected live in Google Search Console (a few seconds each). We run {CONCURRENCY} in parallel and
              stream results below — you can Pause anytime. Only URLs on connected GSC properties return a crawl date.
            </div>
          </motion.div>

          {/* ── Right: progress & results ── */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-4">
            {/* progress */}
            {runState !== "idle" && (
              <div className="card-base p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest font-grotesk px-2.5 py-1 rounded-full inline-flex items-center gap-1.5" style={{ color: stateColor, background: `${stateColor}14` }}>
                    {runState === "running" && <Loader2 size={11} className="animate-spin" />}
                    {runState}
                  </span>
                  <div className="flex items-center gap-4 text-xs font-mono text-theme-muted">
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {fmtDuration(elapsed)}</span>
                    {prog.eta && runState === "running" && <span className="inline-flex items-center gap-1"><Gauge size={12} /> ETA {prog.eta}</span>}
                    <span className="text-theme-text font-semibold">{prog.done} / {prog.total} ({prog.pct}%)</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden relative">
                  <motion.div className="h-full rounded-full" style={{ background: stateColor }}
                    animate={{ width: `${prog.pct}%` }} transition={{ ease: "easeOut", duration: 0.4 }} />
                </div>
                <div className="flex items-center justify-between mt-2.5 gap-3 flex-wrap">
                  <p className="text-xs text-theme-muted">{detail}</p>
                  {checking.size > 0 && (
                    <span className="text-xs text-theme-accent font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                      <Loader2 size={11} className="animate-spin" /> {checking.size} in progress
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* results */}
            <div className="card-base p-5 flex-1">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="font-bold font-grotesk text-theme-text">
                  Results {rows.length > 0 && <span className="text-theme-muted font-normal">· {okCount}/{rows.length} resolved</span>}
                </h3>
                <button onClick={downloadCSV} disabled={!rows.length} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Download size={14} /> CSV
                </button>
              </div>

              {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-20 opacity-50">
                  <CalendarClock size={34} className="text-slate-400" />
                  <div className="text-xs uppercase tracking-widest font-grotesk text-theme-muted">Awaiting run</div>
                </div>
              ) : (
                <div className="overflow-auto max-h-[560px] rounded-xl border border-slate-100">
                  <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr className="text-left text-xs font-grotesk uppercase tracking-wider text-theme-muted">
                        <th className="py-2.5 px-3 font-semibold">#</th>
                        <th className="py-2.5 px-3 font-semibold">URL</th>
                        <th className="py-2.5 px-3 font-semibold">Last Crawl</th>
                        <th className="py-2.5 px-3 font-semibold">Index Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className={`border-t border-slate-100 transition-colors ${checking.has(i) ? "bg-indigo-50/50" : ""}`}>
                          <td className="py-2.5 px-3 text-xs font-mono text-slate-400">{i + 1}</td>
                          <td className="py-2.5 px-3 max-w-[280px]">
                            <div className="font-mono text-xs text-theme-text truncate" title={r.url}>{r.url}</div>
                            <div className="text-[10px] text-theme-muted">{r.domain}</div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">{dateBadge(r, i)}</td>
                          <td className="py-2.5 px-3">
                            <span className={`text-xs ${r.status === "error" ? "text-red-500" : "text-theme-text"}`} title={r.indexStatus}>{r.indexStatus}</span>
                            {r.property && <div className="text-[10px] text-theme-muted">via {r.property}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

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
