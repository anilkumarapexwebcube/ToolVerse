"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Activity, ShieldCheck, Radar, Monitor, FileSpreadsheet,
  CalendarClock, Search, Sparkles, ArrowRight,
} from "lucide-react";

type Tag = "New tool" | "Improvement" | "Security";
type Entry = {
  date: string;
  tag: Tag;
  title: string;
  desc: string;
  icon: React.ReactNode;
  href?: string;
};

const TAG_STYLE: Record<Tag, string> = {
  "New tool": "bg-theme-gold/10 text-theme-gold border-theme-gold/25",
  Improvement: "bg-indigo-50 text-theme-accent border-indigo-200",
  Security: "bg-green-50 text-green-700 border-green-200",
};

const entries: Entry[] = [
  {
    date: "Sep 3, 2026", tag: "Security",
    title: "Device-based access control + admin panel",
    desc: "The whole suite is now invite-only. Systems are approved per device from a new admin panel — one-time approval per machine, instant revoke, encrypted sessions.",
    icon: <ShieldCheck size={18} />, href: "/admin",
  },
  {
    date: "Sep 2, 2026", tag: "New tool",
    title: "Rank Radar — desktop rank tracker",
    desc: "Track true Google rankings with city-level (uule) positions, personalization off, and organic-only results.",
    icon: <Radar size={18} />, href: "/tools/rank-radar",
  },
  {
    date: "Sep 2, 2026", tag: "New tool",
    title: "SearchOps Studio — all-in-one desktop suite",
    desc: "Crawl & index audits, rank tracking, broken-link scans, AI visibility, content tools and bulk reports — native on your PC.",
    icon: <Monitor size={18} />, href: "/tools/searchops-studio",
  },
  {
    date: "Sep 1, 2026", tag: "New tool",
    title: "Ranking Report Filter",
    desc: "A ready-to-use Excel/VBA macro that cleans rank-tracking exports — keeps gains, drops the noise. Copy or download the .bas.",
    icon: <FileSpreadsheet size={18} />, href: "/tools/ranking-report-filter",
  },
  {
    date: "Aug 30, 2026", tag: "New tool",
    title: "GSC Last Crawl Checker",
    desc: "Bulk-check the last Google crawl date & index status for up to 100 URLs, 4× in parallel, with CSV export.",
    icon: <CalendarClock size={18} />, href: "/tools/gsc-crawl-check",
  },
  {
    date: "Aug 28, 2026", tag: "New tool",
    title: "Domain Insights",
    desc: "Authority (DA/PA/DR), traffic estimates, backlinks, domain age, DNS and a full on-page SEO audit for any domain.",
    icon: <Search size={18} />, href: "/tools/domain-insights",
  },
  {
    date: "Aug 26, 2026", tag: "Improvement",
    title: "New navigation, footer & animated 404",
    desc: "Category-based mega-menu, a premium footer, and an interactive 404 with cursor-parallax across the suite.",
    icon: <Sparkles size={18} />,
  },
];

export default function FeedPage() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-[820px] w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-theme-muted hover:text-theme-text transition-colors">
          <ArrowLeft size={16} /> Back to ToolVerse
        </Link>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-gold text-white shadow-md shadow-theme-gold/20">
            <Activity size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-grotesk text-theme-text">What&rsquo;s new</h1>
            <p className="text-sm mt-1 text-theme-muted">Updates, new tools and improvements across the suite</p>
          </div>
        </motion.div>

        {/* timeline */}
        <div className="relative pl-6">
          <span className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" aria-hidden />
          <div className="space-y-6">
            {entries.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: Math.min(i * 0.04, 0.2) }}
                className="relative"
              >
                <span className="absolute -left-6 top-5 w-3.5 h-3.5 rounded-full bg-gradient-gold ring-4 ring-theme-bg" aria-hidden />
                <div className="card-base card-hover p-5">
                  <div className="flex items-start gap-4">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-gold text-white flex-shrink-0">{e.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TAG_STYLE[e.tag]}`}>{e.tag}</span>
                        <span className="text-xs text-theme-muted font-mono">{e.date}</span>
                      </div>
                      <h3 className="font-bold font-grotesk text-theme-text">{e.title}</h3>
                      <p className="text-sm text-theme-muted leading-relaxed mt-1">{e.desc}</p>
                      {e.href && (
                        <Link href={e.href} className="inline-flex items-center gap-1 text-sm font-semibold text-theme-gold hover:gap-2 transition-all mt-2">
                          Open <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-theme-muted mt-10">
          More tools and automations are on the way — check back soon.
        </p>
      </div>
    </div>
  );
}
