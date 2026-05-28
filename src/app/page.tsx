"use client";

import { useState, useEffect } from "react";
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

// ── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_CAR: CarInfo = {
  name: "", piClass: "A", weight: 3200, power: 450, torque: 380,
  drivetrain: "RWD", engineLocation: "front", frontDist: 50,
  gearCount: 6, balance: "neutral", units: "imperial",
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

// ── URL hash encode/decode ───────────────────────────────────────────────────

function encodeHash(car: CarInfo, upgrades: Upgrades, ctx: TuneContext): string {
  const p = new URLSearchParams({
    dt: car.drivetrain, el: car.engineLocation,
    hp: String(car.power), tq: String(car.torque),
    wt: String(car.weight), fw: String(car.frontDist),
    gc: String(car.gearCount), pi: car.piClass.toLowerCase(),
    bal: car.balance, u: car.units === "imperial" ? "imp" : "met",
    asp: upgrades.aspiration, eng: upgrades.engineSwap, exh: upgrades.exhaust,
    trn: upgrades.transmission, clu: upgrades.clutch, drv: upgrades.driveline,
    diff: upgrades.differential, brk: upgrades.brakes, spr: upgrades.springs,
    dam: upgrades.dampers, arb: upgrades.arb, cage: upgrades.rollCage,
    tc: upgrades.tireCompound, tf: upgrades.tireWidthFront, tr: upgrades.tireWidthRear,
    aef: upgrades.aeroFront, aer: upgrades.aeroRear,
    fd: String(upgrades.frontDownforce), rd: String(upgrades.rearDownforce),
    tg: ctx.tuneType, ev: ctx.eventType, sea: ctx.season, wea: ctx.weather,
    ...(car.name ? { car: car.name } : {}),
  });
  return p.toString();
}

function decodeHash(raw: string): { car: CarInfo; upgrades: Upgrades; ctx: TuneContext } | null {
  try {
    const p = new URLSearchParams(raw.replace(/^#/, ""));
    const g = (k: string, fallback: string) => p.get(k) ?? fallback;
    const n = (k: string, fallback: number) => Number(p.get(k) ?? fallback);
    const piRaw = g("pi", "a").toUpperCase();
    const piClass = (["D","C","B","A","S1","S2","X"].includes(piRaw) ? piRaw : "A") as CarInfo["piClass"];
    return {
      car: {
        name: g("car", ""),
        piClass,
        weight: n("wt", 3200), power: n("hp", 450), torque: n("tq", 380),
        drivetrain: (g("dt", "RWD") as CarInfo["drivetrain"]),
        engineLocation: (g("el", "front") as CarInfo["engineLocation"]),
        frontDist: n("fw", 50), gearCount: n("gc", 6),
        balance: (g("bal", "neutral") as CarInfo["balance"]),
        units: g("u", "imp") === "imp" ? "imperial" : "metric",
      },
      upgrades: {
        aspiration: (g("asp", "stock") as Upgrades["aspiration"]),
        engineSwap: (g("eng", "stock") as Upgrades["engineSwap"]),
        exhaust: (g("exh", "race") as Upgrades["exhaust"]),
        transmission: (g("trn", "race") as Upgrades["transmission"]),
        clutch: (g("clu", "race") as Upgrades["clutch"]),
        driveline: (g("drv", "race") as Upgrades["driveline"]),
        differential: (g("diff", "race") as Upgrades["differential"]),
        brakes: (g("brk", "race") as Upgrades["brakes"]),
        springs: (g("spr", "race") as Upgrades["springs"]),
        dampers: (g("dam", "race") as Upgrades["dampers"]),
        arb: (g("arb", "race") as Upgrades["arb"]),
        rollCage: (g("cage", "none") as Upgrades["rollCage"]),
        tireCompound: (g("tc", "race") as Upgrades["tireCompound"]),
        tireWidthFront: (g("tf", "stock") as Upgrades["tireWidthFront"]),
        tireWidthRear: (g("tr", "stock") as Upgrades["tireWidthRear"]),
        aeroFront: (g("aef", "none") as Upgrades["aeroFront"]),
        aeroRear: (g("aer", "none") as Upgrades["aeroRear"]),
        frontDownforce: n("fd", 50), rearDownforce: n("rd", 70),
      },
      ctx: {
        tuneType: (g("tg", "road") as TuneContext["tuneType"]),
        eventType: (g("ev", "circuit") as TuneContext["eventType"]),
        season: (g("sea", "summer") as TuneContext["season"]),
        weather: (g("wea", "dry") as TuneContext["weather"]),
      },
    };
  } catch {
    return null;
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [step, setStep]           = useState(1);
  const [car, setCar]             = useState<CarInfo>(DEFAULT_CAR);
  const [upgrades, setUpgrades]   = useState<Upgrades>(DEFAULT_UPGRADES);
  const [context, setContext]     = useState<TuneContext>(DEFAULT_CONTEXT);
  const [results, setResults]     = useState<TuneResult | null>(null);
  const [ratings, setRatings]     = useState<PerformanceRatings | null>(null);
  const [warnings, setWarnings]   = useState<Warning[]>([]);
  const [loading, setLoading]     = useState(false);
  const [saved, setSaved]         = useState(false);
  const [savedKey, setSavedKey]   = useState(0);
  const [activeTab, setActiveTab] = useState<"tuner" | "saved">("tuner");
  const [toast, setToast]         = useState<string | null>(null);

  // Parse hash on mount to support shared links
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const decoded = decodeHash(hash);
    if (!decoded) return;
    setCar(decoded.car);
    setUpgrades(decoded.upgrades);
    setContext(decoded.ctx);
    // Auto-calculate
    const r  = calculateTune(decoded.car, decoded.upgrades, decoded.ctx);
    const rt = getPerformanceRatings(decoded.car, decoded.upgrades, decoded.ctx);
    const w  = getBuildWarnings(decoded.car, decoded.upgrades, decoded.ctx);
    setResults(r); setRatings(rt); setWarnings(w);
    setStep(4);
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleCalculate() {
    setLoading(true);
    try {
      const r  = calculateTune(car, upgrades, context);
      const rt = getPerformanceRatings(car, upgrades, context);
      const w  = getBuildWarnings(car, upgrades, context);
      setResults(r); setRatings(rt); setWarnings(w);
      setSaved(false);
      setStep(4);
      // Write shareable hash
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "#" + encodeHash(car, upgrades, context));
      }
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

  function handleShare() {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    showToast("Link copied!");
  }

  const completedSteps = Array.from({ length: step - 1 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-cyan-500 text-black font-semibold text-sm px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-black text-black text-xs">QT</div>
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

            {step === 1 && <CarInfoStep data={car} onChange={setCar} onNext={() => setStep(2)} />}
            {step === 2 && <UpgradesStep data={upgrades} onChange={setUpgrades} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
            {step === 3 && <TuneSetupStep data={context} onChange={setContext} onBack={() => setStep(2)} onCalculate={handleCalculate} loading={loading} />}
            {step === 4 && results && ratings && (
              <ResultsStep
                results={results} ratings={ratings} warnings={warnings}
                drivetrain={car.drivetrain} units={car.units}
                hasDiff={upgrades.differential !== "stock"}
                onBack={() => setStep(3)} onSave={handleSave} onShare={handleShare} saved={saved}
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
                const c2 = { ...DEFAULT_CAR, drivetrain: tune.drivetrain as CarInfo["drivetrain"] };
                setCar(c2);
                setRatings(getPerformanceRatings(c2, DEFAULT_UPGRADES, DEFAULT_CONTEXT));
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
