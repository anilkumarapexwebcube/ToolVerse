"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mail, Globe, Filter, Cpu, ArrowRight, Zap,
  CheckCircle, Shield, Layers, Star, Link as LinkIcon, QrCode
} from "lucide-react";

const tools = [
  {
    href:        "/tools/email-checker",
    icon:        <Mail size={24} />,
    name:        "Email Utilization Checker",
    tagline:     "Know exactly which emails are unused",
    description: "Compare master email lists against utilized sets. Find duplicates, unused addresses, and get instant copy-ready results.",
    badge:       "LIVE",
    features:    ["Cache to localStorage", "Quick-check mode", "Duplicate detection"],
    comingSoon:  false,
  },
  {
    href:        "/tools/number-generator",
    icon:        <Globe size={24} />,
    name:        "Global Number Generator",
    tagline:     "Random phone numbers for 60+ countries",
    description: "Generate realistic, country-formatted phone numbers worldwide. Search, filter, animate and copy in one click.",
    badge:       "LIVE",
    features:    ["60+ countries", "Rolling animation", "Generate all at once"],
    comingSoon:  false,
  },
  {
    href:        "/tools/domain-distiller",
    icon:        <Filter size={24} />,
    name:        "Domain Distiller",
    tagline:     "Extract root domains from raw logs",
    description: "Paste messy log data and instantly extract, deduplicate and export clean domain lists. Regex-powered, zero server calls.",
    badge:       "LIVE",
    features:    ["Regex engine", "Deduplication", "Download .txt"],
    comingSoon:  false,
  },
  {
    href:        "/tools/utm-builder",
    icon:        <LinkIcon size={24} />,
    name:        "UTM Link Builder",
    tagline:     "Campaign tracking made easy",
    description: "Build, track, and manage UTM campaign URLs with live previews, history, and bulk generation features.",
    badge:       "NEW",
    features:    ["History tracking", "Live preview", "Bulk generation"],
    comingSoon:  false,
  },
  {
    href:        "/tools/qr-generator",
    icon:        <QrCode size={24} />,
    name:        "QR Code Generator",
    tagline:     "High-res QR codes instantly",
    description: "Generate customized, print-ready QR codes for URLs, text, or contacts. Adjust colors and download as PNG without limits.",
    badge:       "NEW",
    features:    ["High-res PNG export", "Custom colors", "100% offline"],
    comingSoon:  false,
  },
  {
    href:        "/tools/webharvest-pro",
    icon:        <Cpu size={24} />,
    name:        "WebHarvest Pro",
    tagline:     "AI-powered multi-site scraper generator",
    description: "Configure target URLs and data selectors, then download a complete Node.js scraper project. Auto-exports to Excel.",
    badge:       "SOON",
    features:    ["Node.js project gen", "Excel export", "Puppeteer support"],
    comingSoon:  true,
  },
];

const stats = [
  { value: "4", label: "Precision Tools", icon: <Layers size={20} /> },
  { value: "60+", label: "Countries Supported", icon: <Globe size={20} /> },
  { value: "100%", label: "Client-Side Privacy", icon: <Shield size={20} /> },
  { value: "0ms", label: "Server Latency", icon: <Zap size={20} /> },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="max-w-[1600px] w-full mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold badge"
          >
            <span className="w-2 h-2 rounded-full bg-theme-gold animate-pulse" />
            Futuristic Tool Suite · v2.0
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight font-grotesk text-theme-text"
          >
            Your Ultimate
            <br />
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              Digital Toolbox
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-theme-muted"
          >
            Professional-grade utilities built for speed and precision.
            100% client-side — your data never leaves your browser.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/tools/email-checker">
              <motion.button className="btn-primary px-8 py-4 text-base flex items-center gap-2">
                <Zap size={18} />
                Launch Tools
                <ArrowRight size={16} />
              </motion.button>
            </Link>
            <motion.a
              href="#tools"
              className="btn-secondary px-8 py-4 text-base flex items-center gap-2"
            >
              <Star size={16} />
              Explore Tools
            </motion.a>
          </motion.div>
        </div>

        {/* Floating icons row */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-16 flex-wrap"
        >
          {[
            { icon: <Mail size={22} />, delay: 0 },
            { icon: <Globe size={22} />, delay: 0.4 },
            { icon: <Filter size={22} />, delay: 0.8 },
            { icon: <Cpu size={22} />, delay: 1.2 },
          ].map((item, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white border border-slate-100 shadow-sm text-theme-gold"
            >
              {item.icon}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-6">
        <div className="max-w-[1600px] w-full mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6 card-base card-hover"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-slate-50 text-theme-gold border border-slate-100 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <div className="text-3xl font-bold mb-1 font-grotesk text-theme-text">
                {s.value}
              </div>
              <div className="text-sm text-theme-muted">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Tools Grid ── */}
      <section id="tools" className="py-16 px-6">
        <div className="max-w-[1600px] w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-grotesk text-theme-text">
              All Tools
            </h2>
            <p className="text-lg text-theme-muted">
              Pick a tool and start working — no sign-up, no tracking
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tools.map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative p-8 rounded-3xl cursor-pointer group card-base card-hover"
              >
                {/* Coming Soon Ribbon */}
                {tool.comingSoon && (
                  <div className="absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                    COMING SOON
                  </div>
                )}

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-gradient-gold text-white shadow-md shadow-theme-gold/20">
                  {tool.icon}
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold mb-1 font-grotesk text-theme-text group-hover:text-theme-gold transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm font-semibold mb-3 text-theme-gold">
                  {tool.tagline}
                </p>
                <p className="text-sm mb-6 leading-relaxed text-theme-muted">
                  {tool.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {tool.features.map((f, j) => (
                    <span key={j} className="badge">
                      <CheckCircle size={11} className="text-theme-gold" />
                      {f}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Link href={tool.href}>
                  <button
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold w-full sm:w-auto justify-center transition-all ${
                      tool.comingSoon
                        ? "bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
                        : "bg-theme-gold text-white hover:bg-[#a5883a] shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    }`}
                    disabled={tool.comingSoon}
                  >
                    {tool.comingSoon ? "Preview Coming Soon" : "Launch Tool"}
                    <ArrowRight size={15} />
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
