"use client";
/* eslint-disable react-hooks/set-state-in-effect -- state updates run after async fingerprint/fetch, not synchronously */
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, Clock, Ban, MonitorSmartphone, KeyRound, Mail, AlertCircle } from "lucide-react";
import { getFingerprint } from "@/lib/fingerprint";

type Status = "loading" | "none" | "pending" | "approved" | "revoked";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [requesting, setRequesting] = useState(false);
  const fpRef = useRef<string>("");
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  // resolve this machine by fingerprint; optionally attach an email to enrol
  const resolve = useCallback(async (withEmail?: string) => {
    if (!fpRef.current) fpRef.current = await getFingerprint();
    const res = await fetch("/api/device/resolve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fp: fpRef.current, email: withEmail || undefined }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j?.error || "Request failed");
    return j as { status: Status; name?: string; email?: string };
  }, []);

  const check = useCallback(async () => {
    try {
      const j = await resolve();
      setName(j.name ?? null);
      if (j.email) setEmail((e) => e || j.email!);
      if (j.status === "approved") { router.replace("/"); router.refresh(); return; }
      setStatus(j.status === "pending" ? "pending" : j.status === "revoked" ? "revoked" : "none");
    } catch {
      setStatus("none");
    }
  }, [resolve, router]);

  useEffect(() => {
    try { setEmail(localStorage.getItem("tv_email") || ""); } catch { /* ignore */ }
    check();
    poll.current = setInterval(() => { if (document.visibilityState === "visible") check(); }, 4000);
    return () => { if (poll.current) clearInterval(poll.current); };
  }, [check]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!EMAIL_RE.test(em)) { setError("Enter a valid email address."); return; }
    setRequesting(true); setError("");
    try {
      try { localStorage.setItem("tv_email", em); } catch { /* ignore */ }
      const j = await resolve(em);
      setName(j.name ?? null);
      if (j.status === "approved") { router.replace("/"); router.refresh(); return; }
      setStatus("pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error — please try again.");
    } finally {
      setRequesting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[#0b1120] text-slate-200 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-32 right-[15%] h-[440px] w-[440px] rounded-full bg-theme-gold/10 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 left-[12%] h-[380px] w-[380px] rounded-full bg-indigo-500/10 blur-[130px]" />

      <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.png" alt="ToolVerse" className="h-10 w-10 rounded-xl" />
          <span className="text-xl font-bold font-grotesk text-white">
            Tool<span className="text-theme-gold">Verse</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1.5 bg-theme-gold/15 text-theme-gold uppercase tracking-wider border border-theme-gold/25 align-middle">PRO</span>
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm shadow-2xl shadow-black/40 text-center">
          {status === "loading" && (
            <div className="py-8 flex flex-col items-center gap-3 text-slate-400">
              <Loader2 size={26} className="animate-spin text-theme-gold" />
              <p className="text-sm">Checking this device…</p>
            </div>
          )}

          {status === "none" && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center text-white shadow-lg shadow-theme-gold/20 mx-auto mb-4">
                <MonitorSmartphone size={26} />
              </div>
              <h1 className="text-xl font-bold font-grotesk text-white">This device isn&rsquo;t authorized</h1>
              <p className="text-sm text-slate-400 mt-1 mb-6">
                Enter your email and request access. Once the owner approves this system, it stays trusted —
                every profile and private window on it works, no need to ask again.
              </p>
              <form onSubmit={submit} className="space-y-3 text-left">
                <div className="relative">
                  <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com" autoFocus autoComplete="email"
                    className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-theme-gold/60 focus:ring-2 focus:ring-theme-gold/20"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/25 px-3 py-2.5 text-sm text-red-300">
                    <AlertCircle size={16} className="shrink-0" /> {error}
                  </div>
                )}
                <motion.button
                  type="submit" disabled={requesting || !EMAIL_RE.test(email.trim())}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {requesting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  {requesting ? "Requesting…" : "Request access"}
                </motion.button>
              </form>
            </>
          )}

          {status === "pending" && (
            <>
              <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 mx-auto mb-4">
                <Clock size={26} />
              </motion.div>
              <h1 className="text-xl font-bold font-grotesk text-white">Waiting for approval</h1>
              <p className="text-sm text-slate-400 mt-1">
                {email ? <>Requested as <span className="text-slate-200 font-medium">{email}</span>.</> : "Your request is in."} You&rsquo;ll get in automatically once the owner approves this system.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-500">
                <Loader2 size={13} className="animate-spin" /> Auto-checking every few seconds
              </div>
            </>
          )}

          {status === "revoked" && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-400/30 flex items-center justify-center text-red-300 mx-auto mb-4">
                <Ban size={26} />
              </div>
              <h1 className="text-xl font-bold font-grotesk text-white">Access revoked</h1>
              <p className="text-sm text-slate-400 mt-1">This system&rsquo;s access was turned off by the owner. Contact them to restore it.</p>
            </>
          )}
        </div>

        <a href="/admin" className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-theme-gold transition-colors">
          <KeyRound size={12} /> Owner? Open the admin panel
        </a>
      </motion.div>
    </div>
  );
}
