"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Monitor, Download, Search, TrendingUp, Link2, Activity,
  FileText, CheckCircle, Radar, FileSpreadsheet, Layers, Server, ShieldCheck, Cpu,
} from "lucide-react";

const EXE_URL =
  "https://www.dropbox.com/scl/fi/rketviou0i4pbt6ho7rr8/SearchOps-Studio-Setup-1.6.0.exe?rlkey=igid6mwyvq0cn5m705cg5nuv6&st=ycak0hi6&dl=1";
const VERSION = "1.6.0";

const modules = [
  { icon: <Search size={20} />, name: "Crawl & Index Checker", desc: "Audit crawlability and Google index status at scale." },
  { icon: <TrendingUp size={20} />, name: "Rank Checker", desc: "Track true keyword positions across locations." },
  { icon: <Link2 size={20} />, name: "Broken Link Checker", desc: "Find and fix 404s and broken internal/external links." },
  { icon: <Activity size={20} />, name: "AI Visibility & Decay", desc: "Monitor AI-search visibility and spot content decay." },
  { icon: <FileText size={20} />, name: "Content Suite", desc: "Draft, optimize, and refresh on-page content." },
  { icon: <CheckCircle size={20} />, name: "Content Checker", desc: "Validate content against on-page SEO rules." },
  { icon: <Radar size={20} />, name: "Lead Generation", desc: "Build prospect lists straight from your research." },
  { icon: <FileSpreadsheet size={20} />, name: "Generate Reports", desc: "One-click client-ready SEO reports." },
  { icon: <Layers size={20} />, name: "Bulk Reports", desc: "Run reports across many sites in a single batch." },
  { icon: <Server size={20} />, name: "Accounts & Mapping", desc: "Manage clients and map keywords to target pages." },
];

const steps = [
  { t: "Download the installer", d: "Grab SearchOps-Studio-Setup for Windows." },
  { t: "Run the setup", d: "If Windows SmartScreen appears, choose “More info → Run anyway”." },
  { t: "Sign in & start", d: "Open the app, sign in, and your full toolkit is ready — offline-capable." },
];

export default function SearchOpsStudioPage() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-[1200px] w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-theme-muted hover:text-theme-text transition-colors">
          <ArrowLeft size={16} /> Back to ToolVerse
        </Link>

        {/* Hero */}
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-gold text-white shadow-md shadow-theme-gold/20">
                <Monitor size={28} />
              </div>
              <span className="badge !bg-theme-gold/10 !text-theme-gold !border-theme-gold/20">Windows desktop app · v{VERSION}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-grotesk text-theme-text leading-tight mb-4">
              SearchOps Studio
            </h1>
            <p className="text-lg text-theme-muted leading-relaxed mb-8 max-w-xl">
              The all-in-one SEO desktop suite — crawl &amp; index audits, rank tracking, broken-link scans,
              AI-visibility monitoring, content tools, and bulk client reports, all running natively on your PC.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <motion.a
                href={EXE_URL} target="_blank" rel="noopener noreferrer" download
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                className="btn-primary px-7 py-3.5 text-sm flex items-center gap-2"
              >
                <Download size={17} /> Download for Windows
              </motion.a>
              <span className="text-xs text-theme-muted">.exe installer · ~free · no sign-up to try</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Cpu size={12} />, label: "Runs 100% on your PC" },
                { icon: <ShieldCheck size={12} />, label: "Your data stays local" },
                { icon: <Layers size={12} />, label: "Bulk & batch processing" },
              ].map((b) => (
                <span key={b.label} className="badge"><span className="text-theme-gold">{b.icon}</span> {b.label}</span>
              ))}
            </div>
          </motion.div>

          {/* app-window preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="card-base p-0 overflow-hidden"
          >
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs font-grotesk text-theme-muted">SearchOps Studio</span>
            </div>
            <div className="p-4 space-y-1.5">
              {modules.slice(0, 6).map((m, i) => (
                <div key={m.name} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${i === 0 ? "bg-theme-gold/10 border border-theme-gold/20" : "hover:bg-slate-50"}`}>
                  <span className={i === 0 ? "text-theme-gold" : "text-theme-muted"}>{m.icon}</span>
                  <span className={`text-sm font-semibold font-grotesk ${i === 0 ? "text-theme-gold" : "text-theme-text"}`}>{m.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Modules */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold font-grotesk text-theme-text mb-2">Everything in one toolkit</h2>
          <p className="text-theme-muted mb-8">Ten pro modules, built for SEO teams and agencies.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.05 }}
                className="card-base card-hover p-6"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gradient-gold text-white shadow-sm">
                  {m.icon}
                </div>
                <h3 className="font-bold font-grotesk text-theme-text mb-1.5">{m.name}</h3>
                <p className="text-sm text-theme-muted leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Install steps */}
        <div className="card-base p-8 mb-10">
          <h2 className="text-xl font-bold font-grotesk text-theme-text mb-6">Install in 3 steps</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.t} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-theme-gold/10 text-theme-gold text-sm font-bold flex items-center justify-center flex-shrink-0 font-grotesk">{i + 1}</span>
                <div>
                  <div className="font-semibold font-grotesk text-theme-text">{s.t}</div>
                  <div className="text-sm text-theme-muted leading-snug">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="card-base p-8 text-center bg-slate-50 border-slate-200">
          <h2 className="text-2xl font-bold font-grotesk text-theme-text mb-2">Ready to run your search operations?</h2>
          <p className="text-theme-muted mb-6">Download SearchOps Studio and get the full suite on your desktop.</p>
          <motion.a
            href={EXE_URL} target="_blank" rel="noopener noreferrer" download
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
            className="btn-primary px-8 py-4 text-sm inline-flex items-center gap-2"
          >
            <Download size={17} /> Download for Windows · v{VERSION}
          </motion.a>
        </div>
      </div>
    </div>
  );
}
