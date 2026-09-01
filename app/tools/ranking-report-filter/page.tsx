"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, FileSpreadsheet, Copy, Download, CheckCircle, Filter, Play, Info,
} from "lucide-react";
import Link from "next/link";

const MACRO = `Sub ProcessKeywords()

    Dim ws As Worksheet
    Dim lastRow As Long
    Dim i As Long
    Dim bVal As String
    Dim cVal As String

    Set ws = ActiveSheet
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

    '--------------------------------------------
    ' STEP 1: Column B me Replace karo
    '--------------------------------------------
    For i = 3 To lastRow
        bVal = Trim(CStr(ws.Cells(i, 2).Value))

        Select Case LCase(bVal)
            Case "new keyword", "old keyword"
                ws.Cells(i, 2).Value = "100+"
            Case Else
                ' 0 -> 100+  (CDbl sirf numeric hone par chalao)
                If IsNumeric(bVal) Then
                    If CDbl(bVal) = 0 Then ws.Cells(i, 2).Value = "100+"
                End If
        End Select
    Next i

    '--------------------------------------------
    ' STEP 2: Row Delete karo (Bottom to Top)
    '--------------------------------------------
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

    For i = lastRow To 3 Step -1
        bVal = Trim(CStr(ws.Cells(i, 2).Value))
        cVal = Trim(CStr(ws.Cells(i, 3).Value))

        ' C = 0 -> delete  (sabse pehle, kyunki 0 = rank hi nahi karta)
        If IsNumeric(cVal) Then
            If CDbl(cVal) = 0 Then
                ws.Rows(i).Delete
                GoTo NextRow
            End If
        End If

        ' SPECIAL RULE: B = "100+" AND 0 < C < 100  -> ROW RAKHNI HAI (improved)
        If bVal = "100+" Then
            If IsNumeric(cVal) Then
                If CDbl(cVal) > 0 And CDbl(cVal) < 100 Then GoTo NextRow
            End If
        End If

        ' B aur C dono "100+" -> delete (dono kharab)
        If bVal = "100+" And cVal = "100+" Then
            ws.Rows(i).Delete
            GoTo NextRow
        End If

        ' B aur C dono numeric hain
        If IsNumeric(bVal) And IsNumeric(cVal) Then

            ' Same value -> row rakho
            If CDbl(bVal) = CDbl(cVal) Then GoTo NextRow

            ' B < C (ranking worse hui) -> delete
            If CDbl(bVal) < CDbl(cVal) Then
                ws.Rows(i).Delete
                GoTo NextRow
            End If
        End If

NextRow:
    Next i

    MsgBox "Done! All the raw data has been processed.", vbInformation

End Sub`;

const rules = [
  { keep: false, text: "Current rank (C) = 0 → deleted (not ranking at all)" },
  { keep: false, text: "Both previous (B) & current (C) are 100+ → deleted (still not ranking)" },
  { keep: false, text: "Ranking got worse (B < C, e.g. 5 → 12) → deleted" },
  { keep: true, text: "Was 100+, now inside top 100 → kept (improved)" },
  { keep: true, text: "Ranking improved (B > C, e.g. 12 → 5) → kept" },
  { keep: true, text: "Position unchanged (B = C) → kept" },
];

const steps = [
  { t: "Open the VBA editor", d: "In Excel press Alt + F11 to open the Visual Basic editor." },
  { t: "Insert a module", d: "Menu → Insert → Module, then paste the macro below into it." },
  { t: "Prepare your sheet", d: "Keyword in column A, previous rank in B, current rank in C. Data starts at row 3." },
  { t: "Run it", d: "Press F5 (or Run → Run Sub). The sheet is filtered in place — save a copy first!" },
];

export default function RankingReportFilter() {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(m: string) {
    setToast(m);
    setTimeout(() => setToast(""), 2400);
  }
  function copyMacro() {
    navigator.clipboard.writeText(MACRO);
    setCopied(true);
    showToast("Macro copied");
    setTimeout(() => setCopied(false), 2000);
  }
  function downloadBas() {
    const blob = new Blob([MACRO], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "RankingReportFilter.bas";
    a.click();
    URL.revokeObjectURL(url);
    showToast("RankingReportFilter.bas downloaded");
  }

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-[1200px] w-full mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-theme-muted hover:text-theme-text transition-colors">
          <ArrowLeft size={16} /> Back to ToolVerse
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-gold text-white shadow-md shadow-theme-gold/20">
            <FileSpreadsheet size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-grotesk text-theme-text">Ranking Report Filter</h1>
            <p className="text-sm mt-1 text-theme-muted">Excel/VBA macro that keeps only improved &amp; stable keywords, drops the rest</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
          {/* Left: macro code */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="card-base p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Play size={16} className="text-theme-gold" />
                <h3 className="font-bold font-grotesk text-theme-text">ProcessKeywords macro</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={copyMacro} className={`btn-secondary px-4 py-2 text-sm flex items-center gap-2 ${copied ? "!border-green-500 !text-green-600" : ""}`}>
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />} {copied ? "Copied!" : "Copy"}
                </button>
                <button onClick={downloadBas} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2">
                  <Download size={14} /> .bas
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto rounded-xl bg-[#0f172a] text-slate-100 text-xs leading-relaxed p-4 font-mono max-h-[560px]">
              <code>{MACRO}</code>
            </pre>
          </motion.div>

          {/* Right: how it works + steps */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
            {/* rules */}
            <div className="card-base p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={16} className="text-theme-gold" />
                <h3 className="font-bold font-grotesk text-theme-text">What it filters</h3>
              </div>
              <ul className="space-y-2.5">
                {rules.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-white ${r.keep ? "bg-green-500" : "bg-red-400"}`}>
                      {r.keep ? "✓" : "✕"}
                    </span>
                    <span className="text-sm text-theme-text leading-snug">{r.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* steps */}
            <div className="card-base p-6">
              <div className="flex items-center gap-2 mb-4">
                <Play size={16} className="text-theme-gold" />
                <h3 className="font-bold font-grotesk text-theme-text">How to use in Excel</h3>
              </div>
              <ol className="space-y-3">
                {steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-theme-gold/10 text-theme-gold text-xs font-bold flex items-center justify-center flex-shrink-0 font-grotesk">{i + 1}</span>
                    <div>
                      <div className="text-sm font-semibold text-theme-text font-grotesk">{s.t}</div>
                      <div className="text-xs text-theme-muted leading-snug">{s.d}</div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-theme-gold/5 border border-theme-gold/15 text-xs text-theme-muted leading-relaxed">
                <Info size={13} className="text-theme-gold flex-shrink-0 mt-0.5" />
                The macro edits the active sheet in place and can&rsquo;t be undone — always run it on a copy of your report.
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }} className="toast">
            <CheckCircle size={15} className="text-theme-gold" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
