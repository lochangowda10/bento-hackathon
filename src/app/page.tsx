"use client";

import React, { useEffect, useState, useRef } from "react";
import { fetchLiveMarkets, placeBentoPrediction, BentoMarket } from "@/lib/bento";
import { getAnakinMarketAnalysis, AnakinAnalysis } from "@/lib/anakin";
import { Activity, TrendingUp, Zap, ChevronRight, Terminal, DollarSign, Database, Loader2, PlayCircle, Lock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BentoPulseDashboard() {
  const [markets, setMarkets] = useState<BentoMarket[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<BentoMarket | null>(null);
  
  const [analysis, setAnalysis] = useState<AnakinAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [stake, setStake] = useState<string>("50");
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [txResult, setTxResult] = useState<{ success: boolean; message: string } | null>(null);

  // Initial Data Load
  useEffect(() => {
    async function load() {
      const data = await fetchLiveMarkets();
      setMarkets(data);
      if (data.length > 0) handleSelectMarket(data[0]);
    }
    load();
  }, []);

  const handleSelectMarket = async (market: BentoMarket) => {
    setSelectedMarket(market);
    setSelectedOption(null);
    setTxResult(null);
    
    // Trigger Anakin AI Analysis
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
      // Execute the SDK Call
      const res = await placeBentoPrediction(selectedMarket.id, selectedOption, parseFloat(stake));
      setTxResult({ success: true, message: res?.message || "Prediction Executed" });
    } catch (err: any) {
      setTxResult({ success: false, message: err.message || "Failed to execute" });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#e0e0e0] font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-[#222] bg-[#0d0d12]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">BENTO<span className="text-emerald-400">PULSE</span></h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Institutional Prediction Terminal</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#15151a] rounded border border-[#222]">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-gray-400">NODE:</span>
            <span className="text-green-400">SYNCED</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#15151a] rounded border border-[#222]">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-gray-400">ANAKIN:</span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/20 transition-all">
            <Lock className="w-3.5 h-3.5" />
            WALLET CONNECTED
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="p-6 h-[calc(100vh-73px)] grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* LEFT PANEL: Live Markets */}
        <section className="col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              Live Markets
            </h2>
            <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{markets.length} ACTIVE</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {markets.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectMarket(m)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden",
                  selectedMarket?.id === m.id 
                    ? "bg-[#15151a] border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                    : "bg-[#111] border-[#222] hover:border-[#333] hover:bg-[#131318]"
                )}
              >
                {selectedMarket?.id === m.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                )}
                <div className="flex justify-between items-start mb-2">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded uppercase font-mono tracking-widest",
                    m.status === 'LIVE' ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-800 text-gray-400"
                  )}>{m.status}</span>
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
        </section>

        {/* MIDDLE PANEL: Anakin Data Feed */}
        <section className="col-span-5 flex flex-col gap-4 h-full overflow-hidden bg-[#0d0d12] rounded-2xl border border-[#222] p-6 relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-4 z-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Anakin AI Edge
            </h2>
            {isAnalyzing && (
              <span className="text-xs font-mono text-blue-400 flex items-center gap-2 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                ANALYZING...
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar z-10 pr-2">
            {!selectedMarket ? (
              <div className="flex-1 flex items-center justify-center text-gray-600 font-mono text-xs">
                AWAITING MARKET SELECTION...
              </div>
            ) : isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full border-2 border-[#222] border-t-blue-500 animate-spin"></div>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Scraping web data & sentiment...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Confidence Score Gauge */}
                <div className="flex items-center gap-6 p-6 rounded-xl bg-[#131318] border border-[#222]">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#222]"
                        strokeWidth="3"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="100, 100"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={analysis.confidenceScore > 60 ? "text-emerald-500" : analysis.confidenceScore < 40 ? "text-rose-500" : "text-amber-500"}
                        strokeWidth="3"
                        strokeDasharray={`${analysis.confidenceScore}, 100`}
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-xl font-bold font-mono text-white">
                      {analysis.confidenceScore}%
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-mono text-gray-500 mb-1 uppercase tracking-widest">AI Edge Score</h4>
                    <p className="text-lg text-white font-medium">{analysis.confidenceScore > 60 ? "High Conviction" : "Low Conviction"}</p>
                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">{analysis.sentimentSummary}</p>
                  </div>
                </div>

                {/* News Feed */}
                <div>
                  <h4 className="text-xs font-mono text-gray-500 mb-3 uppercase tracking-widest">Real-time Catalysts</h4>
                  <div className="space-y-3">
                    {analysis.recentNews.map((news, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-[#111] border border-[#1a1a1a] hover:border-[#333] transition-colors">
                        <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-gray-300">{news}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* RIGHT PANEL: Execution */}
        <section className="col-span-4 flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              Execution Slip
            </h2>
          </div>

          <div className="flex-1 bg-[#111] border border-[#222] rounded-2xl p-6 flex flex-col relative overflow-hidden">
            {!selectedMarket ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 font-mono text-xs gap-3">
                <Lock className="w-6 h-6 opacity-50" />
                SELECT A MARKET TO TRADE
              </div>
            ) : (
              <div className="flex-1 flex flex-col animate-in fade-in duration-300 z-10">
                <div className="mb-6">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block mb-2">Target Market</span>
                  <h3 className="text-white text-lg font-medium leading-tight">{selectedMarket.title}</h3>
                </div>

                <div className="space-y-4 mb-8">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block">Position Direction</span>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedMarket.options.map((opt) => (
                      <button
                        key={opt.index}
                        onClick={() => setSelectedOption(opt.index)}
                        className={cn(
                          "py-3 rounded-xl border text-sm font-bold tracking-wider transition-all",
                          selectedOption === opt.index
                            ? opt.label.toUpperCase() === 'YES' || opt.index === 0
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                              : "bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                            : "bg-[#15151a] border-[#333] text-gray-400 hover:bg-[#1a1a22] hover:border-[#444]"
                        )}
                      >
                        {opt.label.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mb-auto">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest block">Stake (Credits/USDC)</span>
                    <span className="text-[10px] font-mono text-gray-600 block">Balance: 1,000.00</span>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      value={stake}
                      onChange={(e) => setStake(e.target.value)}
                      className="w-full bg-[#15151a] border border-[#333] rounded-xl py-3 pl-10 pr-4 text-white font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Status / Errors */}
                {txResult && (
                  <div className={cn(
                    "mt-4 p-4 rounded-xl border text-sm font-mono flex items-start gap-3",
                    txResult.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  )}>
                    {txResult.success ? <Zap className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                    <p className="break-words leading-relaxed">{txResult.message}</p>
                  </div>
                )}

                {/* Execute Button */}
                <button
                  onClick={handleExecute}
                  disabled={isExecuting || selectedOption === null || !stake}
                  className="mt-6 w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-200"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      EXECUTING...
                    </>
                  ) : (
                    <>
                      SUBMIT PREDICTION
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                  {/* Subtle neon glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}} />
    </div>
  );
}
