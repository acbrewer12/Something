"use client";

import { useState } from "react";
import PerformanceGauge from "./PerformanceGauge";
import type { TuneResult, RangeValue, Units } from "@/lib/tuner";
import type { PerformanceRatings } from "@/lib/ratings";
import type { Warning } from "@/lib/warnings";

interface Props {
  results: TuneResult;
  ratings: PerformanceRatings;
  warnings: Warning[];
  drivetrain: string;
  units: Units;
  hasDiff: boolean;
  onBack: () => void;
  onSave: () => void;
  onShare: () => void;
  saved: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtSpring(v: number, units: Units) {
  if (units === "metric") return `${Math.round(v * 0.175)} kgf/mm`;
  return `${v} lb/in`;
}

function fmtPressure(v: number, units: Units) {
  if (units === "metric") return `${Math.round(v * 6.895)} kPa`;
  return `${v} PSI`;
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StatRow({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm font-bold text-white">
        {value}
        {unit && <span className="text-slate-400 font-normal ml-0.5 text-xs">{unit}</span>}
      </span>
    </div>
  );
}

function RangeRow({ label, range, fmt }: { label: string; range: RangeValue; fmt: (v: number) => string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm font-bold">
        <span className="text-cyan-400">{fmt(range.min)}</span>
        <span className="text-slate-500 mx-1 font-normal">–</span>
        <span className="text-cyan-400">{fmt(range.max)}</span>
      </span>
    </div>
  );
}

function ResultSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
      <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${color}`}>{title}</h3>
      {children}
    </div>
  );
}

const WARNING_STYLES: Record<Warning["level"], { icon: string; bg: string; text: string; border: string }> = {
  error: { icon: "🔴", bg: "bg-red-950/50",    text: "text-red-300",    border: "border-red-800/60" },
  warn:  { icon: "🟡", bg: "bg-yellow-950/50", text: "text-yellow-300", border: "border-yellow-800/60" },
  info:  { icon: "🔵", bg: "bg-blue-950/50",   text: "text-blue-300",   border: "border-blue-800/60" },
};

// ── Main ───────────────────────────────────────────────────────────────────

export default function ResultsStep({
  results, ratings, warnings, drivetrain, units, hasDiff,
  onBack, onSave, onShare, saved,
}: Props) {
  const { tires, suspension, diff, brakes, aero } = results;
  const [shareCopied, setShareCopied] = useState(false);

  function handleShare() {
    onShare();
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  }

  const sp = (v: number) => fmtSpring(v, units);
  const pr = (v: number) => fmtPressure(v, units);

  return (
    <div className="space-y-5">
      {/* ── Performance Ratings ── */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Performance</h3>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 ${
              ratings.overall >= 80 ? "border-green-500 text-green-400 bg-green-500/10"
              : ratings.overall >= 60 ? "border-cyan-500 text-cyan-400 bg-cyan-500/10"
              : ratings.overall >= 40 ? "border-yellow-500 text-yellow-400 bg-yellow-500/10"
              : "border-red-500 text-red-400 bg-red-500/10"
            }`}>
              {ratings.overall}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Overall</span>
          </div>
        </div>
        <div className="space-y-2.5">
          <PerformanceGauge label="Top Speed"    value={ratings.topSpeed}     color="bg-blue-500"   icon="🏎️" />
          <PerformanceGauge label="Acceleration" value={ratings.acceleration} color="bg-green-500"  icon="⚡" />
          <PerformanceGauge label="Handling"     value={ratings.handling}     color="bg-cyan-500"   icon="🎯" />
          <PerformanceGauge label="Launch"       value={ratings.launch}       color="bg-orange-500" icon="🚀" />
          <PerformanceGauge label="Braking"      value={ratings.braking}      color="bg-red-500"    icon="🛑" />
        </div>
      </div>

      {/* ── Build Warnings ── */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Build Warnings</h3>
          {warnings.map((w, i) => {
            const style = WARNING_STYLES[w.level];
            return (
              <div key={i} className={`flex gap-2.5 items-start px-3 py-2.5 rounded-lg border ${style.bg} ${style.border}`}>
                <span className="text-sm leading-tight mt-px shrink-0">{style.icon}</span>
                <p className={`text-xs leading-relaxed ${style.text}`}>{w.message}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tires & Alignment ── */}
      <ResultSection title="Tires & Alignment" color="text-yellow-400">
        <div className="grid grid-cols-2 gap-x-6">
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Pressure</p>
            <StatRow label="Front" value={pr(tires.pressureFront)} />
            <StatRow label="Rear"  value={pr(tires.pressureRear)} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Alignment</p>
            <StatRow label="Camber F" value={tires.camberFront} unit="°" />
            <StatRow label="Camber R" value={tires.camberRear}  unit="°" />
            <StatRow label="Toe F"    value={tires.toeFront}    unit="°" />
            <StatRow label="Toe R"    value={tires.toeRear}     unit="°" />
            <StatRow label="Caster"   value={tires.caster}      unit="°" />
          </div>
        </div>
      </ResultSection>

      {/* ── Suspension & ARB ── */}
      <ResultSection title="Suspension & ARB" color="text-green-400">
        <div className="grid grid-cols-2 gap-x-6">
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Springs</p>
            <RangeRow label="Front" range={suspension.springFront} fmt={sp} />
            <RangeRow label="Rear"  range={suspension.springRear}  fmt={sp} />
            <p className="text-xs text-slate-500 font-semibold mb-1 mt-2">Ride Height</p>
            <RangeRow label="Front" range={suspension.rideHeightFront} fmt={(v) => `${v} cm`} />
            <RangeRow label="Rear"  range={suspension.rideHeightRear}  fmt={(v) => `${v} cm`} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Damping</p>
            <StatRow label="Bump F"    value={suspension.bumpFront}    />
            <StatRow label="Bump R"    value={suspension.bumpRear}     />
            <StatRow label="Rebound F" value={suspension.reboundFront} />
            <StatRow label="Rebound R" value={suspension.reboundRear}  />
            <p className="text-xs text-slate-500 font-semibold mb-1 mt-2">Anti-Roll Bars</p>
            <StatRow label="Front" value={suspension.arbFront} />
            <StatRow label="Rear"  value={suspension.arbRear}  />
          </div>
        </div>
      </ResultSection>

      {/* ── Aero ── */}
      {(aero.front || aero.rear) && (
        <ResultSection title="Aero Downforce" color="text-sky-400">
          <p className="text-[10px] text-slate-500 mb-2">Recommended % of slider range</p>
          <div className="grid grid-cols-2 gap-x-6">
            {aero.front && <RangeRow label="Front" range={aero.front} fmt={(v) => `${v}%`} />}
            {aero.rear  && <RangeRow label="Rear"  range={aero.rear}  fmt={(v) => `${v}%`} />}
          </div>
        </ResultSection>
      )}

      {/* ── Differential ── */}
      {hasDiff && (
        <ResultSection title="Differential" color="text-purple-400">
          <div className="grid grid-cols-2 gap-x-6">
            {(drivetrain === "FWD" || drivetrain === "AWD") && (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">Front Diff</p>
                <StatRow label="Accel" value={diff.frontAccel} unit="%" />
                <StatRow label="Decel" value={diff.frontDecel} unit="%" />
              </div>
            )}
            {(drivetrain === "RWD" || drivetrain === "AWD") && (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">Rear Diff</p>
                <StatRow label="Accel" value={diff.rearAccel} unit="%" />
                <StatRow label="Decel" value={diff.rearDecel} unit="%" />
              </div>
            )}
            {drivetrain === "AWD" && (
              <div className="col-span-2 mt-2">
                <p className="text-xs text-slate-500 font-semibold mb-1">Center Balance (front %)</p>
                <StatRow label="Balance" value={diff.centerBalance} unit="%" />
              </div>
            )}
          </div>
        </ResultSection>
      )}

      {/* ── Brakes ── */}
      <ResultSection title="Brakes" color="text-red-400">
        <div className="grid grid-cols-2 gap-x-6">
          <StatRow label="Balance (front)" value={brakes.balance}  unit="%" />
          <StatRow label="Pressure"        value={brakes.pressure} unit="%" />
        </div>
      </ResultSection>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleShare}
          className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold py-3 rounded-xl text-sm transition-colors"
        >
          {shareCopied ? "✓ Copied!" : "🔗 Share"}
        </button>
        <button
          onClick={onBack}
          className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold py-3 rounded-xl text-sm transition-colors"
        >
          Recalculate
        </button>
        <button
          onClick={onSave}
          disabled={saved}
          className={`flex-1 font-bold py-3 rounded-xl text-sm uppercase tracking-widest transition-colors ${
            saved ? "bg-green-700/60 text-green-300 cursor-default" : "bg-cyan-500 hover:bg-cyan-400 text-black"
          }`}
        >
          {saved ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
}
