"use client";
import Link from "next/link";
import { Heart, ArrowUpRight, Download, Shield, Ban, Lock, Monitor, Radar } from "lucide-react";
import { motion } from "framer-motion";

const SEO_TOOLKIT_EXE_URL =
  "https://www.dropbox.com/scl/fi/roxfrnovvonqvj5z9cy8z/SearchOps-Studio-Setup-1.2.3.exe?rlkey=98vde78gl9y5ew33tvh2qv4w0&st=pmg98si2&dl=1";
const RANK_RADAR_EXE_URL =
  "https://www.dropbox.com/scl/fi/5sxksq5swpvhm7a14kjr3/RankRadar.exe?rlkey=zjalmw3ljlmxzzvvzehn5mk84&st=ffek5bay&dl=1";

const columns: {
  title: string;
  links: { href: string; label: string; external?: boolean; badge?: string }[];
}[] = [
  {
    title: "SEO Tools",
    links: [
      { href: "/tools/domain-insights", label: "Domain Insights", badge: "NEW" },
      { href: "/tools/gsc-crawl-check", label: "GSC Crawl Checker", badge: "NEW" },
      { href: "/tools/domain-distiller", label: "Domain Distiller" },
    ],
  },
  {
    title: "Utilities",
    links: [
      { href: "/tools/email-checker", label: "Email Checker" },
      { href: "/tools/number-generator", label: "Number Generator" },
      { href: "https://mailreplyai.vercel.app", label: "MailReply AI", external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 bg-white border-t border-theme-border">
      {/* gold hairline */}
      <div className="h-1 w-full bg-gradient-gold opacity-80" />

      <div className="max-w-[1600px] w-full mx-auto px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <img src="/logo.png" alt="ToolVerse" className="h-10 w-10 rounded-xl transition-transform group-hover:scale-105" />
              <span className="font-grotesk font-bold text-lg text-theme-text">
                Tool<span className="text-theme-gold">Verse</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1.5 bg-theme-gold/10 text-theme-gold uppercase tracking-wider border border-theme-gold/20 align-middle">
                  PRO
                </span>
              </span>
            </Link>
            <p className="text-sm text-theme-muted leading-relaxed max-w-xs mb-5">
              A premium suite of SEO &amp; productivity tools — domain metrics, crawl checks, and more.
              Fast, private, and free.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Lock size={11} />, label: "Private" },
                { icon: <Ban size={11} />, label: "No ads" },
                { icon: <Shield size={11} />, label: "No tracking" },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-theme-muted border border-slate-200 font-grotesk">
                  <span className="text-theme-gold">{b.icon}</span>{b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest font-grotesk text-theme-text mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={`${col.title}-${l.href}`}>
                    <Link
                      href={l.href}
                      {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group inline-flex items-center gap-1.5 text-sm text-theme-muted hover:text-theme-gold transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-theme-gold transition-colors" />
                      {l.label}
                      {l.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-theme-gold/10 text-theme-gold border border-theme-gold/20">{l.badge}</span>
                      )}
                      {l.external && <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Featured download */}
          <div className="rounded-2xl p-5 bg-slate-50 border border-slate-200 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-gold opacity-[0.05] pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-gold text-white shadow-sm">
                  <Monitor size={17} />
                </span>
                <div>
                  <div className="text-sm font-bold font-grotesk text-theme-text leading-tight">SearchOps Studio</div>
                  <div className="text-[11px] text-theme-muted">Desktop app · Windows</div>
                </div>
              </div>
              <p className="text-xs text-theme-muted leading-relaxed mb-4">
                All-in-one SEO desktop toolkit — runs 100% on your PC.
              </p>
              <motion.a
                href={SEO_TOOLKIT_EXE_URL}
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full px-4 py-2.5 text-xs flex items-center justify-center gap-2"
              >
                <Download size={14} /> Download for Windows
              </motion.a>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-gold text-white shadow-sm">
                    <Radar size={17} />
                  </span>
                  <div>
                    <div className="text-sm font-bold font-grotesk text-theme-text leading-tight">Rank Radar</div>
                    <div className="text-[11px] text-theme-muted">Google rank tracker · Windows</div>
                  </div>
                </div>
                <p className="text-xs text-theme-muted leading-relaxed mb-4">
                  Track city-level Google rankings with organic-only results.
                </p>
                <motion.a
                  href={RANK_RADAR_EXE_URL}
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary w-full px-4 py-2.5 text-xs flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Download for Windows
                </motion.a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-theme-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-grotesk text-center sm:text-left">
            © 2026 ToolVerse Pro · All tools are 100% free &amp; secure
          </p>
          <div className="flex items-center gap-1.5 text-xs font-grotesk text-slate-400">
            <span>Made with</span>
            <Heart size={13} className="text-theme-gold fill-current" />
            <span>by Anil Kumar</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
