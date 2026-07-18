"use client";
/* eslint-disable react-hooks/purity */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import React, { useEffect, useState, useRef } from "react";
import { fetchLiveMarkets, placeBentoPrediction, BentoMarket } from "@/lib/bento";
import { getAnakinMarketAnalysis, AnakinAnalysis } from "@/lib/anakin";
import { playExecutionSound } from "@/lib/sound";
import {
  Activity, TrendingUp, Zap, ChevronRight, Terminal as TerminalIcon,
  DollarSign, Loader2, PlayCircle, Crosshair, AlertTriangle,
  Clock, Download, Share2, X, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Terminal Log Lines for Analysis Loading
// ─────────────────────────────────────────────
function useTerminalLines(marketTitle: string, isActive: boolean) {
  const [lines, setLines] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear previous
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
    setTimeout(() => setLines([]), 0);

    if (!isActive || !marketTitle) return;

    const allLines = [
      `> Initializing Anakin web agent...`,
      `> Target: "${marketTitle}"`,
      `> Scanning 14 data sources...`,
      `> Fetched 8 articles (last 24h)`,
      `> Parsing social sentiment...`,
      `> Cross-referencing whale wallets...`,
      `> Aggregating signals...`,
      `> Computing Edge Score...`,
    ];

    allLines.forEach((line, i) => {
      const t = setTimeout(() => {
        setLines((prev) => [...prev, line]);
      }, i * 220);
      timeoutRef.current.push(t);
    });

    return () => {
      timeoutRef.current.forEach(clearTimeout);
    };
  }, [marketTitle, isActive]);

  return lines;
}

// ─────────────────────────────────────────────
// Animated Counter Hook
// ─────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const startTime = performance.now();
    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

// ─────────────────────────────────────────────
// Confetti Burst Component
// ─────────────────────────────────────────────
function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 50 }, (_, i) => {
    const hue = Math.random() * 360;
    const x = (Math.random() - 0.5) * 600;
    const y = -(Math.random() * 400 + 100);
    const r = Math.random() * 360;
    const delay = Math.random() * 0.3;
    const size = Math.random() * 6 + 3;
    return (
      <div
        key={i}
        className="absolute rounded-sm"
        style={{
          width: size,
          height: size,
          backgroundColor: `hsl(${hue}, 80%, 60%)`,
          left: "50%",
          top: "40%",
          animation: `confetti-fall 1.5s ease-out ${delay}s forwards`,
          transform: `translate(0, 0) rotate(0deg)`,
          // @ts-ignore
          "--x": `${x}px`,
          "--y": `${y}px`,
          "--r": `${r}deg`,
        } as React.CSSProperties}
      />
    );
  });
  return <div className="absolute inset-0 pointer-events-none overflow-hidden z-[100]">{particles}</div>;
}

// ─────────────────────────────────────────────
// Prediction Receipt Modal
// ─────────────────────────────────────────────
function PredictionReceipt({
  market,
  optionLabel,
  stake,
  edgeScore,
  onClose,
}: {
  market: BentoMarket;
  optionLabel: string;
  stake: string;
  edgeScore: number;
  onClose: () => void;
}) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const txId = React.useMemo(() => `bento_0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`, []);
  const timestamp = React.useMemo(() => new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC", []);

  const handleCopyReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await import("html2canvas").then((m) => m.default(receiptRef.current!, { backgroundColor: "#0a0a0c", scale: 2 }));
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        }
      });
    } catch {
      // Fallback: copy text
      const text = `⚡ BentoPulse Receipt\n${market.title}\nPosition: ${optionLabel}\nStake: $${stake}\nAI Edge: ${edgeScore}%\n${timestamp}`;
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.3s_ease]" onClick={onClose} />

      <ConfettiBurst active={true} />

      {/* Receipt Card */}
      <div
        ref={receiptRef}
        className="relative z-[91] w-[420px] bg-[#0d0d12] border border-[#333] rounded-2xl overflow-hidden animate-[receiptAppear_0.5s_cubic-bezier(0.16,1,0.3,1)]"
      >
        {/* Glow bar */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-bold tracking-[0.3em] uppercase">BentoPulse Receipt</span>
            </div>
            <div className="w-12 h-px bg-[#333] mx-auto mt-3" />
          </div>

          {/* Market */}
          <div className="text-center">
            <p className="text-white text-lg font-medium leading-snug">&ldquo;{market.title}&rdquo;</p>
          </div>

          {/* Position & Stake */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Position</p>
              <p className={cn(
                "text-xl font-bold tracking-wider",
                optionLabel === "YES" ? "text-emerald-400" : "text-rose-400"
              )}>{optionLabel}</p>
            </div>
            <div className="bg-[#111] rounded-xl p-4 border border-[#222] text-center">
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Stake</p>
              <p className="text-xl font-bold tracking-wider text-white">${stake}</p>
            </div>
          </div>

          {/* AI Edge Score */}
          <div className="bg-[#111] rounded-xl p-4 border border-[#222]">
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-3 text-center">AI Edge Score at Execution</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-[#222] rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    edgeScore > 60 ? "bg-emerald-500" : edgeScore < 40 ? "bg-rose-500" : "bg-amber-500"
                  )}
                  style={{ width: `${edgeScore}%` }}
                />
              </div>
              <span className={cn(
                "text-lg font-bold font-mono",
                edgeScore > 60 ? "text-emerald-400" : edgeScore < 40 ? "text-rose-400" : "text-amber-400"
              )}>{edgeScore}%</span>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2 font-mono">
              {edgeScore > 60 ? "HIGH CONVICTION" : edgeScore < 40 ? "LOW CONVICTION" : "MODERATE CONVICTION"}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-gray-500">
              <span>EXECUTED</span>
              <span className="text-gray-400">{timestamp}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>TX</span>
              <span className="text-gray-400">{txId}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-[#333]" />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-gray-600 font-mono">Powered by BentoPulse × Bento</p>
            <div className="flex gap-2">
              <button
                onClick={handleCopyReceipt}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15151a] border border-[#333] rounded-lg text-xs text-gray-400 hover:text-white hover:border-[#555] transition-all"
              >
                <Download className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={handleCopyReceipt}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/20 transition-all"
              >
                <Share2 className="w-3 h-3" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button onClick={onClose} className="absolute top-6 right-6 z-[92] p-2 text-gray-500 hover:text-white transition-colors">
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Live Clock
// ─────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-gray-300 tabular-nums">{time}</span>;
}

// ═══════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════
export default function BentoPulseDashboard() {
  const [markets, setMarkets] = useState<BentoMarket[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<BentoMarket | null>(null);

  const [analysis, setAnalysis] = useState<AnakinAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [stake, setStake] = useState<string>("50");

  const [isExecuting, setIsExecuting] = useState(false);
  const [txResult, setTxResult] = useState<{ success: boolean; message: string } | null>(null);

  // Receipt
  const [showReceipt, setShowReceipt] = useState(false);

  // Terminal lines
  const terminalLines = useTerminalLines(selectedMarket?.title || "", isAnalyzing);

  // Animated edge score
  const displayedScore = useAnimatedCounter(analysis?.confidenceScore || 0, 1200);

  const handleSelectMarket = async (market: BentoMarket) => {
    setSelectedMarket(market);
    setSelectedOption(null);
    setTxResult(null);
    setShowReceipt(false);

    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const data = await getAnakinMarketAnalysis(market.title);
      setAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecute = async () => {
    if (!selectedMarket || selectedOption === null || !stake) return;

    setIsExecuting(true);
    setTxResult(null);
    try {
      const res = await placeBentoPrediction(selectedMarket.id, selectedOption, parseFloat(stake));
      if (res && res.success) {
        setTxResult({ success: true, message: res.message || "Prediction Executed" });
        playExecutionSound();
        setShowReceipt(true);
      } else {
        setTxResult({ success: false, message: res?.message || "Failed to execute prediction" });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to execute";
      setTxResult({ success: false, message: errMsg });
    } finally {
      setIsExecuting(false);
    }
  };

  // Initial Data Load
  useEffect(() => {
    async function load() {
      const data = await fetchLiveMarkets();
      setMarkets(data);
      if (data.length > 0) handleSelectMarket(data[0]);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (showReceipt) {
        if (e.key === "Escape") setShowReceipt(false);
        return;
      }
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const idx = markets.findIndex((m) => m.id === selectedMarket?.id);
        const next = e.key === "ArrowUp" ? Math.max(0, idx - 1) : Math.min(markets.length - 1, idx + 1);
        if (markets[next]) handleSelectMarket(markets[next]);
      }
      if (e.key === "y" || e.key === "Y") setSelectedOption(0);
      if (e.key === "n" || e.key === "N") setSelectedOption(1);
      if (e.key === "Enter" && selectedOption !== null && stake) handleExecute();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets, selectedMarket, selectedOption, stake, showReceipt]);

  const selectedOptionLabel = selectedOption !== null && selectedMarket
    ? selectedMarket.options[selectedOption]?.label.toUpperCase() || (selectedOption === 0 ? "YES" : "NO")
    : "";

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e0e0e0] font-sans selection:bg-emerald-500/30">

      {/* ═══ RECEIPT MODAL ═══ */}
      {showReceipt && selectedMarket && analysis && (
        <PredictionReceipt
          market={selectedMarket}
          optionLabel={selectedOptionLabel}
          stake={stake}
          edgeScore={analysis.confidenceScore}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {/* ═══ HEADER ═══ */}
      <header className="border-b border-[#222] bg-[#0d0d12]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">BENTO<span className="text-emerald-400">PULSE</span></h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">AI-Powered Prediction Terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#15151a] rounded border border-[#222]">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <LiveClock />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#15151a] rounded border border-[#222]">
            <TerminalIcon className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-gray-400">ANAKIN:</span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
            <Sparkles className="w-3.5 h-3.5" />
            FREE PLAY MODE
          </div>
        </div>
      </header>

      {/* ═══ MAIN GRID ═══ */}
      <main className="p-6 h-[calc(100vh-73px)] grid grid-cols-12 gap-6 overflow-hidden">

        {/* ─── LEFT: LIVE MARKETS ─── */}
        <section className="col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              Live Markets
            </h2>
            <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{markets.length} ACTIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {markets.length === 0 && (
              // Skeleton loading
              <>
                {[1,2,3].map(i => (
                  <div key={i} className="w-full p-4 rounded-xl border border-[#222] bg-[#111] animate-pulse">
                    <div className="flex justify-between mb-3">
                      <div className="h-3 w-12 bg-[#222] rounded" />
                      <div className="h-3 w-20 bg-[#222] rounded" />
                    </div>
                    <div className="h-4 w-full bg-[#222] rounded mb-1" />
                    <div className="h-4 w-2/3 bg-[#222] rounded" />
                  </div>
                ))}
              </>
            )}
            {markets.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectMarket(m)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden hover:-translate-y-0.5",
                  selectedMarket?.id === m.id
                    ? "bg-[#15151a] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                    : "bg-[#111] border-[#222] hover:border-[#333] hover:bg-[#131318] hover:shadow-lg"
                )}
              >
                {selectedMarket?.id === m.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                )}
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded uppercase font-mono tracking-widest flex items-center gap-1.5",
                    m.status === "LIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-800 text-gray-400"
                  )}>
                    {m.status === "LIVE" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    {m.status}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {m.volume} VOL
                  </span>
                </div>
                <h3 className={cn(
                  "text-sm font-medium leading-snug transition-colors",
                  selectedMarket?.id === m.id ? "text-white" : "text-gray-300 group-hover:text-gray-100"
                )}>
                  {m.title}
                </h3>
              </button>
            ))}
          </div>

          {/* Keyboard hints */}
          <div className="flex items-center justify-center gap-3 py-2 border-t border-[#1a1a1a]">
            <span className="text-[9px] font-mono text-gray-600 flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-[#15151a] border border-[#333] rounded text-[8px]">↑↓</kbd> Navigate
            </span>
            <span className="text-[9px] font-mono text-gray-600 flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-[#15151a] border border-[#333] rounded text-[8px]">Y</kbd>/<kbd className="px-1 py-0.5 bg-[#15151a] border border-[#333] rounded text-[8px]">N</kbd> Position
            </span>
            <span className="text-[9px] font-mono text-gray-600 flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-[#15151a] border border-[#333] rounded text-[8px]">↵</kbd> Execute
            </span>
          </div>
        </section>

        {/* ─── MIDDLE: MARKET INTELLIGENCE ─── */}
        <section className="col-span-5 flex flex-col gap-4 h-full overflow-hidden bg-[#0d0d12] rounded-2xl border border-[#222] p-6 relative">
          <div className="absolute inset-0 opacity-[0.015] bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(255,255,255,0.03)_1px,rgba(255,255,255,0.03)_2px)] pointer-events-none rounded-2xl" />

          <div className="flex items-center justify-between mb-2 z-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Market Intelligence
            </h2>
            <span className="text-[10px] font-mono text-gray-600">Powered by Anakin</span>
          </div>

          <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar z-10 pr-2">
            {!selectedMarket ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 font-mono text-xs gap-3">
                <Crosshair className="w-6 h-6 opacity-40 animate-pulse" />
                SELECT A MARKET TO ANALYZE
              </div>
            ) : isAnalyzing ? (
              /* ═══ TERMINAL-STYLE LOADING ═══ */
              <div className="flex-1 flex flex-col p-2">
                <div className="font-mono text-xs space-y-1.5">
                  {terminalLines.map((line, i) => (
                    <div
                      key={i}
                      className="text-gray-400 animate-[fadeSlideIn_0.3s_ease]"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <span className="text-blue-500">{line.slice(0, 1)}</span>
                      <span>{line.slice(1)}</span>
                    </div>
                  ))}
                  {terminalLines.length > 0 && terminalLines.length < 8 && (
                    <span className="inline-block w-2 h-4 bg-emerald-500 animate-[blink_1s_infinite]" />
                  )}
                </div>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                {/* ═══ EDGE SCORE GAUGE ═══ */}
                <div className="flex items-center gap-6 p-6 rounded-xl bg-[#131318] border border-[#222]">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#222]"
                        strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round"
                        strokeDasharray="100, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={cn(
                          "transition-all duration-1000",
                          analysis.confidenceScore > 60 ? "text-emerald-500" : analysis.confidenceScore < 40 ? "text-rose-500" : "text-amber-500"
                        )}
                        strokeWidth="3"
                        strokeDasharray={`${displayedScore}, 100`}
                        stroke="currentColor" fill="none" strokeLinecap="round"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-xl font-bold font-mono text-white tabular-nums">
                      {displayedScore}%
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-mono text-gray-500 mb-1 uppercase tracking-widest">AI Edge Score</h4>
                    <p className="text-lg text-white font-medium">
                      {analysis.confidenceScore > 60 ? "High Conviction" : analysis.confidenceScore < 40 ? "Low Conviction" : "Moderate Conviction"}
                    </p>
                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">{analysis.sentimentSummary}</p>
                  </div>
                </div>

                {/* ═══ CATALYSTS ═══ */}
                <div>
                  <h4 className="text-xs font-mono text-gray-500 mb-3 uppercase tracking-widest">Real-time Catalysts</h4>
                  <div className="space-y-3">
                    {analysis.recentNews.map((news, i) => (
                      <a
                        key={i}
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex gap-3 p-3 rounded-lg bg-[#111] border border-[#1a1a1a] hover:border-blue-500/50 hover:bg-[#131318] transition-all hover:-translate-y-0.5 group/link"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0 group-hover/link:translate-x-0.5 transition-transform" />
                        <p className="text-sm text-gray-300 group-hover/link:text-blue-400 transition-colors">{news.text}</p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* ─── RIGHT: EXECUTE POSITION ─── */}
        <section className="col-span-4 flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              Execute Position
            </h2>
          </div>

          <div className="flex-1 bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col relative overflow-hidden">
            {!selectedMarket ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 font-mono text-xs gap-3">
                <Crosshair className="w-6 h-6 opacity-40 animate-pulse" />
                SELECT A MARKET TO ANALYZE
              </div>
            ) : (
              <div className="flex-1 flex flex-col z-10">
                <div className="mb-6">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-2">Target Market</span>
                  <h3 className="text-white text-lg font-medium leading-tight">{selectedMarket.title}</h3>
                </div>

                {/* Position Direction */}
                <div className="space-y-4 mb-8">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block">Position Direction</span>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedMarket.options.map((opt) => (
                      <button
                        key={opt.index}
                        onClick={() => setSelectedOption(opt.index)}
                        className={cn(
                          "py-3 rounded-xl border text-sm font-bold tracking-wider transition-all duration-200",
                          selectedOption === opt.index
                            ? opt.label.toUpperCase() === "YES" || opt.index === 0
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-[1.02]"
                              : "bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)] scale-[1.02]"
                            : "bg-[#15151a] border-[#333] text-gray-400 hover:bg-[#1a1a22] hover:border-[#444]"
                        )}
                      >
                        {opt.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stake */}
                <div className="space-y-4 mb-auto">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Stake</span>
                    <span className="text-[10px] font-mono text-gray-600">Free Play Credits: 1,000</span>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      className="w-full bg-[#15151a] border border-[#333] rounded-xl py-3 pl-10 pr-4 text-white font-mono tabular-nums focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Error state (only show for errors, success goes to receipt) */}
                {txResult && !txResult.success && (
                  <div className="mt-4 p-4 rounded-xl border text-sm font-mono flex items-start gap-3 bg-rose-500/10 border-rose-500/30 text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="break-words leading-relaxed">{txResult.message}</p>
                  </div>
                )}

                {/* Execute Button */}
                <button
                  onClick={handleExecute}
                  disabled={isExecuting || selectedOption === null || !stake}
                  className={cn(
                    "mt-6 w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 relative overflow-hidden group",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    isExecuting
                      ? "bg-[#222] text-gray-400 cursor-wait"
                      : selectedOption !== null && stake
                        ? "bg-white text-black hover:bg-gray-100 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                        : "bg-white text-black"
                  )}
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      EXECUTING VIA BENTO SDK...
                    </>
                  ) : (
                    <>
                      EXECUTE PREDICTION
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                  {!isExecuting && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ═══ GLOBAL STYLES ═══ */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }

        .tabular-nums { font-variant-numeric: tabular-nums; }

        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes receiptAppear {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes confetti-fall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--x), var(--y)) rotate(var(--r)); opacity: 0; }
        }
      ` }} />
    </div>
  );
}
