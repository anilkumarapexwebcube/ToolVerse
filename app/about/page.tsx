"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Mail, Building2, Globe, ArrowUpRight, Cpu, ShieldCheck,
  Search, Radar, Monitor, CalendarClock, Zap, CheckCircle, MapPin,
} from "lucide-react";

// —— edit these to your real details ——
const CONTACT = {
  name: "Anil Kumar",
  role: "Founder · Developer · SEO & Automation Specialist",
  company: "Apex Web Cube",
  address: "Pratap Nagar, Jaipur, Rajasthan, India",
  email: "anilkumar.apexweb.cube@gmail.com",
  github: "https://github.com/anilkumarapexwebcube",
  website: "https://tool-verse-v1.vercel.app",
};

const skills = ["Next.js & React", "SEO tooling", "Workflow automation", "Desktop apps", "Data pipelines", "UI/UX"];

const suite = [
  { icon: <Search size={18} />, name: "Domain Insights", note: "DA/DR, traffic & SEO audit" },
  { icon: <CalendarClock size={18} />, name: "GSC Crawl Checker", note: "bulk last-crawl dates" },
  { icon: <Monitor size={18} />, name: "SearchOps Studio", note: "all-in-one desktop suite" },
  { icon: <Radar size={18} />, name: "Rank Radar", note: "true city-level rankings" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
      className="card-base p-7 md:p-8"
    >
      <h2 className="text-xl font-bold font-grotesk text-theme-text mb-4">{title}</h2>
      {children}
    </motion.section>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-[1000px] w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-theme-muted hover:text-theme-text transition-colors">
          <ArrowLeft size={16} /> Back to ToolVerse
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center gap-6 mb-10 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0 bg-gradient-gold text-white text-2xl font-bold font-grotesk shadow-lg shadow-theme-gold/20">
            AK
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-grotesk text-theme-text">{CONTACT.name}</h1>
            <p className="text-sm md:text-base text-theme-gold font-semibold mt-1">{CONTACT.role}</p>
            <p className="text-sm text-theme-muted mt-1 inline-flex items-center gap-1.5">
              <Building2 size={14} /> {CONTACT.company} · <MapPin size={14} /> {CONTACT.address}
            </p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* About me */}
          <Section title="About me">
            <p className="text-theme-muted leading-relaxed mb-4">
              I&rsquo;m {CONTACT.name}, a developer and SEO-automation specialist. I build fast, private tools
              that take the grunt-work out of SEO — from domain research and rank tracking to crawl audits and
              client reporting — and I ship them as both web apps and native desktop software.
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="badge"><CheckCircle size={11} className="text-theme-gold" /> {s}</span>
              ))}
            </div>
          </Section>

          {/* About the website */}
          <Section title="About this website — ToolVerse Pro">
            <p className="text-theme-muted leading-relaxed mb-5">
              ToolVerse Pro is a private suite of professional SEO &amp; productivity tools. It&rsquo;s built for
              speed, runs with zero tracking, and is invite-only — access is granted per trusted device by the
              owner. A quick look at what&rsquo;s inside:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {suite.map((t) => (
                <div key={t.name} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-gold text-white flex-shrink-0">{t.icon}</span>
                  <div>
                    <div className="text-sm font-semibold font-grotesk text-theme-text">{t.name}</div>
                    <div className="text-xs text-theme-muted">{t.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* About automation */}
          <Section title="About automation">
            <p className="text-theme-muted leading-relaxed">
              Automation is the core idea behind everything here. Repetitive SEO work — checking hundreds of
              URLs, pulling crawl dates, tracking rankings across cities, cleaning report exports — is turned
              into one-click workflows. The goal is simple: let the software do the repetitive runs so you spend
              your time on strategy, not spreadsheets. Batch processing, live data, and clean exports are
              built into every tool.
            </p>
          </Section>

          {/* About company */}
          <Section title="About Apex Web Cube">
            <p className="text-theme-muted leading-relaxed">
              <strong className="text-theme-text">Apex Web Cube</strong> is a web &amp; SEO studio based in
              <strong className="text-theme-text"> Pratap Nagar, Jaipur</strong>, Rajasthan. We design and build
              websites, SEO tooling, and custom automation for agencies and businesses — pairing solid
              engineering with practical, results-driven SEO.
            </p>
          </Section>

          {/* Contact */}
          <Section title="Contact">
            <div className="grid sm:grid-cols-2 gap-3">
              <a href={`mailto:${CONTACT.email}`} className="group flex items-center gap-3 rounded-xl border border-slate-100 p-4 hover:border-theme-gold hover:bg-slate-50 transition-colors">
                <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-gold text-white flex-shrink-0"><Mail size={18} /></span>
                <div className="min-w-0">
                  <div className="text-xs text-theme-muted">Email</div>
                  <div className="text-sm font-semibold text-theme-text truncate group-hover:text-theme-gold">{CONTACT.email}</div>
                </div>
              </a>
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
                <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-gold text-white flex-shrink-0"><MapPin size={18} /></span>
                <div className="min-w-0">
                  <div className="text-xs text-theme-muted">Location</div>
                  <div className="text-sm font-semibold text-theme-text">{CONTACT.address}</div>
                </div>
              </div>
              <a href={CONTACT.github} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl border border-slate-100 p-4 hover:border-theme-gold hover:bg-slate-50 transition-colors">
                <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-gold text-white flex-shrink-0"><Cpu size={18} /></span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-theme-muted">GitHub</div>
                  <div className="text-sm font-semibold text-theme-text truncate group-hover:text-theme-gold">@anilkumarapexwebcube</div>
                </div>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:text-theme-gold" />
              </a>
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
                <span className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-gold text-white flex-shrink-0"><Building2 size={18} /></span>
                <div className="min-w-0">
                  <div className="text-xs text-theme-muted">Company</div>
                  <div className="text-sm font-semibold text-theme-text">{CONTACT.company}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href="/feedback" className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2">
                <Mail size={16} /> Share feedback
              </Link>
              <a href={`mailto:${CONTACT.email}`} className="btn-secondary px-6 py-3 text-sm inline-flex items-center gap-2">
                Email directly
              </a>
            </div>
          </Section>

          <p className="flex items-center justify-center gap-1.5 text-xs text-theme-muted pt-2">
            <Zap size={13} className="text-theme-gold" /> Built &amp; automated by {CONTACT.name} · {CONTACT.company}
          </p>
        </div>
      </div>
    </div>
  );
}
