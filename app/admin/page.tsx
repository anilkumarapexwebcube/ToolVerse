"use client";
/* eslint-disable react-hooks/set-state-in-effect -- state updates run after async fetch/poll, not synchronously */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, KeyRound, Loader2, Lock, Check, Ban, Trash2, Pencil,
  MonitorSmartphone, RefreshCw, LogOut, AlertCircle, Clock,
} from "lucide-react";

type Device = {
  id: string; name: string; email: string; status: "pending" | "approved" | "revoked";
  ua: string; ip: string; createdAt: number; updatedAt: number; lastSeen: number;
};

function ago(ts: number) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const STATUS_STYLE: Record<Device["status"], string> = {
  approved: "bg-green-500/15 text-green-300 border-green-400/30",
  pending: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  revoked: "bg-red-500/15 text-red-300 border-red-400/30",
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/devices", { cache: "no-store" });
    if (res.status === 401) { setAuthed(false); return; }
    const j = await res.json();
    setDevices(j.devices || []);
    setAuthed(true);
  }, []);

  useEffect(() => {
    load();
    poll.current = setInterval(() => { if (document.visibilityState === "visible") load(); }, 5000);
    return () => { if (poll.current) clearInterval(poll.current); };
  }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim() || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j?.ok) { setKey(""); await load(); }
      else setError(j?.error || "Sign in failed.");
    } catch { setError("Network error."); }
    finally { setBusy(false); }
  }

  async function act(id: string, action: string, name?: string) {
    await fetch("/api/admin/devices", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action, name }),
    });
    load();
  }
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  }

  // ── login gate ──
  if (authed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-[#0b1120] text-slate-200 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute -top-32 right-[15%] h-[440px] w-[440px] rounded-full bg-theme-gold/10 blur-[130px]" />
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm shadow-2xl shadow-black/40">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center text-white shadow-lg shadow-theme-gold/20 mb-4"><ShieldCheck size={26} /></div>
              <h1 className="text-xl font-bold font-grotesk text-white">Admin panel</h1>
              <p className="text-sm text-slate-400 mt-1">Owner access only. Enter your admin key.</p>
            </div>
            <form onSubmit={login} className="space-y-4">
              <div className="relative">
                <KeyRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin key" autoFocus autoComplete="off"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-theme-gold/60 focus:ring-2 focus:ring-theme-gold/20 font-mono tracking-wider" />
              </div>
              {error && <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/25 px-3 py-2.5 text-sm text-red-300"><AlertCircle size={16} /> {error}</div>}
              <motion.button type="submit" disabled={busy || !key.trim()} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} {busy ? "Verifying…" : "Enter panel"}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  if (authed === null) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0b1120] text-slate-400"><Loader2 className="animate-spin" /></div>;
  }

  const pending = devices.filter((d) => d.status === "pending");
  const others = devices.filter((d) => d.status !== "pending");

  // ── panel ──
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 px-4 py-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-gold flex items-center justify-center text-white"><ShieldCheck size={22} /></div>
            <div>
              <h1 className="text-xl font-bold font-grotesk text-white">Device Access Control</h1>
              <p className="text-xs text-slate-400">Approve the systems that may use ToolVerse.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:border-white/20 transition-colors"><RefreshCw size={14} /> Refresh</button>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:text-red-300 hover:border-red-400/30 transition-colors"><LogOut size={14} /> Sign out</button>
          </div>
        </div>

        {/* pending */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest font-grotesk text-slate-400">
            <Clock size={13} className="text-amber-300" /> Pending approval {pending.length > 0 && <span className="text-amber-300">({pending.length})</span>}
          </h2>
          {pending.length > 1 && (
            <button onClick={() => pending.forEach((d) => act(d.id, "approve"))}
              className="inline-flex items-center gap-1 rounded-lg bg-green-500/15 border border-green-400/30 text-green-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-green-500/25 transition-colors">
              <Check size={13} /> Approve all
            </button>
          )}
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-500 mb-8">No devices waiting.</p>
        ) : (
          <div className="space-y-2 mb-8">
            {pending.map((d) => <Row key={d.id} d={d} act={act} />)}
          </div>
        )}

        {/* all others */}
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest font-grotesk text-slate-400 mb-3">
          <MonitorSmartphone size={13} /> All devices <span className="text-slate-500">({others.length})</span>
        </h2>
        {others.length === 0 ? (
          <p className="text-sm text-slate-500">No approved or revoked devices yet.</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>{others.map((d) => <Row key={d.id} d={d} act={act} />)}</AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );

  function Row({ d, act }: { d: Device; act: (id: string, action: string, name?: string) => void }) {
    return (
      <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
        className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 flex-wrap">
        <MonitorSmartphone size={20} className="text-slate-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold font-grotesk text-white truncate">{d.email || "no email"}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[d.status]}`}>{d.status}</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate">{d.name} · IP {d.ip} · seen {ago(d.lastSeen)}</div>
        </div>
        <div className="flex items-center gap-1.5">
          {d.status !== "approved" && (
            <button onClick={() => act(d.id, "approve")} title="Approve" className="inline-flex items-center gap-1 rounded-lg bg-green-500/15 border border-green-400/30 text-green-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-green-500/25 transition-colors"><Check size={13} /> Approve</button>
          )}
          {d.status === "approved" && (
            <button onClick={() => act(d.id, "revoke")} title="Revoke" className="inline-flex items-center gap-1 rounded-lg bg-red-500/15 border border-red-400/30 text-red-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-red-500/25 transition-colors"><Ban size={13} /> Revoke</button>
          )}
          <button onClick={() => { const n = prompt("Rename device", d.name); if (n) act(d.id, "rename", n); }} title="Rename" className="rounded-lg border border-white/10 text-slate-400 p-1.5 hover:text-white hover:border-white/20 transition-colors"><Pencil size={13} /></button>
          <button onClick={() => { if (confirm("Remove this device? It will need to request access again.")) act(d.id, "delete"); }} title="Remove" className="rounded-lg border border-white/10 text-slate-400 p-1.5 hover:text-red-300 hover:border-red-400/30 transition-colors"><Trash2 size={13} /></button>
        </div>
      </motion.div>
    );
  }
}
