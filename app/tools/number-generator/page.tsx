"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Shuffle, Copy, CheckCircle, Search, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ── Latest Code Countries ──
const COUNTRIES = [
  { name: "Afghanistan", dial: "+93", iso: "af", format: "7X XXX XXXX", digits: [7, 9] },
  { name: "Albania", dial: "+355", iso: "al", format: "6X XXX XXXX", digits: [6, 9] },
  { name: "Argentina", dial: "+54", iso: "ar", format: "9 11 XXXX XXXX", digits: [9, 10] },
  { name: "Australia", dial: "+61", iso: "au", format: "4XX XXX XXX", digits: [4, 9] },
  { name: "Austria", dial: "+43", iso: "at", format: "6XX XXXXXXX", digits: [6, 10] },
  { name: "Bangladesh", dial: "+880", iso: "bd", format: "1XXX XXXXXX", digits: [1, 10] },
  { name: "Belgium", dial: "+32", iso: "be", format: "4XX XX XX XX", digits: [4, 9] },
  { name: "Brazil", dial: "+55", iso: "br", format: "11 9XXXX XXXX", digits: [9, 11] },
  { name: "Canada", dial: "+1", iso: "ca", format: "XXX XXX XXXX", digits: [3, 10] },
  { name: "China", dial: "+86", iso: "cn", format: "1XX XXXX XXXX", digits: [1, 11] },
  { name: "Colombia", dial: "+57", iso: "co", format: "3XX XXX XXXX", digits: [3, 10] },
  { name: "Croatia", dial: "+385", iso: "hr", format: "9X XXX XXXX", digits: [9, 9] },
  { name: "Czech Republic", dial: "+420", iso: "cz", format: "7XX XXX XXX", digits: [7, 9] },
  { name: "Denmark", dial: "+45", iso: "dk", format: "XX XX XX XX", digits: [2, 8] },
  { name: "Egypt", dial: "+20", iso: "eg", format: "1XX XXXX XXXX", digits: [1, 10] },
  { name: "Ethiopia", dial: "+251", iso: "et", format: "9X XXX XXXX", digits: [9, 9] },
  { name: "Finland", dial: "+358", iso: "fi", format: "4X XXX XXXX", digits: [4, 9] },
  { name: "France", dial: "+33", iso: "fr", format: "6 XX XX XX XX", digits: [6, 9] },
  { name: "Germany", dial: "+49", iso: "de", format: "1XX XXXXXXXX", digits: [1, 11] },
  { name: "Ghana", dial: "+233", iso: "gh", format: "2X XXX XXXX", digits: [2, 9] },
  { name: "Greece", dial: "+30", iso: "gr", format: "69X XXX XXXX", digits: [6, 10] },
  { name: "India", dial: "+91", iso: "in", format: "9XXXX XXXXX", digits: [9, 10] },
  { name: "Indonesia", dial: "+62", iso: "id", format: "8XX XXXX XXXX", digits: [8, 12] },
  { name: "Iran", dial: "+98", iso: "ir", format: "9XX XXX XXXX", digits: [9, 10] },
  { name: "Iraq", dial: "+964", iso: "iq", format: "7XX XXX XXXX", digits: [7, 10] },
  { name: "Ireland", dial: "+353", iso: "ie", format: "8X XXX XXXX", digits: [8, 9] },
  { name: "Israel", dial: "+972", iso: "il", format: "5X XXX XXXX", digits: [5, 9] },
  { name: "Italy", dial: "+39", iso: "it", format: "3XX XXX XXXX", digits: [3, 10] },
  { name: "Japan", dial: "+81", iso: "jp", format: "9X XXXX XXXX", digits: [9, 10] },
  { name: "Jordan", dial: "+962", iso: "jo", format: "7X XXX XXXX", digits: [7, 9] },
  { name: "Kenya", dial: "+254", iso: "ke", format: "7XX XXX XXX", digits: [7, 9] },
  { name: "Malaysia", dial: "+60", iso: "my", format: "1X XXXX XXXX", digits: [1, 10] },
  { name: "Mexico", dial: "+52", iso: "mx", format: "1 XXX XXX XXXX", digits: [1, 10] },
  { name: "Morocco", dial: "+212", iso: "ma", format: "6XX XXXXXX", digits: [6, 9] },
  { name: "Netherlands", dial: "+31", iso: "nl", format: "6 XXXXXXXX", digits: [6, 9] },
  { name: "New Zealand", dial: "+64", iso: "nz", format: "2X XXX XXXX", digits: [2, 9] },
  { name: "Nigeria", dial: "+234", iso: "ng", format: "8XX XXX XXXX", digits: [8, 10] },
  { name: "Norway", dial: "+47", iso: "no", format: "9XX XX XXX", digits: [9, 8] },
  { name: "Pakistan", dial: "+92", iso: "pk", format: "3XX XXXXXXX", digits: [3, 10] },
  { name: "Philippines", dial: "+63", iso: "ph", format: "9XX XXX XXXX", digits: [9, 10] },
  { name: "Poland", dial: "+48", iso: "pl", format: "6XX XXX XXX", digits: [6, 9] },
  { name: "Portugal", dial: "+351", iso: "pt", format: "9XX XXX XXX", digits: [9, 9] },
  { name: "Romania", dial: "+40", iso: "ro", format: "7XX XXX XXX", digits: [7, 9] },
  { name: "Russia", dial: "+7", iso: "ru", format: "9XX XXX XXXX", digits: [9, 10] },
  { name: "Saudi Arabia", dial: "+966", iso: "sa", format: "5X XXXX XXXX", digits: [5, 9] },
  { name: "South Africa", dial: "+27", iso: "za", format: "8X XXX XXXX", digits: [8, 9] },
  { name: "South Korea", dial: "+82", iso: "kr", format: "10 XXXX XXXX", digits: [1, 10] },
  { name: "Spain", dial: "+34", iso: "es", format: "6XX XXX XXX", digits: [6, 9] },
  { name: "Sweden", dial: "+46", iso: "se", format: "7X XXX XXXX", digits: [7, 9] },
  { name: "Switzerland", dial: "+41", iso: "ch", format: "7X XXX XXXX", digits: [7, 9] },
  { name: "Taiwan", dial: "+886", iso: "tw", format: "9X XXXX XXXX", digits: [9, 9] },
  { name: "Tanzania", dial: "+255", iso: "tz", format: "7XX XXX XXX", digits: [7, 9] },
  { name: "Thailand", dial: "+66", iso: "th", format: "8X XXX XXXX", digits: [8, 9] },
  { name: "Turkey", dial: "+90", iso: "tr", format: "5XX XXX XXXX", digits: [5, 10] },
  { name: "United Arab Emirates", dial: "+971", iso: "ae", format: "5X XXX XXXX", digits: [5, 9], aliases: ["UAE", "emirates", "dubai", "abu dhabi"] },
  { name: "Uganda", dial: "+256", iso: "ug", format: "7XX XXXXXX", digits: [7, 9] },
  { name: "Ukraine", dial: "+380", iso: "ua", format: "9X XXX XXXX", digits: [9, 9] },
  { name: "United Kingdom", dial: "+44", iso: "gb", format: "7XXX XXXXXX", digits: [7, 10], aliases: ["uk", "britain", "england", "gb"] },
  { name: "United States", dial: "+1", iso: "us", format: "XXX XXX XXXX", digits: [3, 10], aliases: ["us", "usa", "america", "u.s.", "u.s.a."] },
  { name: "Vietnam", dial: "+84", iso: "vn", format: "9XX XXX XXX", digits: [9, 9] },
];

function rnd(n: number) { return Math.floor(Math.random() * n); }

function generateNumberString(country: typeof COUNTRIES[0]): string {
  const len = country.digits[1];
  let digits = Array.from({ length: len }, () => rnd(10));
  digits[0] = parseInt(country.digits[0].toString()[0]);
  if (digits[0] === 0) digits[0] = 1 + rnd(9);
  const raw = digits.join('');
  const formatted = country.dial + ' ' + raw.replace(/(.{3})(.{3})(.*)/, '$1 $2 $3');
  return formatted;
}

export default function NumberGenerator() {
  const [search, setSearch] = useState("");
  const [numbers, setNumbers] = useState<Record<string, string>>({});
  const [rolling, setRolling] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState("");
  const [generatedCount, setGeneratedCount] = useState(0);

  const filtered = COUNTRIES.filter((c) => {
    const q = search.toLowerCase().replace(/[.\s]/g, "");
    if (!q) return true;
    if (c.name.toLowerCase().replace(/[.\s]/g, "").includes(q)) return true;
    if (c.dial.includes(search)) return true;
    if (c.aliases?.some((a) => a.replace(/[.\s]/g, "").includes(q))) return true;
    return false;
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const handleCopy = (e: React.MouseEvent, country: string, num: string) => {
    e.stopPropagation();
    if (!num) return;
    navigator.clipboard.writeText(num).then(() => {
      setCopied((p) => ({ ...p, [country]: true }));
      showToast(`Copied: ${num}`);
      setTimeout(() => setCopied((p) => ({ ...p, [country]: false })), 2000);
    });
  };

  const rollAnimation = useCallback((countryName: string, finalVal: string) => {
    const steps = 8;
    let count = 0;
    setRolling((p) => ({ ...p, [countryName]: true }));
    const timer = setInterval(() => {
      setNumbers((p) => {
        let temp = finalVal.split("").map(c => /\d/.test(c) ? rnd(10).toString() : c).join("");
        return { ...p, [countryName]: temp };
      });
      count++;
      if (count >= steps) {
        clearInterval(timer);
        setRolling((p) => ({ ...p, [countryName]: false }));
        setNumbers((p) => ({ ...p, [countryName]: finalVal }));
      }
    }, 50);
  }, []);

  const generateSingle = (country: typeof COUNTRIES[0]) => {
    const val = generateNumberString(country);
    setGeneratedCount((c) => c + 1);
    rollAnimation(country.name, val);
  };

  const generateAll = () => {
    filtered.forEach((c, i) => {
      setTimeout(() => generateSingle(c), i * 40);
    });
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-[1600px] w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-theme-muted hover:text-theme-text transition-colors">
          <ArrowLeft size={16} /> Back to ToolVerse
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-5 mb-10 text-center md:text-left justify-center md:justify-start"
        >
          <div className="hidden md:flex w-16 h-16 rounded-2xl items-center justify-center flex-shrink-0 bg-gradient-gold text-white shadow-md shadow-theme-gold/20">
            <Globe size={30} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-grotesk text-theme-text">
              Global Number Generator
            </h1>
            <p className="text-sm mt-2 text-theme-muted">
              Generate formatted phone numbers for any country worldwide
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl">
          {[
            { label: "Countries", value: COUNTRIES.length },
            { label: "Generated", value: generatedCount },
            { label: "Showing",   value: filtered.length },
          ].map((s, i) => (
            <motion.div key={i} className="text-center p-5 card-base card-hover">
              <div className="text-3xl font-bold font-mono text-theme-gold mb-2">{s.value}</div>
              <div className="text-sm uppercase tracking-widest font-medium text-theme-muted">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Search & Gen All */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-gold" />
            <input
              className="input-base w-full pl-12 pr-10 py-4 font-inter text-base"
              placeholder="Search country or dial code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-lg"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={generateAll}
            className="btn-primary px-8 py-4 text-sm flex items-center justify-center gap-2"
          >
            <Shuffle size={16} />
            Generate All Numbers
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center text-theme-muted"
              >
                <Globe size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-grotesk">No countries found for "{search}"</p>
              </motion.div>
            ) : (
              filtered.map((c, i) => {
                const num = numbers[c.name];
                const isRolling = rolling[c.name];
                const isCopied = copied[c.name];

                return (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.2) }}
                    onClick={() => generateSingle(c)}
                    className="card-base card-hover p-5 cursor-pointer flex flex-col gap-4 group bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://flagcdn.com/w80/${c.iso}.png`}
                        srcSet={`https://flagcdn.com/w160/${c.iso}.png 2x`}
                        alt={`${c.name} flag`}
                        loading="lazy"
                        className="w-10 h-7 object-cover rounded shadow-sm border border-slate-100 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300"
                      />
                      <div>
                        <h3 className="font-bold text-sm font-grotesk text-theme-text line-clamp-1">
                          {c.name}
                        </h3>
                        <span className="text-xs font-mono text-slate-500">{c.dial}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2.5 group-hover:border-theme-gold group-hover:bg-yellow-50/30 transition-colors">
                      <span className={`text-sm font-mono tracking-wider ${isRolling ? "opacity-40" : ""} ${!num ? "text-slate-400" : "text-theme-text"}`}>
                        {num || "— — ——————"}
                      </span>
                      <button
                        onClick={(e) => handleCopy(e, c.name, num)}
                        disabled={!num}
                        className={`p-1.5 rounded-md transition-colors ${
                          !num ? "opacity-0" : isCopied ? "text-green-500 bg-green-50" : "text-slate-400 hover:text-theme-gold hover:bg-theme-gold/10"
                        }`}
                      >
                        {isCopied ? <CheckCircle size={15} /> : <Copy size={15} />}
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-[9999] bg-theme-text text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 text-sm font-bold font-grotesk"
          >
            <CheckCircle size={15} className="text-theme-gold" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
