"use client";
import { motion } from "framer-motion";
import { Cpu, Lock, ArrowLeft, ArrowRight, Star } from "lucide-react";
import Link from "next/link";

export default function WebHarvestProComingSoon() {
  return (
    <div className="min-h-screen px-4 py-10 flex flex-col">
      <div className="max-w-[1600px] mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-theme-muted hover:text-theme-text transition-colors">
          <ArrowLeft size={16} /> Back to ToolVerse
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full text-center px-4">
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center bg-gradient-gold text-white shadow-xl shadow-theme-gold/20 z-10 relative">
            <Cpu size={44} />
          </div>
          <div className="absolute inset-0 bg-theme-gold blur-2xl opacity-20 -z-10 rounded-full animate-pulse-gold" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-theme-text text-white flex items-center justify-center border-[3px] border-white shadow-md z-50"
          >
            <Lock size={16} />
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-theme-gold/10 text-theme-gold border border-theme-gold/20 mb-6">
            In Development
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold font-grotesk text-theme-text mb-4">
            WebHarvest Pro
          </h1>
          <p className="text-lg text-theme-muted max-w-xl mx-auto mb-10 leading-relaxed">
            The ultimate AI-powered multi-site scraper generator. Configure your target URLs and data selectors, and we'll generate a production-ready Node.js scraping project.
          </p>
        </motion.div>

        {/* Feature preview */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 w-full max-w-3xl mb-12 text-left"
        >
          {[
            { title: "Node.js Generation", desc: "Downloads a full Puppeteer/Cheerio project ready to run." },
            { title: "Excel Auto-Export", desc: "Scraped data is automatically formatted and saved to .xlsx." },
            { title: "AI Selectors", desc: "Simply click elements and let AI write robust CSS selectors." },
          ].map((f, i) => (
            <div key={i} className="card-base p-6">
              <Star size={18} className="text-theme-gold mb-3" />
              <h3 className="font-bold font-grotesk text-theme-text mb-2">{f.title}</h3>
              <p className="text-sm text-theme-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Notify CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email to get notified..."
            className="input-base w-full p-4 font-inter text-sm"
          />
          <button className="btn-primary w-full sm:w-auto px-6 py-4 text-sm flex items-center justify-center gap-2 whitespace-nowrap">
            Notify Me <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
