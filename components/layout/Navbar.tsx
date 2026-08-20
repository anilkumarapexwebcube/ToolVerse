"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "https://mailreplyai.vercel.app", label: "MailReply AI", badge: "New" },
  { href: "/tools/gsc-crawl-check", label: "GSC Crawl", badge: "New" },
  { href: "/tools/domain-insights", label: "Domain Insights" },
  { href: "/tools/email-checker", label: "Email Checker" },
  { href: "/tools/number-generator", label: "Numbers" },
  { href: "/tools/domain-distiller", label: "Domains" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-theme-border shadow-sm">
      <div className="max-w-[1600px] w-full mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            className="flex items-center justify-center"
          >
            <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-xl" />
          </motion.div>
          <span className="text-xl font-bold tracking-tight font-grotesk text-theme-text">
            Tool<span className="text-theme-gold">Verse</span>{" "}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 bg-theme-gold/10 text-theme-gold uppercase tracking-wider align-middle border border-theme-gold/20">
              PRO
            </span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((l) => {
            const active = pathname === l.href;
            const isExternal = /^https?:\/\//.test(l.href);

            return (
              <div key={l.href} className="group relative">
                {l.badge && (
                  <motion.span
                    initial={{ scale: 0.9, opacity: 0.8 }}
                    animate={{ scale: [1, 1.12, 1], opacity: [0.9, 1, 0.9] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-1 -top-2 z-10 rounded-full border border-red-500/30 bg-red-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-white shadow-sm shadow-red-500/20"
                  >
                    {l.badge}
                  </motion.span>
                )}

                <Link
                  href={l.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                >
                  <motion.span
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className={`inline-flex items-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${active
                        ? "border-amber-200 bg-amber-50 text-amber-700 shadow-sm"
                        : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    {l.label}
                  </motion.span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Mobile burger */}
        <button
          className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border-t border-slate-200 bg-white/90 px-6 pb-4 pt-3 lg:hidden"
        >
          {navLinks.map((l) => {
            const active = pathname === l.href;
            const isExternal = /^https?:\/\//.test(l.href);

            return (
              <div key={`${l.href}-mobile`} className="relative">
                {l.badge && (
                  <motion.span
                    initial={{ scale: 0.9, opacity: 0.8 }}
                    animate={{ scale: [1, 1.12, 1], opacity: [0.9, 1, 0.9] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute right-3.5 top-3.5 rounded-full border border-red-500/30 bg-red-500 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-white"
                  >
                    {l.badge}
                  </motion.span>
                )}

                <Link
                  href={l.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={`block rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${active
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    {l.label}
                  </span>
                </Link>
              </div>
            );
          })}
        </motion.div>
      )}
    </nav>
  );
}
