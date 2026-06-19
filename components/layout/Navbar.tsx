"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/tools/email-checker",   label: "Email Checker" },
  { href: "/tools/number-generator", label: "Number Gen" },
  { href: "/tools/domain-distiller", label: "Domain Distiller" },
  { href: "/tools/webharvest-pro",   label: "WebHarvest" },
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
            <img src="./logo.png" alt="Logo" className="h-10 w-10 rounded-xl"/>
          </motion.div>
          <span className="text-xl font-bold tracking-tight font-grotesk text-theme-text">
            Tool<span className="text-theme-gold">Verse</span>{" "}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 bg-theme-gold/10 text-theme-gold uppercase tracking-wider align-middle border border-theme-gold/20">
              PRO
            </span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href}>
                <motion.span
                  whileHover={{ y: -2 }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer inline-block font-grotesk ${
                    active
                      ? "bg-theme-gold/10 text-theme-gold border border-theme-gold/20"
                      : "text-theme-muted hover:text-theme-text hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {l.label}
                </motion.span>
              </Link>
            );
          })}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2 text-theme-text hover:bg-slate-100 rounded-lg transition-colors"
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
          className="md:hidden px-6 pb-4 flex flex-col gap-2 bg-white border-b border-theme-border"
        >
          {navLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                <span
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold font-grotesk ${
                    active
                      ? "bg-theme-gold/10 text-theme-gold border border-theme-gold/20"
                      : "text-theme-muted hover:text-theme-text hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {l.label}
                </span>
              </Link>
            );
          })}
        </motion.div>
      )}
    </nav>
  );
}
