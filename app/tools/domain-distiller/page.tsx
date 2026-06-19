"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Copy, Download, Trash2, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

function extractDomains(raw: string): string[] {
  const domains = new Set<string>();
  const lines = raw.split(/\r?\n/);
  const domainRegex = /^([a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/i;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("-")) continue;
    if (domainRegex.test(trimmed)) {
      domains.add(trimmed.toLowerCase());
    }
  }
  return [...domains];
}

export default function DomainDistiller() {
  const [input, setInput] = useState("");
  const [domains, setDomains] = useState<string[]>([]);
  const [parsed, setParsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function handleExtract() {
    if (!input.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const result = extractDomains(input);
      setDomains(result);
      setParsed(true);
      setLoading(false);
      showToast(`${result.length} unique domain${result.length !== 1 ? "s" : ""} extracted`);
    }, 180);
  }

  function handleCopy() {
    if (!domains.length) return;
    navigator.clipboard.writeText(domains.join("\n")).then(() => {
      setCopied(true);
      showToast("Domains copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownload() {
    if (!domains.length) return;
    const blob = new Blob([domains.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "domains.txt";
    a.click();
    URL.revokeObjectURL(url);
    showToast("domains.txt downloaded");
  }

  function handleClear() {
    setInput(""); setDomains([]); setParsed(false);
  }

  const lineCount = input ? input.split(/\r?\n/).length : 0;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-[1600px] w-full mx-auto">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-theme-muted hover:text-theme-text transition-colors">
          <ArrowLeft size={16} /> Back to ToolVerse
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 mb-10"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-accent text-white shadow-md shadow-indigo-500/20">
            <Filter size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-grotesk text-theme-text">
              Domain Distiller
            </h1>
            <p className="text-sm mt-1 text-theme-muted">
              Extract · Deduplicate · Export · Regex-powered · Zero server calls
            </p>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="flex gap-6 mb-8 flex-wrap">
          {[
            { label: "Domains Found", value: domains.length },
            { label: "Lines Parsed",  value: parsed ? lineCount : 0 },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="px-6 py-5 text-center min-w-[140px] card-base card-hover"
            >
              <div className="text-3xl font-bold font-grotesk text-theme-accent mb-2">
                {s.value}
              </div>
              <div className="text-sm font-medium text-theme-muted">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Two-panel layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left — Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-base p-6 flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                <span className="text-xs font-bold uppercase tracking-widest font-grotesk text-theme-muted">
                  Raw Log Input
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                chars: {input.length.toLocaleString()}
              </span>
            </div>

            <textarea
              className="input-base w-full p-4 resize-none flex-1"
              style={{ minHeight: "360px" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste your raw log data here…\n\ne.g.\n[maskkingvape.com]\nwhatismyipaddress.com\nexample.com\nTest -> https://prnt.sc/…\n───────────────────`}
              onKeyDown={(e) => { if (e.ctrlKey && e.key === "Enter") handleExtract(); }}
            />

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleExtract}
                disabled={loading || !input.trim()}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Filter size={15} />
                )}
                {loading ? "Parsing…" : "Extract Domains"}
              </button>
              <button
                onClick={handleClear}
                className="btn-secondary px-4 py-2.5 text-sm flex items-center gap-2"
              >
                <Trash2 size={14} /> Clear All
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">Ctrl+Enter</kbd> to extract
            </p>
          </motion.div>

          {/* Right — Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-base p-6 flex flex-col gap-4 bg-slate-50 border-slate-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${parsed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-300'}`} />
                <span className="text-xs font-bold uppercase tracking-widest font-grotesk text-theme-muted">
                  Extracted Domains
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {parsed ? `${domains.length} unique domain${domains.length !== 1 ? "s" : ""}` : "ready"}
              </span>
            </div>

            {/* Output area */}
            <div
              className="flex-1 rounded-xl overflow-y-auto p-4 bg-white border border-slate-200"
              style={{ minHeight: "360px" }}
            >
              {!parsed ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 opacity-40">
                  <Filter size={32} className="text-slate-400" />
                  <div className="text-xs uppercase tracking-widest font-grotesk text-theme-muted">
                    Awaiting extraction
                  </div>
                </div>
              ) : domains.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <AlertCircle size={32} className="text-theme-gold opacity-50" />
                  <div className="text-xs font-grotesk text-slate-500">No domains detected</div>
                </div>
              ) : (
                <ul className="space-y-1">
                  {domains.map((d, i) => (
                    <motion.li
                      key={d}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.025, 0.4) }}
                      className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0"
                    >
                      <span className="text-xs min-w-[28px] text-right font-mono text-slate-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-accent" />
                      <span className="text-sm font-medium font-mono text-theme-text">
                        {d}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleCopy}
                disabled={!domains.length}
                className={`btn-secondary px-4 py-2.5 text-sm flex items-center gap-2 ${copied ? "!border-green-500 !text-green-600" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!domains.length}
                className="btn-secondary px-4 py-2.5 text-sm flex items-center gap-2 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={14} /> .txt
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className="toast"
          >
            <CheckCircle size={15} className="text-theme-gold" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
