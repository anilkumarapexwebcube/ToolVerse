"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Copy,
  Download,
  History,
  Link as LinkIcon,
  ListPlus,
  Save,
  Trash2,
  X,
  Zap,
} from "lucide-react";

type UtmFields = {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
};

type CampaignRecord = UtmFields & {
  id: string;
  baseUrl: string;
  finalUrl: string;
  createdAt: string;
};

const STORAGE_KEY = "toolverse_utmHistory";

const initialFields: UtmFields = {
  source: "",
  medium: "",
  campaign: "",
  term: "",
  content: "",
};

const fieldConfig: Array<{
  key: keyof UtmFields;
  label: string;
  placeholder: string;
  required?: boolean;
}> = [
  { key: "source", label: "Source", placeholder: "google, linkedin, newsletter", required: true },
  { key: "medium", label: "Medium", placeholder: "cpc, email, social", required: true },
  { key: "campaign", label: "Campaign", placeholder: "summer_launch", required: true },
  { key: "term", label: "Term", placeholder: "lead generation" },
  { key: "content", label: "Content", placeholder: "banner_a, text_link" },
];

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

function buildUtmUrl(baseUrl: string, fields: UtmFields) {
  try {
    const url = new URL(normalizeUrl(baseUrl));
    const entries: Array<[string, string]> = [
      ["utm_source", fields.source],
      ["utm_medium", fields.medium],
      ["utm_campaign", fields.campaign],
      ["utm_term", fields.term],
      ["utm_content", fields.content],
    ];

    entries.forEach(([key, value]) => {
      const clean = value.trim();
      if (clean) url.searchParams.set(key, clean);
      else url.searchParams.delete(key);
    });

    return url.toString();
  } catch {
    return "";
  }
}

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "campaign";
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.94 }}
      className="toast"
    >
      <CheckCircle size={15} className="text-theme-gold" />
      {msg}
    </motion.div>
  );
}

export default function UtmBuilder() {
  const [baseUrl, setBaseUrl] = useState("https://example.com/landing-page");
  const [fields, setFields] = useState<UtmFields>({
    source: "linkedin",
    medium: "social",
    campaign: "lead_generation",
    term: "",
    content: "",
  });
  const [history, setHistory] = useState<CampaignRecord[]>([]);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkResults, setBulkResults] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 30)));
  }, [history]);

  const finalUrl = useMemo(() => buildUtmUrl(baseUrl, fields), [baseUrl, fields]);
  const requiredReady = Boolean(fields.source.trim() && fields.medium.trim() && fields.campaign.trim());
  const canSave = Boolean(finalUrl && requiredReady);

  const bulkUrls = useMemo(
    () => bulkInput.split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    [bulkInput]
  );

  function showToast(msg: string) {
    setToast(msg);
  }

  function updateField(key: keyof UtmFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function copyText(value: string, label: string) {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(label);
      showToast("Copied to clipboard");
      setTimeout(() => setCopied(""), 1800);
    });
  }

  function saveCampaign() {
    if (!canSave) {
      showToast("Add a valid URL and required UTM fields");
      return;
    }

    const record: CampaignRecord = {
      id: `${Date.now()}`,
      baseUrl: normalizeUrl(baseUrl),
      finalUrl,
      createdAt: new Date().toLocaleString(),
      ...fields,
    };

    setHistory((prev) => [record, ...prev.filter((item) => item.finalUrl !== finalUrl)].slice(0, 30));
    showToast("Campaign saved");
  }

  function generateBulk() {
    if (!requiredReady) {
      showToast("Fill source, medium, and campaign first");
      return;
    }

    const results = bulkUrls
      .map((url) => buildUtmUrl(url, fields))
      .filter(Boolean);

    setBulkResults(results);
    showToast(`${results.length} link${results.length !== 1 ? "s" : ""} generated`);
  }

  function downloadBulk() {
    const lines = bulkResults.length ? bulkResults : finalUrl ? [finalUrl] : [];
    if (!lines.length) return;

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(fields.campaign)}-utm-links.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("File downloaded");
  }

  function clearBuilder() {
    setBaseUrl("");
    setFields(initialFields);
    setBulkInput("");
    setBulkResults([]);
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-[1600px] w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-theme-muted hover:text-theme-text transition-colors">
          <ArrowLeft size={16} /> Back to ToolVerse
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 mb-10"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-gold text-white shadow-md shadow-theme-gold/20">
            <LinkIcon size={30} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-grotesk text-theme-text">
              UTM Link Builder
            </h1>
            <p className="text-sm mt-2 text-theme-muted">
              Build campaign URLs, save history, and generate links in bulk
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Saved Links", value: history.length, icon: <History size={17} /> },
            { label: "Required Fields", value: requiredReady ? "3/3" : "0/3", icon: <CheckCircle size={17} /> },
            { label: "Bulk URLs", value: bulkUrls.length, icon: <ListPlus size={17} /> },
            { label: "Generated", value: bulkResults.length, icon: <Zap size={17} /> },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="card-base card-hover p-5"
            >
              <div className="flex items-center justify-center mb-3 text-theme-gold">{item.icon}</div>
              <div className="text-center text-3xl font-bold font-grotesk text-theme-text">{item.value}</div>
              <div className="text-center text-xs uppercase tracking-widest text-theme-muted mt-2">{item.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid xl:grid-cols-[1fr_0.9fr] gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-base p-6"
          >
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-theme-gold" />
                <span className="text-xs font-bold uppercase tracking-widest font-grotesk text-theme-muted">
                  Campaign Builder
                </span>
              </div>
              <button onClick={clearBuilder} className="btn-secondary px-3 py-2 text-xs flex items-center gap-2">
                <Trash2 size={13} /> Reset
              </button>
            </div>

            <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-theme-muted">
              Base URL
            </label>
            <input
              className="input-base w-full px-4 py-3 mb-5"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://example.com/landing-page"
            />

            <div className="grid md:grid-cols-2 gap-4">
              {fieldConfig.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-theme-muted">
                    {field.label}{field.required ? " *" : ""}
                  </label>
                  <input
                    className="input-base w-full px-4 py-3"
                    value={fields[field.key]}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => copyText(finalUrl, "preview")}
                disabled={!finalUrl}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied === "preview" ? <CheckCircle size={15} /> : <Copy size={15} />}
                Copy Link
              </button>
              <button
                onClick={saveCampaign}
                disabled={!canSave}
                className="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={15} /> Save
              </button>
              <button
                onClick={downloadBulk}
                disabled={!finalUrl && !bulkResults.length}
                className="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={15} /> Download
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-base p-6 bg-slate-50"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold uppercase tracking-widest font-grotesk text-theme-muted">
                Live Preview
              </span>
              {finalUrl ? (
                <span className="badge !bg-green-50 !text-green-600 !border-green-100">
                  Ready
                </span>
              ) : (
                <span className="badge !bg-yellow-50 !text-theme-gold !border-yellow-100">
                  Needs URL
                </span>
              )}
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-4 min-h-[180px] overflow-hidden">
              {finalUrl ? (
                <p className="text-sm font-mono leading-relaxed break-all text-theme-text">
                  {finalUrl}
                </p>
              ) : (
                <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center text-slate-400">
                  <AlertCircle size={30} className="mb-3 opacity-50" />
                  <span className="text-sm font-grotesk">Enter a valid base URL</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              {[
                ["utm_source", fields.source],
                ["utm_medium", fields.medium],
                ["utm_campaign", fields.campaign],
                ["utm_term", fields.term],
                ["utm_content", fields.content],
              ].map(([key, value]) => (
                <div key={key} className="rounded-lg border border-slate-200 bg-white p-3 overflow-hidden">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">{key}</div>
                  <div className="text-xs font-mono text-theme-text truncate">{value || "-"}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="grid xl:grid-cols-2 gap-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-6"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <ListPlus size={16} className="text-theme-gold" />
                <span className="text-xs font-bold uppercase tracking-widest font-grotesk text-theme-muted">
                  Bulk Generator
                </span>
              </div>
              <button
                onClick={generateBulk}
                disabled={!bulkUrls.length}
                className="btn-primary px-4 py-2 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={13} /> Generate
              </button>
            </div>

            <textarea
              className="input-base w-full p-4 resize-none mb-4"
              rows={8}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder={"https://example.com/page-one\nhttps://example.com/page-two\nexample.com/page-three"}
            />

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 max-h-64 overflow-y-auto">
              {bulkResults.length ? (
                <div className="space-y-2">
                  {bulkResults.map((url, index) => (
                    <div key={url} className="flex items-start gap-3 rounded-lg bg-white border border-slate-100 p-3">
                      <span className="text-xs font-mono text-slate-400 min-w-[24px]">{index + 1}</span>
                      <p className="text-xs font-mono break-all text-theme-text flex-1">{url}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-slate-400 font-grotesk">
                  Generated links will appear here
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => copyText(bulkResults.join("\n"), "bulk")}
                disabled={!bulkResults.length}
                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied === "bulk" ? <CheckCircle size={14} /> : <Copy size={14} />}
                Copy All
              </button>
              <button
                onClick={() => setBulkResults([])}
                disabled={!bulkResults.length}
                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={14} /> Clear Results
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-6"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <History size={16} className="text-theme-gold" />
                <span className="text-xs font-bold uppercase tracking-widest font-grotesk text-theme-muted">
                  Campaign History
                </span>
              </div>
              <button
                onClick={() => setHistory([])}
                disabled={!history.length}
                className="btn-secondary px-3 py-2 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} /> Clear
              </button>
            </div>

            <div className="space-y-3 max-h-[476px] overflow-y-auto pr-1">
              {history.length ? (
                history.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm font-grotesk text-theme-text truncate">
                          {item.campaign || "Untitled Campaign"}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{item.createdAt}</p>
                      </div>
                      <button
                        onClick={() => copyText(item.finalUrl, item.id)}
                        className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-2"
                      >
                        {copied === item.id ? <CheckCircle size={13} /> : <Copy size={13} />}
                        Copy
                      </button>
                    </div>
                    <p className="text-xs font-mono break-all text-theme-muted">{item.finalUrl}</p>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-sm text-slate-400 font-grotesk">
                  No saved campaigns yet
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      </AnimatePresence>
    </div>
  );
}
