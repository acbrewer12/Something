"use client";

import { useState } from "react";
import TunerForm from "@/components/TunerForm";
import ResultsPanel from "@/components/ResultsPanel";
import SavedTunes from "@/components/SavedTunes";
import type { TuneResult, CarStats } from "@/lib/tuner";

export default function Home() {
  const [results, setResults] = useState<TuneResult | null>(null);
  const [currentDrivetrain, setCurrentDrivetrain] = useState("RWD");
  const [hasDiff, setHasDiff] = useState(true);
  const [hasAero, setHasAero] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"tuner" | "saved">("tuner");
  const [savedKey, setSavedKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCalculate(data: CarStats & { name: string; carName: string }) {
    setLoading(true);
    try {
      const res = await fetch("/api/tunes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const { results: r } = await res.json();
      setResults(r);
      setCurrentDrivetrain(data.drivetrain);
      setHasDiff(data.parts.differential !== "stock");
      setHasAero(data.parts.aero !== "none");
      setSavedKey((k) => k + 1);
      showToast("Tune calculated and saved!");
    } finally {
      setLoading(false);
    }
  }

  function handleLoadTune(tune: { results: TuneResult; drivetrain: string }) {
    setResults(tune.results);
    setCurrentDrivetrain(tune.drivetrain);
    setActiveTab("tuner");
    showToast("Tune loaded!");
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-cyan-500 text-black font-semibold text-sm px-4 py-2 rounded-xl shadow-lg animate-in fade-in">
          {toast}
        </div>
      )}

      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-black text-black text-sm">
              FH6
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">QuickTune Pro</h1>
              <p className="text-xs text-slate-400">Forza Horizon 6 Tune Calculator</p>
            </div>
          </div>
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {(["tuner", "saved"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-cyan-500 text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === "saved" ? "Saved Tunes" : "Tuner"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "tuner" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <TunerForm onCalculate={handleCalculate} loading={loading} />
            </div>
            <div>
              {results ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Recommended Tune</h2>
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Auto-saved</span>
                  </div>
                  <ResultsPanel
                    results={results}
                    drivetrain={currentDrivetrain}
                    hasDiff={hasDiff}
                    hasAero={hasAero}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center min-h-[400px] border border-slate-700 border-dashed rounded-2xl">
                  <div className="text-center space-y-3 px-8">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-slate-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-300 text-sm font-medium">Your tune will appear here</p>
                      <p className="text-slate-500 text-xs mt-1">Fill in your car stats and click Calculate Tune</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold mb-4">Saved Tunes</h2>
            <SavedTunes onLoad={handleLoadTune} refreshKey={savedKey} />
          </div>
        )}
      </main>
    </div>
  );
}
