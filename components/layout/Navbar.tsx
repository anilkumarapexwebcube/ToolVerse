"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, ChevronDown, ArrowUpRight, Download,
  Bot, Search, Mail, Globe, Filter, CalendarClock, Monitor, Radar, FileSpreadsheet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const SEARCHOPS_EXE_URL =
  "https://www.dropbox.com/scl/fi/rketviou0i4pbt6ho7rr8/SearchOps-Studio-Setup-1.6.0.exe?rlkey=igid6mwyvq0cn5m705cg5nuv6&st=ycak0hi6&dl=1";
const RANK_RADAR_EXE_URL =
  "https://www.dropbox.com/scl/fi/5sxksq5swpvhm7a14kjr3/RankRadar.exe?rlkey=zjalmw3ljlmxzzvvzehn5mk84&st=ffek5bay&dl=1";

type Item = {
  href: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  external?: boolean;
  download?: boolean;
  badge?: string;
};

type Category = { name: string; blurb: string; accent: string; items: Item[] };

const CATEGORIES: Category[] = [
  {
    name: "Lead Generation",
    blurb: "Find prospects, verify contacts, reach them faster.",
    accent: "#4f46e5", // indigo
    items: [
      { href: "https://mailreplyai.vercel.app", label: "MailReply AI", desc: "AI replies for email & WhatsApp", icon: <Bot size={18} />, external: true, badge: "New" },
      { href: "/tools/domain-insights", label: "Domain Insights", desc: "DA/DR, traffic & full SEO audit", icon: <Search size={18} /> },
      { href: "/tools/email-checker", label: "Email Utilization Checker", desc: "Find unused email addresses", icon: <Mail size={18} /> },
      { href: "/tools/number-generator", label: "Global Number Generator", desc: "Phone numbers for 60+ countries", icon: <Globe size={18} /> },
      { href: "/tools/domain-distiller", label: "Domain Distiller", desc: "Extract clean domains from logs", icon: <Filter size={18} /> },
    ],
  },
  {
    name: "On-Page",
    blurb: "Audit, track, and clean up your on-page SEO.",
    accent: "#c9a84c", // gold
    items: [
      { href: "/tools/gsc-crawl-check", label: "GSC Last Crawl Checker", desc: "Bulk last Google crawl dates", icon: <CalendarClock size={18} />, badge: "New" },
      { href: SEARCHOPS_EXE_URL, label: "SearchOps Studio", desc: "All-in-one SEO desktop app", icon: <Monitor size={18} />, download: true },
      { href: RANK_RADAR_EXE_URL, label: "Rank Radar", desc: "True city-level rank tracker", icon: <Radar size={18} />, download: true },
      { href: "/tools/ranking-report-filter", label: "Ranking Report Filter", desc: "Excel macro to clean rank exports", icon: <FileSpreadsheet size={18} /> },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCat, setMobileCat] = useState<string | null>("Lead Generation");
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openMenu(name: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenCat(name);
  }
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenCat(null), 140);
  }

  // close on outside click + Escape
  useEffect(() => {
    if (!openCat) return;
    function onDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenCat(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenCat(null);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openCat]);

  function itemProps(it: Item) {
    if (it.external || it.download) return { target: "_blank", rel: "noopener noreferrer", ...(it.download ? { download: true } : {}) };
    return {};
  }

  // the access gate and admin panel render standalone
  if (pathname === "/access" || pathname === "/admin") return null;

  return (
    <nav ref={navRef} className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-theme-border">
      <div className="max-w-[1600px] w-full mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo (left) */}
        <Link href="/" className="group flex items-center gap-3 shrink-0">
          <motion.img
            src="/logo.png"
            alt="ToolVerse"
            className="h-10 w-10 rounded-xl"
            whileHover={{ rotate: -8, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          />
          <span className="text-xl font-bold tracking-tight font-grotesk text-theme-text">
            Tool<span className="text-theme-gold">Verse</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1.5 bg-theme-gold/10 text-theme-gold uppercase tracking-wider align-middle border border-theme-gold/20">
              PRO
            </span>
          </span>
        </Link>

        {/* Right cluster: categories + CTA + burger */}
        <div className="flex items-center gap-2">
          {/* Desktop category triggers */}
          <div className="hidden lg:flex items-center gap-1">
          {CATEGORIES.map((cat) => {
            const isOpen = openCat === cat.name;
            const hasActive = cat.items.some((it) => it.href === pathname);
            return (
              <div
                key={cat.name}
                className="relative"
                onMouseEnter={() => openMenu(cat.name)}
                onMouseLeave={scheduleClose}
              >
                <button
                  onClick={() => (isOpen ? setOpenCat(null) : openMenu(cat.name))}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold font-grotesk transition-colors outline-none focus-visible:ring-2 focus-visible:ring-theme-gold/40 ${isOpen ? "bg-slate-100 text-theme-text" : hasActive ? "text-theme-gold" : "text-theme-text hover:bg-slate-50"}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: cat.accent, opacity: isOpen || hasActive ? 1 : 0.5 }} />
                  {cat.name}
                  <ChevronDown size={15} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${isOpen || hasActive ? "text-theme-gold" : "text-theme-muted"}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="absolute right-0 top-full pt-2 w-[360px]"
                    >
                    <div className="rounded-2xl bg-white border border-theme-border shadow-xl shadow-slate-900/10 overflow-hidden">
                      {/* category-colored accent + header */}
                      <div className="h-1 w-full" style={{ background: cat.accent }} />
                      <div className="px-4 pt-3 pb-2">
                        <div className="text-sm font-bold font-grotesk text-theme-text">{cat.name}</div>
                        <p className="text-xs text-theme-muted">{cat.blurb}</p>
                      </div>
                      <div className="p-2">
                        {cat.items.map((it) => {
                          const active = it.href === pathname;
                          return (
                            <Link
                              key={it.href}
                              href={it.href}
                              {...itemProps(it)}
                              onClick={() => setOpenCat(null)}
                              aria-current={active ? "page" : undefined}
                              className={`group flex items-start gap-3 rounded-xl p-2.5 transition-all duration-200 hover:translate-x-1 ${active ? "bg-slate-50" : "hover:bg-slate-50"}`}
                            >
                              <span
                                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6"
                                style={{ background: cat.accent }}
                              >
                                {it.icon}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-1.5">
                                  <span className="text-sm font-semibold font-grotesk text-theme-text truncate">{it.label}</span>
                                  {it.badge && (
                                    <span className="rounded bg-red-500 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">{it.badge}</span>
                                  )}
                                  {it.download && (
                                    <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-theme-muted"><Download size={9} /> EXE</span>
                                  )}
                                  {it.external && <ArrowUpRight size={12} className="text-theme-muted shrink-0" />}
                                </span>
                                <span className="block text-xs text-theme-muted leading-snug">{it.desc}</span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          </div>

          <span className="hidden lg:block h-6 w-px bg-slate-200 mx-1" />

          <Link href="/#tools" className="hidden lg:inline-flex">
            <motion.span
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary px-5 py-2.5 text-sm inline-flex items-center gap-2"
            >
              Explore tools
            </motion.span>
          </Link>

          {/* Mobile burger */}
          <button
            className="rounded-lg p-2 text-theme-text transition-colors hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — accordion by category */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-theme-border bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              {CATEGORIES.map((cat) => {
                const expanded = mobileCat === cat.name;
                return (
                  <div key={cat.name} className="rounded-xl overflow-hidden border border-slate-100">
                    <button
                      onClick={() => setMobileCat(expanded ? null : cat.name)}
                      aria-expanded={expanded}
                      className="w-full flex items-center justify-between gap-2 px-3.5 py-3 text-left"
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: cat.accent }} />
                        <span className="text-sm font-bold font-grotesk text-theme-text">{cat.name}</span>
                      </span>
                      <ChevronDown size={16} className={`text-theme-muted transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-2 pb-2">
                            {cat.items.map((it) => {
                              const active = it.href === pathname;
                              return (
                                <Link
                                  key={it.href}
                                  href={it.href}
                                  {...itemProps(it)}
                                  onClick={() => setMobileOpen(false)}
                                  aria-current={active ? "page" : undefined}
                                  className={`flex items-center gap-3 rounded-lg p-2.5 ${active ? "bg-slate-50" : "active:bg-slate-50"}`}
                                >
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: cat.accent }}>
                                    {it.icon}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="flex items-center gap-1.5">
                                      <span className="text-sm font-semibold font-grotesk text-theme-text">{it.label}</span>
                                      {it.badge && <span className="rounded bg-red-500 px-1.5 py-0.5 text-[8px] font-black uppercase text-white">{it.badge}</span>}
                                      {it.download && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-theme-muted">EXE</span>}
                                    </span>
                                    <span className="block text-xs text-theme-muted leading-snug">{it.desc}</span>
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
              <Link href="/#tools" onClick={() => setMobileOpen(false)} className="btn-primary w-full mt-2 px-5 py-3 text-sm flex items-center justify-center">
                Explore tools
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
