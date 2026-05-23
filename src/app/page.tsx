"use client";

import { useState } from "react";
import StepIndicator from "@/components/StepIndicator";
import CarInfoStep from "@/components/CarInfoStep";
import UpgradesStep from "@/components/UpgradesStep";
import TuneSetupStep from "@/components/TuneSetupStep";
import ResultsStep from "@/components/ResultsStep";
import SavedTunes from "@/components/SavedTunes";
import { calculateTune } from "@/lib/tuner";
import { getBuildWarnings } from "@/lib/warnings";
import { getPerformanceRatings } from "@/lib/ratings";
import type { CarInfo, Upgrades, TuneContext, TuneResult } from "@/lib/tuner";
import type { PerformanceRatings } from "@/lib/ratings";
import type { Warning } from "@/lib/warnings";

const DEFAULT_CAR: CarInfo = {
  name: "", piClass: "A", weight: 3200, power: 450, drivetrain: "RWD", frontDist: 50,
};

const DEFAULT_UPGRADES: Upgrades = {
  aspiration: "stock", engineSwap: "stock", exhaust: "race",
  transmission: "race", clutch: "race", driveline: "race", differential: "race",
  brakes: "race", springs: "race", dampers: "race", arb: "race", rollCage: "none",
  tireCompound: "race", tireWidthFront: "stock", tireWidthRear: "stock",
  aeroFront: "none", aeroRear: "none", frontDownforce: 50, rearDownforce: 70,
};

const DEFAULT_CONTEXT: TuneContext = {
  tuneType: "road", season: "summer", weather: "dry", eventType: "circuit",
};

export default function Home() {
  const [step, setStep]       = useState(1);
  const [car, setCar]         = useState<CarInfo>(DEFAULT_CAR);
  const [upgrades, setUpgrades] = useState<Upgrades>(DEFAULT_UPGRADES);
  const [context, setContext] = useState<TuneContext>(DEFAULT_CONTEXT);

  const [results, setResults]   = useState<TuneResult | null>(null);
  const [ratings, setRatings]   = useState<PerformanceRatings | null>(null);
  const [warnings, setWarnings] = useState<Warning[]>([]);

  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const [savedKey, setSavedKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"tuner" | "saved">("tuner");
  const [toast, setToast]       = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCalculate() {
    setLoading(true);
    try {
      // Compute locally for instant display
      const r = calculateTune(car, upgrades, context);
      const rt = getPerformanceRatings(car, upgrades, context);
      const w = getBuildWarnings(car, upgrades, context);
      setResults(r);
      setRatings(rt);
      setWarnings(w);
      setSaved(false);
      setStep(4);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!results) return;
    try {
      await fetch("/api/tunes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: car.name || "Untitled Tune", car, upgrades, context }),
      });
      setSaved(true);
      setSavedKey((k) => k + 1);
      showToast("Tune saved!");
    } catch {
      showToast("Failed to save.");
    }
  }

  const completedSteps = Array.from({ length: step - 1 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-cyan-500 text-black font-semibold text-sm px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-black text-black text-xs leading-none">
              QT
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-white">QuickTune Pro</h1>
                <span className="text-[10px] bg-cyan-500 text-black font-bold px-1.5 py-0.5 rounded">FH6</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">Forza Horizon 6</p>
            </div>
          </div>
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {(["tuner", "saved"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab ? "bg-cyan-500 text-black" : "text-slate-400 hover:text-white"
                }`}
              >
                {tab === "saved" ? "Saved" : "Tuner"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === "tuner" ? (
          <>
            <StepIndicator currentStep={step} completedSteps={completedSteps} />

            {step === 1 && (
              <CarInfoStep
                data={car}
                onChange={setCar}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <UpgradesStep
                data={upgrades}
                onChange={setUpgrades}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <TuneSetupStep
                data={context}
                onChange={setContext}
                onBack={() => setStep(2)}
                onCalculate={handleCalculate}
                loading={loading}
              />
            )}
            {step === 4 && results && ratings && (
              <ResultsStep
                results={results}
                ratings={ratings}
                warnings={warnings}
                drivetrain={car.drivetrain}
                hasDiff={upgrades.differential !== "stock"}
                onBack={() => setStep(3)}
                onSave={handleSave}
                saved={saved}
              />
            )}
          </>
        ) : (
          <>
            <h2 className="text-base font-bold mb-4">Saved Tunes</h2>
            <SavedTunes
              refreshKey={savedKey}
              onLoad={(tune) => {
                setResults(tune.results);
                const car2 = { ...DEFAULT_CAR, drivetrain: tune.drivetrain as CarInfo["drivetrain"] };
                setCar(car2);
                const r = getPerformanceRatings(car2, DEFAULT_UPGRADES, DEFAULT_CONTEXT);
                setRatings(r);
                setWarnings([]);
                setSaved(true);
                setStep(4);
                setActiveTab("tuner");
                showToast("Tune loaded!");
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}
