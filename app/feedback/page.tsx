"use client";
/* eslint-disable react-hooks/set-state-in-effect -- email is hydrated from localStorage on mount */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Send, Loader2, CheckCircle, AlertCircle, Bug, Lightbulb, HelpCircle, MoreHorizontal } from "lucide-react";

const TYPES = [
  { value: "Bug", icon: <Bug size={15} /> },
  { value: "Idea", icon: <Lightbulb size={15} /> },
  { value: "Question", icon: <HelpCircle size={15} /> },
  { value: "Other", icon: <MoreHorizontal size={15} /> },
];

export default function FeedbackPage() {
  const [type, setType] = useState("Idea");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    try { setEmail(localStorage.getItem("tv_email") || ""); } catch { /* ignore */ }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 3) { setError("Please write a bit more."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type, email: email.trim(), message: message.trim() }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j?.ok) setSent(true);
      else setError(j?.error || "Could not send. Please try again.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-[720px] w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-theme-muted hover:text-theme-text transition-colors">
          <ArrowLeft size={16} /> Back to ToolVerse
        </Link>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-gold text-white shadow-md shadow-theme-gold/20">
            <MessageSquare size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-grotesk text-theme-text">Share feedback</h1>
            <p className="text-sm mt-1 text-theme-muted">Found a bug or have an idea? Tell us — it goes straight to the team.</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card-base p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600 mx-auto mb-5">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold font-grotesk text-theme-text mb-2">Thank you!</h2>
              <p className="text-sm text-theme-muted mb-6">Your feedback has been received. We read every message.</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => { setSent(false); setMessage(""); }} className="btn-secondary px-5 py-2.5 text-sm">Send another</button>
                <Link href="/" className="btn-primary px-5 py-2.5 text-sm">Back to tools</Link>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit} className="card-base p-6 md:p-8 space-y-5">
              {/* type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-theme-muted mb-2">Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value} type="button" onClick={() => setType(t.value)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
                        type === t.value ? "border-theme-gold bg-theme-gold/10 text-theme-gold" : "border-slate-200 text-theme-muted hover:border-slate-300"}`}
                    >
                      {t.icon} {t.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-theme-muted mb-2">Email <span className="font-normal normal-case text-slate-400">(optional — so we can reply)</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email"
                  className="input-base w-full px-4 py-3 text-sm" />
              </div>

              {/* message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-theme-muted mb-2">Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="What's on your mind?"
                  className="input-base w-full p-4 text-sm resize-none" />
                <div className="text-right text-[11px] text-slate-400 mt-1">{message.length}/4000</div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0" /> {error}
                </div>
              )}

              <motion.button type="submit" disabled={loading || message.trim().length < 3} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                className="btn-primary px-7 py-3.5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {loading ? "Sending…" : "Send feedback"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
