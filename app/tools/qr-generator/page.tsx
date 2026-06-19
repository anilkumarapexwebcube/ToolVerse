"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowLeft,
  CheckCircle,
  Copy,
  Download,
  Palette,
  QrCode,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Trash2,
  Type,
} from "lucide-react";

type ErrorLevel = "L" | "M" | "Q" | "H";

type RecentQr = {
  id: string;
  value: string;
  createdAt: string;
};

const STORAGE_KEY = "toolverse_qrRecent";

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

function safeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "qr-code";
}

export default function QrGenerator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [value, setValue] = useState("https://tool-verse-v1.vercel.app/");
  const [size, setSize] = useState(512);
  const [fgColor, setFgColor] = useState("#0f172a");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [level, setLevel] = useState<ErrorLevel>("M");
  const [marginSize, setMarginSize] = useState(2);
  const [recent, setRecent] = useState<RecentQr[]>([]);
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);

  const qrValue = value.trim() || " ";
  const characters = value.length;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setRecent(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, 20)));
  }, [recent]);

  const previewStyle = useMemo(
    () => ({
      width: "min(100%, 360px)",
      height: "auto",
      imageRendering: "pixelated" as const,
    }),
    []
  );

  function showToast(msg: string) {
    setToast(msg);
  }

  function saveRecent(payload = value) {
    const clean = payload.trim();
    if (!clean) {
      showToast("Enter QR content first");
      return;
    }

    const item: RecentQr = {
      id: `${Date.now()}`,
      value: clean,
      createdAt: new Date().toLocaleString(),
    };

    setRecent((prev) => [item, ...prev.filter((entry) => entry.value !== clean)].slice(0, 20));
    showToast("Saved to recent");
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas || !value.trim()) {
      showToast("Enter QR content first");
      return;
    }

    const png = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = png;
    a.download = `${safeName(value)}-${size}px.png`;
    a.click();
    saveRecent(value);
    showToast("PNG downloaded");
  }

  function copyPayload() {
    if (!value.trim()) return;
    navigator.clipboard.writeText(value.trim()).then(() => {
      setCopied(true);
      showToast("Content copied");
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function resetStyle() {
    setSize(512);
    setFgColor("#0f172a");
    setBgColor("#ffffff");
    setLevel("M");
    setMarginSize(2);
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
            <QrCode size={31} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-grotesk text-theme-text">
              QR Code Generator
            </h1>
            <p className="text-sm mt-2 text-theme-muted">
              Create custom QR codes and download print-ready PNG files
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Canvas Size", value: `${size}px`, icon: <QrCode size={17} /> },
            { label: "Characters", value: characters, icon: <Type size={17} /> },
            { label: "Error Level", value: level, icon: <SlidersHorizontal size={17} /> },
            { label: "Saved Items", value: recent.length, icon: <Save size={17} /> },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="card-base card-hover p-5"
            >
              <div className="flex items-center justify-center mb-3 text-theme-gold">{item.icon}</div>
              <div className="text-center text-2xl md:text-3xl font-bold font-grotesk text-theme-text">{item.value}</div>
              <div className="text-center text-xs uppercase tracking-widest text-theme-muted mt-2">{item.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-base p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-theme-gold" />
              <span className="text-xs font-bold uppercase tracking-widest font-grotesk text-theme-muted">
                QR Content
              </span>
            </div>

            <textarea
              className="input-base w-full p-4 resize-none mb-5"
              rows={7}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={"Paste URL, text, phone number, email, or campaign link"}
            />

            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-theme-muted">
                  Foreground
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-11 w-14 rounded-lg border border-slate-200 bg-white p-1"
                  />
                  <input
                    className="input-base w-full px-3 py-3"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-theme-muted">
                  Background
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-11 w-14 rounded-lg border border-slate-200 bg-white p-1"
                  />
                  <input
                    className="input-base w-full px-3 py-3"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-theme-muted">
                  Size
                </label>
                <input
                  type="range"
                  min={128}
                  max={1024}
                  step={32}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-[#c9a84c]"
                />
                <input
                  className="input-base w-full px-3 py-3 mt-3"
                  type="number"
                  min={128}
                  max={1024}
                  step={32}
                  value={size}
                  onChange={(e) => setSize(Math.min(1024, Math.max(128, Number(e.target.value) || 128)))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-theme-muted">
                  Margin
                </label>
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={1}
                  value={marginSize}
                  onChange={(e) => setMarginSize(Number(e.target.value))}
                  className="w-full accent-[#c9a84c]"
                />
                <input
                  className="input-base w-full px-3 py-3 mt-3"
                  type="number"
                  min={0}
                  max={8}
                  value={marginSize}
                  onChange={(e) => setMarginSize(Math.min(8, Math.max(0, Number(e.target.value) || 0)))}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-theme-muted">
                Error Correction
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["L", "M", "Q", "H"] as ErrorLevel[]).map((item) => (
                  <button
                    key={item}
                    onClick={() => setLevel(item)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold font-grotesk transition-all ${
                      level === item
                        ? "bg-theme-text text-white shadow-md"
                        : "bg-slate-50 border border-slate-200 text-theme-muted hover:border-theme-gold hover:text-theme-gold"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadPng}
                disabled={!value.trim()}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={15} /> Download PNG
              </button>
              <button
                onClick={copyPayload}
                disabled={!value.trim()}
                className="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
                Copy Content
              </button>
              <button onClick={resetStyle} className="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2">
                <RotateCcw size={15} /> Reset Style
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-base p-6 bg-slate-50"
          >
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <Palette size={16} className="text-theme-gold" />
                <span className="text-xs font-bold uppercase tracking-widest font-grotesk text-theme-muted">
                  Preview
                </span>
              </div>
              <span className="badge !bg-white">{size}px PNG</span>
            </div>

            <div className="min-h-[430px] rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-6 overflow-hidden">
              <QRCodeCanvas
                ref={canvasRef}
                value={qrValue}
                size={size}
                level={level}
                fgColor={fgColor}
                bgColor={bgColor}
                marginSize={marginSize}
                style={previewStyle}
                title="Generated QR code"
              />
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Encoded Content</div>
              <p className="text-xs font-mono break-all text-theme-text">
                {value.trim() || "Empty"}
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base p-6 mt-6"
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Save size={16} className="text-theme-gold" />
              <span className="text-xs font-bold uppercase tracking-widest font-grotesk text-theme-muted">
                Recent QR Content
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => saveRecent()}
                disabled={!value.trim()}
                className="btn-secondary px-3 py-2 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={13} /> Save
              </button>
              <button
                onClick={() => setRecent([])}
                disabled={!recent.length}
                className="btn-secondary px-3 py-2 text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={13} /> Clear
              </button>
            </div>
          </div>

          {recent.length ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {recent.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setValue(item.value)}
                  className="text-left rounded-xl border border-slate-200 bg-slate-50 hover:border-theme-gold hover:bg-white transition-colors p-4"
                >
                  <p className="text-sm font-mono text-theme-text break-all line-clamp-2">
                    {item.value}
                  </p>
                  <p className="text-xs text-slate-400 mt-3">{item.createdAt}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400 font-grotesk">
              No saved QR content yet
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {toast && <Toast msg={toast} onDone={() => setToast("")} />}
      </AnimatePresence>
    </div>
  );
}
