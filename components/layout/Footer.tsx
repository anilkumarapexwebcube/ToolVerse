"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart, ArrowUpRight, Download, Shield, Ban, Lock, Monitor, Radar,
  Bot, Search, Mail, Globe, Filter, CalendarClock, FileSpreadsheet,
} from "lucide-react";

const SEARCHOPS_EXE_URL =
  "https://www.dropbox.com/scl/fi/rketviou0i4pbt6ho7rr8/SearchOps-Studio-Setup-1.6.0.exe?rlkey=igid6mwyvq0cn5m705cg5nuv6&st=ycak0hi6&dl=1";
const RANK_RADAR_EXE_URL =
  "https://www.dropbox.com/scl/fi/5sxksq5swpvhm7a14kjr3/RankRadar.exe?rlkey=zjalmw3ljlmxzzvvzehn5mk84&st=ffek5bay&dl=1";

type FLink = { href: string; label: string; icon: React.ReactNode; external?: boolean; download?: boolean; badge?: string };
type FGroup = { title: string; accent: string; links: FLink[] };

const groups: FGroup[] = [
  {
    title: "Lead Generation",
    accent: "#6366f1",
    links: [
      { href: "https://mailreplyai.vercel.app", label: "MailReply AI", icon: <Bot size={15} />, external: true, badge: "NEW" },
      { href: "/tools/domain-insights", label: "Domain Insights", icon: <Search size={15} /> },
      { href: "/tools/email-checker", label: "Email Utilization Checker", icon: <Mail size={15} /> },
      { href: "/tools/number-generator", label: "Global Number Generator", icon: <Globe size={15} /> },
      { href: "/tools/domain-distiller", label: "Domain Distiller", icon: <Filter size={15} /> },
    ],
  },
  {
    title: "On-Page",
    accent: "#c9a84c",
    links: [
      { href: "/tools/gsc-crawl-check", label: "GSC Last Crawl Checker", icon: <CalendarClock size={15} />, badge: "NEW" },
      { href: SEARCHOPS_EXE_URL, label: "SearchOps Studio", icon: <Monitor size={15} />, download: true },
      { href: RANK_RADAR_EXE_URL, label: "Rank Radar", icon: <Radar size={15} />, download: true },
      { href: "/tools/ranking-report-filter", label: "Ranking Report Filter", icon: <FileSpreadsheet size={15} /> },
    ],
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/access" || pathname === "/admin") return null;

  return (
    <footer className="relative z-10 mt-24 overflow-hidden bg-[#0b1120] text-slate-300">
      {/* animated gold hairline */}
      <motion.div
        className="h-px w-full bg-gradient-to-r from-transparent via-theme-gold to-transparent"
        initial={{ opacity: 0.3, backgroundPositionX: "0%" }}
        animate={{ opacity: [0.35, 0.8, 0.35] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* soft glows */}
      <div aria-hidden className="pointer-events-none absolute -top-28 right-[18%] h-[420px] w-[420px] rounded-full bg-theme-gold/10 blur-[130px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 left-[10%] h-[360px] w-[360px] rounded-full bg-indigo-500/10 blur-[130px]" />

      <div className="relative max-w-[1600px] w-full mx-auto px-6 py-16">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]"
        >
          {/* Brand */}
          <motion.div variants={item}>
            <Link href="/" className="group inline-flex items-center gap-3 mb-4">
              <motion.img
                src="/logo.png" alt="ToolVerse" className="h-10 w-10 rounded-xl"
                whileHover={{ rotate: -8, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 14 }}
              />
              <span className="font-grotesk font-bold text-lg text-white">
                Tool<span className="text-theme-gold">Verse</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1.5 bg-theme-gold/15 text-theme-gold uppercase tracking-wider border border-theme-gold/25 align-middle">
                  PRO
                </span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-5">
              Domain intelligence, crawl tracking, rank checks, and report cleanup — the tools SEO teams
              reach for. Tuned for speed, free to run.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Lock size={11} />, label: "Private" },
                { icon: <Ban size={11} />, label: "No ads" },
                { icon: <Shield size={11} />, label: "No tracking" },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 text-slate-300 border border-white/10 font-grotesk">
                  <span className="text-theme-gold">{b.icon}</span>{b.label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Category columns */}
          {groups.map((g) => (
            <motion.div key={g.title} variants={item}>
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest font-grotesk text-white mb-4">
                <span className="h-2 w-2 rounded-full" style={{ background: g.accent }} />
                {g.title}
              </h4>
              <ul className="space-y-1">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      {...(l.external || l.download ? { target: "_blank", rel: "noopener noreferrer", ...(l.download ? { download: true } : {}) } : {})}
                      className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 -mx-2 text-sm text-slate-400 transition-all duration-200 hover:bg-white/5 hover:text-white hover:translate-x-1"
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6"
                        style={{ background: g.accent }}
                      >
                        {l.icon}
                      </span>
                      <span className="flex-1 truncate">{l.label}</span>
                      {l.badge && <span className="rounded bg-theme-gold/15 text-theme-gold border border-theme-gold/25 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider">{l.badge}</span>}
                      {l.download && <span className="rounded bg-white/10 text-slate-300 px-1.5 py-0.5 text-[9px] font-bold">EXE</span>}
                      {l.external && <ArrowUpRight size={13} className="text-slate-500 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Desktop apps */}
          <motion.div variants={item} className="rounded-2xl p-5 bg-white/[0.04] border border-white/10 relative overflow-hidden">
            <div aria-hidden className="absolute inset-0 bg-gradient-gold opacity-[0.07] pointer-events-none" />
            <div className="relative">
              <h4 className="text-xs font-bold uppercase tracking-widest font-grotesk text-white mb-4">Desktop apps</h4>
              {[
                { icon: <Monitor size={16} />, name: "SearchOps Studio", desc: "All-in-one SEO desktop app", url: SEARCHOPS_EXE_URL },
                { icon: <Radar size={16} />, name: "Rank Radar", desc: "True city-level rank tracker", url: RANK_RADAR_EXE_URL },
              ].map((app, i) => (
                <motion.a
                  key={app.name}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group flex items-center gap-3 rounded-xl p-3 ${i === 0 ? "mb-2" : ""} bg-white/[0.03] border border-white/10 hover:border-theme-gold/40 transition-colors`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-gold text-white">{app.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold font-grotesk text-white leading-tight">{app.name}</span>
                    <span className="block text-[11px] text-slate-400">{app.desc}</span>
                  </span>
                  <Download size={15} className="text-slate-500 group-hover:text-theme-gold transition-colors shrink-0" />
                </motion.a>
              ))}
              <p className="mt-3 text-[11px] text-slate-500">Windows installers · run 100% on your PC</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-grotesk text-center sm:text-left">
            © 2026 ToolVerse Pro · All tools are 100% free &amp; secure
          </p>
          <div className="flex items-center gap-1.5 text-xs font-grotesk text-slate-500">
            <span>Made with</span>
            <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
              <Heart size={13} className="text-theme-gold fill-current" />
            </motion.span>
            <span>by Anil Kumar</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
