"use client";
import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Home, Compass, ArrowRight, Search } from "lucide-react";

const quickLinks = [
  { href: "/tools/domain-insights", label: "Domain Insights" },
  { href: "/tools/gsc-crawl-check", label: "GSC Crawl Checker" },
  { href: "/tools/email-checker", label: "Email Checker" },
  { href: "/tools/domain-distiller", label: "Domain Distiller" },
];

// scattered floating brand marks (parallax depth + start position in %)
const marks = [
  { top: "14%", left: "12%", size: 46, depth: 60, dur: 6 },
  { top: "22%", left: "82%", size: 34, depth: -50, dur: 7 },
  { top: "70%", left: "8%", size: 40, depth: -70, dur: 8 },
  { top: "76%", left: "86%", size: 52, depth: 55, dur: 6.5 },
  { top: "44%", left: "4%", size: 28, depth: 40, dur: 9 },
  { top: "40%", left: "92%", size: 30, depth: -40, dur: 7.5 },
];

export default function NotFound() {
  const ref = useRef<HTMLDivElement>(null);

  // normalized cursor (-0.5 … 0.5) and raw px for the glow
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const gx = useMotionValue(-9999);
  const gy = useMotionValue(-9999);

  const sx = useSpring(mx, { stiffness: 120, damping: 22, mass: 0.4 });
  const sy = useSpring(my, { stiffness: 120, damping: 22, mass: 0.4 });
  const gxs = useSpring(gx, { stiffness: 200, damping: 30 });
  const gys = useSpring(gy, { stiffness: 200, damping: 30 });

  // 3D tilt for the whole 404 group
  const rotX = useTransform(sy, (v) => v * -12);
  const rotY = useTransform(sx, (v) => v * 12);
  // parallax offsets per layer
  const l4x = useTransform(sx, (v) => v * -55);
  const l4y = useTransform(sy, (v) => v * -34);
  const r4x = useTransform(sx, (v) => v * 55);
  const r4y = useTransform(sy, (v) => v * 34);
  const logoX = useTransform(sx, (v) => v * 24);
  const logoY = useTransform(sy, (v) => v * 24);
  // glow follows cursor (offset by half its size)
  const glowX = useTransform(gxs, (v) => v - 220);
  const glowY = useTransform(gys, (v) => v - 220);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
    gx.set(e.clientX - r.left);
    gy.set(e.clientY - r.top);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
    gx.set(-9999);
    gy.set(-9999);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative min-h-[86vh] overflow-hidden flex flex-col items-center justify-center px-6 py-16"
      style={{ perspective: 1000 }}
    >
      {/* cursor-following gold glow */}
      <motion.div
        aria-hidden
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none absolute top-0 left-0 w-[440px] h-[440px] rounded-full -z-10"
      >
        <div className="w-full h-full rounded-full bg-theme-gold opacity-[0.12] blur-[90px]" />
      </motion.div>

      {/* scrolling marquee lines (top & bottom) */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex flex-col justify-between py-16 opacity-[0.04] select-none">
        <motion.div className="flex gap-10 whitespace-nowrap" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="text-6xl font-bold font-grotesk text-theme-text">ToolVerse · 404 ·</span>
          ))}
        </motion.div>
        <motion.div className="flex gap-10 whitespace-nowrap" animate={{ x: ["-50%", "0%"] }} transition={{ duration: 34, repeat: Infinity, ease: "linear" }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="text-6xl font-bold font-grotesk text-theme-text">Page not found ·</span>
          ))}
        </motion.div>
      </div>

      {/* floating parallax brand marks */}
      {marks.map((m, i) => (
        <FloatMark key={i} sx={sx} sy={sy} {...m} />
      ))}

      {/* ── 404 group ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", bounce: 0.35 }}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
        className="relative flex items-center justify-center gap-2 md:gap-4 mb-4"
      >
        <motion.span
          style={{ x: l4x, y: l4y }}
          className="text-[110px] md:text-[200px] leading-none font-bold font-grotesk bg-gradient-gold bg-clip-text text-transparent drop-shadow-sm"
        >
          4
        </motion.span>

        {/* center: rotating brand logo as the "0" */}
        <motion.div style={{ x: logoX, y: logoY }} className="relative">
          <motion.img
            src="/logo.png"
            alt="ToolVerse"
            className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-3xl shadow-xl shadow-theme-gold/20"
            animate={{ rotate: [0, 6, -6, 0], y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 -z-10 blur-2xl bg-theme-gold opacity-20 rounded-full" />
        </motion.div>

        <motion.span
          style={{ x: r4x, y: r4y }}
          className="text-[110px] md:text-[200px] leading-none font-bold font-grotesk bg-gradient-gold bg-clip-text text-transparent drop-shadow-sm"
        >
          4
        </motion.span>
      </motion.div>

      {/* text + CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-center max-w-auto relative z-10"
      >
        <h2 className="text-2xl md:text-3xl font-bold font-grotesk text-theme-text mb-3">
          Looks like this page doesn&rsquo;t exist :(
        </h2>
        <p className="text-theme-muted mb-9 leading-relaxed">
          The page you&rsquo;re after may have moved, been renamed, or never existed. Let&rsquo;s get you
          back to the tools that do.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Link href="/">
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="btn-primary px-7 py-3.5 text-sm flex items-center gap-2">
              <Home size={16} /> Back to Home
            </motion.button>
          </Link>
          <Link href="/#tools">
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} className="btn-secondary px-7 py-3.5 text-sm flex items-center gap-2">
              <Compass size={16} /> Browse all tools
            </motion.button>
          </Link>
        </div>

        <div className="flex items-center gap-2 justify-center mb-4 text-xs uppercase tracking-widest font-grotesk text-theme-muted">
          <Search size={13} className="text-theme-gold" /> Popular tools
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {quickLinks.map((l, i) => (
            <motion.div key={l.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.07 }}>
              <Link
                href={l.href}
                className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-theme-muted hover:border-theme-gold hover:text-theme-gold hover:-translate-y-0.5 transition-all"
              >
                {l.label}
                <ArrowRight size={13} />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* one floating, parallax-reactive brand mark */
function FloatMark({
  sx, sy, top, left, size, depth, dur,
}: {
  sx: ReturnType<typeof useSpring>;
  sy: ReturnType<typeof useSpring>;
  top: string; left: string; size: number; depth: number; dur: number;
}) {
  const x = useTransform(sx, (v: number) => v * depth);
  const y = useTransform(sy, (v: number) => v * depth);
  return (
    <motion.div aria-hidden style={{ x, y, top, left }} className="pointer-events-none absolute -z-10">
      <motion.img
        src="/logo.png"
        alt=""
        style={{ width: size, height: size }}
        className="rounded-xl opacity-[0.10] grayscale"
        animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
        transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
