"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Save, Upload, Trash2, Zap, Copy, CheckCircle,
  AlertCircle, Database, Users, XCircle, BarChart2, ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// ── Helpers ──────────────────────────────────────────────
function parseEmails(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
}

type ResultState = {
  unused: string[];
  used:   string[];
  all:    string[];
  dupes:  Set<string>;
};

const STORAGE_KEY = "toolverse_masterEmails";

// ── Toast ──────────────────────────────────────────────
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="toast"
    >
      <CheckCircle size={16} className="text-theme-gold" />
      {msg}
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────
export default function EmailChecker() {
  const [activeTab, setActiveTab] = useState<"manage" | "quick" | "results">("manage");
  const [colA, setColA] = useState("");
  const [colB, setColB] = useState("");
  const [qcText, setQcText] = useState("");
  const [cacheCount, setCacheCount] = useState(0);
  const [result, setResult] = useState<ResultState | null>(null);
  const [resultTab, setResultTab] = useState<"unused" | "used" | "all">("unused");
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const arr = JSON.parse(saved) as string[];
        setCacheCount(arr.length);
      }
    } catch {}
  }, []);

  const showToast = (msg: string) => setToast(msg);

  function saveToCache() {
    const emails = parseEmails(colA);
    if (!emails.length) { showToast("No valid emails to save"); return; }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
    setCacheCount(emails.length);
    showToast(`${emails.length} emails saved to cache`);
  }

  function loadCache() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) { showToast("No cached emails found"); return; }
      const emails = JSON.parse(saved) as string[];
      setColA(emails.join("\n"));
      showToast(`Loaded ${emails.length} emails`);
    } catch { showToast("Error loading cache"); }
  }

  function clearCache() {
    localStorage.removeItem(STORAGE_KEY);
    setCacheCount(0);
    setColA("");
    showToast("Cache cleared");
  }

  function runCheck(masterList: string[], utilizedList: string[]) {
    const freq: Record<string, number> = {};
    masterList.forEach((e) => (freq[e] = (freq[e] || 0) + 1));
    const dupes = new Set(Object.keys(freq).filter((e) => freq[e] > 1));
    const setB  = new Set(utilizedList);
    const uniqueA = [...new Set(masterList)];
    setResult({
      unused: uniqueA.filter((e) => !setB.has(e)),
      used:   uniqueA.filter((e) => setB.has(e)),
      all:    uniqueA,
      dupes,
    });
    setResultTab("unused");
    setActiveTab("results");
    showToast(`Check complete — ${uniqueA.filter((e) => !setB.has(e)).length} unused found`);
  }

  function handleCheck() {
    const master = parseEmails(colA);
    if (!master.length) { showToast("Paste emails in Master List first"); return; }
    runCheck(master, parseEmails(colB));
  }

  function handleQuickCheck() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) { showToast("No cached emails. Save in Manage tab first."); return; }
      const master = JSON.parse(saved) as string[];
      const utilized = parseEmails(qcText);
      if (!utilized.length) { showToast("Paste utilized emails first"); return; }
      runCheck(master, utilized);
    } catch { showToast("Error running check"); }
  }

  function copyList() {
    if (!result) return;
    const list = result[resultTab];
    if (!list.length) { showToast("Nothing to copy"); return; }
    navigator.clipboard.writeText(list.join("\n")).then(() => {
      setCopied(true);
      showToast(`Copied ${list.length} email(s)`);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const currentList = result ? result[resultTab] : [];

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
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-gold text-white shadow-md shadow-theme-gold/20">
            <Mail size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-grotesk text-theme-text">
              Email Utilization Checker
            </h1>
            <p className="text-sm mt-1 text-theme-muted">
              Compare email lists · Find unused addresses · Detect duplicates
            </p>
          </div>
        </motion.div>

        {/* Cache status bar */}
        {cacheCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-3 px-5 py-3 rounded-xl mb-6 bg-slate-50 border border-slate-200 border-l-4 border-l-theme-gold"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-theme-gold font-grotesk">
              <Database size={15} />
              {cacheCount} emails saved in local cache
            </span>
            <button
              onClick={clearCache}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-red-500 hover:bg-red-50 transition-colors font-grotesk"
            >
              <Trash2 size={11} /> Clear Cache
            </button>
          </motion.div>
        )}

        {/* Main tab bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-8 flex-wrap"
        >
          {(["manage", "quick", "results"] as const).map((t) => {
            const isActive = activeTab === t;
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold font-grotesk transition-all ${
                  isActive
                    ? "bg-theme-text text-white shadow-md"
                    : "bg-white text-theme-muted border border-slate-200 hover:border-theme-gold hover:text-theme-gold"
                }`}
              >
                {t === "manage" && "Manage Lists"}
                {t === "quick"  && "Quick Check"}
                {t === "results"&& `Results ${result ? `(${result[resultTab].length})` : ""}`}
              </button>
            );
          })}
        </motion.div>

        {/* ── TAB: MANAGE ── */}
        <AnimatePresence mode="wait">
          {activeTab === "manage" && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                {/* Column A */}
                <div className="card-base p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Database size={16} className="text-theme-gold" />
                    <span className="font-bold text-sm font-grotesk text-theme-text">
                      All Emails (Master List)
                    </span>
                  </div>
                  <textarea
                    className="input-base w-full p-4 mb-4 resize-none"
                    rows={10}
                    value={colA}
                    onChange={(e) => setColA(e.target.value)}
                    placeholder={"Paste all emails here.\nOne per line, or comma/semicolon separated.\n\nalice@example.com\nbob@example.com"}
                  />
                  <div className="flex gap-3 flex-wrap">
                    <button onClick={saveToCache} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
                      <Save size={14} /> Save to Cache
                    </button>
                    <button onClick={loadCache} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                      <Upload size={14} /> Load Cache
                    </button>
                  </div>
                </div>

                {/* Column B */}
                <div className="card-base p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={16} className="text-theme-accent" />
                    <span className="font-bold text-sm font-grotesk text-theme-text">
                      Utilized Emails
                    </span>
                  </div>
                  <textarea
                    className="input-base w-full p-4 mb-4 resize-none"
                    rows={10}
                    value={colB}
                    onChange={(e) => setColB(e.target.value)}
                    placeholder={"Paste emails that have been utilized.\n\nalice@example.com\ncarol@example.com"}
                  />
                  <div className="flex gap-3">
                    <button onClick={handleCheck} className="btn-primary px-5 py-2 text-sm flex items-center gap-2">
                      <Zap size={14} /> Check Now
                    </button>
                    <button onClick={() => { setColA(""); setColB(""); }} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                      <Trash2 size={14} /> Clear All
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TAB: QUICK CHECK ── */}
          {activeTab === "quick" && (
            <motion.div
              key="quick"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="p-6 rounded-xl mb-6 bg-slate-50 border border-slate-200 border-l-4 border-l-theme-accent">
                <p className="text-sm leading-relaxed text-theme-muted">
                  <strong className="text-theme-text">How Quick Check works:</strong><br />
                  1. Save your master emails in the <em>Manage</em> tab.<br />
                  2. Paste utilized emails below and click <strong>Run Quick Check</strong>.<br />
                  3. Results load instantly in the Results tab.
                </p>
              </div>

              <div className="card-base p-6">
                {cacheCount > 0
                  ? <p className="text-xs mb-4 font-semibold font-grotesk text-theme-gold flex items-center gap-2"><CheckCircle size={14}/> {cacheCount} emails in cache — ready to compare</p>
                  : <p className="text-xs mb-4 font-semibold font-grotesk text-red-500 flex items-center gap-2"><AlertCircle size={14}/> No emails cached yet. Save them in the Manage tab first.</p>
                }
                <textarea
                  className="input-base w-full p-4 mb-4 resize-none"
                  rows={10}
                  value={qcText}
                  onChange={(e) => setQcText(e.target.value)}
                  placeholder={"Paste utilized emails here...\n\nalice@example.com\ncarol@example.com"}
                />
                <div className="flex gap-3">
                  <button onClick={handleQuickCheck} className="btn-primary px-5 py-2 text-sm flex items-center gap-2">
                    <Zap size={14} /> Run Quick Check
                  </button>
                  <button onClick={() => setQcText("")} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                    <Trash2 size={14} /> Clear
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TAB: RESULTS ── */}
          {activeTab === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              {!result ? (
                <div className="card-base text-center py-20">
                  <BarChart2 size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="font-grotesk font-semibold text-slate-400">
                    Run a check to see results
                  </p>
                </div>
              ) : (
                <>
                  {/* Stats bar */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "Total",       value: result.all.length,    color: "text-slate-600", bg: "bg-slate-100", icon: <Users size={16} /> },
                      { label: "Utilized",    value: result.used.length,   color: "text-theme-accent", bg: "bg-indigo-50", icon: <CheckCircle size={16} /> },
                      { label: "Not Utilized",value: result.unused.length, color: "text-theme-gold", bg: "bg-yellow-50", icon: <XCircle size={16} /> },
                      { label: "Duplicates",  value: result.dupes.size,    color: "text-red-500", bg: "bg-red-50", icon: <AlertCircle size={16} /> },
                    ].map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className={`text-center py-5 px-4 card-base card-hover ${s.bg}`}
                      >
                        <div className={`flex justify-center mb-3 ${s.color}`}>{s.icon}</div>
                        <div className={`text-3xl font-bold font-grotesk ${s.color}`}>{s.value}</div>
                        <div className="text-sm mt-2 text-slate-500 font-medium">{s.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Result filter tabs */}
                  <div className="card-base p-6">
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                      <div className="flex gap-2 flex-wrap">
                        {(["unused", "used", "all"] as const).map((t) => {
                          const labels = { unused: "Not Utilized", used: "Utilized", all: "All Unique" };
                          const isActive = resultTab === t;
                          return (
                            <button
                              key={t}
                              className={`px-4 py-1.5 text-xs font-bold font-grotesk rounded-full transition-all ${
                                isActive 
                                  ? "bg-theme-text text-white" 
                                  : "bg-slate-100 text-theme-muted hover:bg-slate-200"
                              }`}
                              onClick={() => setResultTab(t)}
                            >
                              {labels[t]}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={copyList}
                        className={`btn-secondary px-4 py-1.5 text-xs flex items-center gap-2 ${copied ? "!border-green-500 !text-green-600" : ""}`}
                      >
                        {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                        {copied ? "Copied!" : `Copy ${currentList.length}`}
                      </button>
                    </div>

                    <p className="text-xs mb-3 font-semibold font-grotesk text-slate-400">
                      {currentList.length} email{currentList.length !== 1 ? "s" : ""}
                    </p>

                    <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
                      <AnimatePresence>
                        {currentList.length === 0 ? (
                          <div className="text-center py-10 font-grotesk text-slate-400">
                            No emails in this category
                          </div>
                        ) : (
                          currentList.map((email, i) => {
                            const isUsed = result.used.includes(email);
                            const isDupe = result.dupes.has(email);
                            return (
                              <motion.div
                                key={email}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                                className="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-300 transition-colors"
                              >
                                <span className="text-xs font-mono text-slate-700">
                                  {email}
                                </span>
                                <div className="flex gap-2">
                                  <span className={`badge ${isUsed ? "!bg-indigo-50 !text-theme-accent !border-indigo-100" : "!bg-yellow-50 !text-theme-gold !border-yellow-100"}`}>
                                    {isUsed ? "Utilized" : "Not Utilized"}
                                  </span>
                                  {isDupe && (
                                    <span className="badge !bg-red-50 !text-red-500 !border-red-100">
                                      Duplicate
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      </AnimatePresence>
    </div>
  );
}
