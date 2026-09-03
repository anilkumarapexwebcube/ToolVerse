"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Radar, Download, Globe, ShieldCheck, Search, TrendingUp,
  Monitor, Layers, FileSpreadsheet, Filter, CheckCircle, Cpu,
} from "lucide-react";

const EXE_URL =
  "https://www.dropbox.com/scl/fi/5sxksq5swpvhm7a14kjr3/RankRadar.exe?rlkey=zjalmw3ljlmxzzvvzehn5mk84&st=tlyzqddk&dl=1";
const VERSION = "1.0.0";

const features = [
  { icon: <Globe size={20} />, name: "City-level (uule)", desc: "Exact positions for any city, not just the country." },
  { icon: <ShieldCheck size={20} />, name: "Personalization off", desc: "pws=0 so results aren’t skewed by history." },
  { icon: <Search size={20} />, name: "Organic only", desc: "Ignores ads and packs — pure organic ranking." },
  { icon: <TrendingUp size={20} />, name: "True positions", desc: "Sees the SERP exactly as a real searcher does." },
  { icon: <Monitor size={20} />, name: "Desktop & Mobile", desc: "Track both device types separately." },
  { icon: <Layers size={20} />, name: "Depth 10–100", desc: "Choose how deep to scan the results." },
  { icon: <FileSpreadsheet size={20} />, name: "Bulk keywords", desc: "Check many keywords in one run and export." },
  { icon: <Filter size={20} />, name: "Country & language", desc: "Target any market with the right locale." },
  { icon: <CheckCircle size={20} />, name: "Cross-check", desc: "Verify a position against a second live pull." },
];

const preview = {
  domain: "example.com",
  keywords: ["pool table store phoenix", "best seo company phoenix", "buy standing desk"],
};

const steps = [
  { t: "Download the installer", d: "Grab RankRadar for Windows." },
  { t: "Run the setup", d: "If Windows SmartScreen appears, choose “More info → Run anyway”." },
  { t: "Add keywords & check", d: "Enter your domain, location and keywords, then Check Rankings." },
];

export default function RankRadarPage() {
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
                <Radar size={28} />
              </div>
              <span className="badge !bg-theme-gold/10 !text-theme-gold !border-theme-gold/20">Windows desktop app · v{VERSION}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-grotesk text-theme-text leading-tight mb-4">
              Rank Radar
            </h1>
            <p className="text-lg text-theme-muted leading-relaxed mb-8 max-w-xl">
              Track your <span className="text-theme-gold font-semibold">true</span> Google ranking — exact
              city-level positions, personalization off, organic-only, exactly as a real searcher sees it.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <motion.a
                href={EXE_URL} target="_blank" rel="noopener noreferrer" download
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                className="btn-primary px-7 py-3.5 text-sm flex items-center gap-2"
              >
                <Download size={17} /> Download for Windows
              </motion.a>
              <span className="text-xs text-theme-muted">.exe installer · runs on your PC</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { icon: <Globe size={12} />, label: "City-level (uule)" },
                { icon: <ShieldCheck size={12} />, label: "Personalization off (pws=0)" },
                { icon: <Search size={12} />, label: "Organic only" },
              ].map((b) => (
                <span key={b.label} className="badge"><span className="text-theme-gold">{b.icon}</span> {b.label}</span>
              ))}
            </div>
          </motion.div>

          {/* app-window preview */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="card-base p-0 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 bg-slate-50">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs font-grotesk text-theme-muted">Rank Radar — Google SERP</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-theme-muted font-grotesk mb-1">Website domain</div>
                <div className="input-base px-3 py-2.5 text-sm text-theme-text">{preview.domain}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-theme-muted font-grotesk mb-1">Location</div>
                  <div className="input-base px-3 py-2.5 text-sm text-theme-text">Phoenix, Arizona</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-theme-muted font-grotesk mb-1">Depth</div>
                  <div className="flex gap-1">
                    {[10, 30, 50, 100].map((d) => (
                      <span key={d} className={`flex-1 text-center text-xs py-2 rounded-lg font-semibold ${d === 30 ? "bg-gradient-gold text-white" : "bg-slate-100 text-theme-muted"}`}>{d}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-theme-muted font-grotesk mb-1">Keywords</div>
                <div className="input-base px-3 py-2.5 text-xs font-mono text-theme-muted leading-relaxed">
                  {preview.keywords.map((k) => <div key={k}>{k}</div>)}
                </div>
              </div>
              <div className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2"><Radar size={15} /> Check Rankings</div>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold font-grotesk text-theme-text mb-2">Ranking data you can trust</h2>
          <p className="text-theme-muted mb-8">Built to remove every source of SERP bias.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.05 }} className="card-base card-hover p-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-gradient-gold text-white shadow-sm">{f.icon}</div>
                <h3 className="font-bold font-grotesk text-theme-text mb-1.5">{f.name}</h3>
                <p className="text-sm text-theme-muted leading-relaxed">{f.desc}</p>
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
          <h2 className="text-2xl font-bold font-grotesk text-theme-text mb-2">See where you really rank</h2>
          <p className="text-theme-muted mb-6 inline-flex items-center gap-2 flex-wrap justify-center">
            <Cpu size={14} className="text-theme-gold" /> Runs 100% on your PC · Live Google SERP · uule city-level · pws=0 · organic only
          </p>
          <div>
            <motion.a href={EXE_URL} target="_blank" rel="noopener noreferrer" download whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="btn-primary px-8 py-4 text-sm inline-flex items-center gap-2">
              <Download size={17} /> Download for Windows · v{VERSION}
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  );
}
