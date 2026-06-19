import Link from "next/link";
import { Zap, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 bg-white border-t border-theme-border py-10">
      <div className="max-w-[1600px] w-full mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-gold text-white shadow-md shadow-theme-gold/20">
              <Zap size={14} fill="currentColor" />
            </div>
            <span className="font-grotesk font-bold text-theme-text">
              Tool<span className="text-theme-gold">Verse</span> Pro
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center justify-center flex-wrap gap-4 text-sm font-grotesk text-theme-muted">
            <Link href="/tools/email-checker" className="hover:text-theme-text transition-colors">Email Checker</Link>
            <Link href="/tools/number-generator" className="hover:text-theme-text transition-colors">Number Gen</Link>
            <Link href="/tools/domain-distiller" className="hover:text-theme-text transition-colors">Domain Distiller</Link>
            <Link href="/tools/utm-builder" className="hover:text-theme-text transition-colors">UTM Builder</Link>
            <Link href="/tools/qr-generator" className="hover:text-theme-text transition-colors">QR Generator</Link>
            <Link href="/tools/webharvest-pro" className="hover:text-theme-text transition-colors">WebHarvest</Link>
          </div>

          {/* Credits */}
          <div className="flex items-center gap-2 text-sm font-grotesk text-slate-400">
            <span>Made with</span>
            <Heart size={14} className="text-theme-gold fill-current opacity-70" />
            <span>· Zero data leaves your browser</span>
          </div>
        </div>

        <div className="mt-8 pt-6 text-center text-xs border-t border-theme-border font-grotesk text-slate-400">
          © 2026 ToolVerse Pro · All tools run 100% client-side · No tracking · No data collection
        </div>
      </div>
    </footer>
  );
}
