"use client";

import { useState } from "react";
import type {
  Upgrades,
  Aspiration,
  EngineSwap,
  ExhaustUpgrade,
  TransmissionUpgrade,
  ClutchUpgrade,
  DrivelineUpgrade,
  DiffUpgrade,
  BrakeUpgrade,
  SpringUpgrade,
  DamperUpgrade,
  ARBUpgrade,
  RollCage,
  TireCompound,
  TireWidth,
  AeroUpgrade,
} from "@/lib/tuner";

interface Props {
  data: Upgrades;
  onChange: (data: Upgrades) => void;
  onBack: () => void;
  onNext: () => void;
}

// ── UpgradeChips sub-component ─────────────────────────────────────────────

function UpgradeChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            value === opt.value
              ? "bg-cyan-500 text-black"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Collapsible Section ────────────────────────────────────────────────────

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">{title}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-700/50">
          {children}
        </div>
      )}
    </div>
  );
}

function UpgradeRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="pt-3">
      <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
      <UpgradeChips options={options} value={value} onChange={onChange} />
    </div>
  );
}

// ── Option arrays ──────────────────────────────────────────────────────────

const ASPIRATION_OPTS: { value: Aspiration; label: string }[] = [
  { value: "stock",             label: "Stock" },
  { value: "turbo",             label: "Turbo" },
  { value: "twin-turbo",        label: "Twin Turbo" },
  { value: "supercharger",      label: "Supercharger" },
  { value: "twin-supercharger", label: "Twin Super" },
];

const ENGINE_SWAP_OPTS: { value: EngineSwap; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "sport", label: "Sport" },
  { value: "race",  label: "Race" },
  { value: "elite", label: "Elite" },
];

const EXHAUST_OPTS: { value: ExhaustUpgrade; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "sport", label: "Sport" },
  { value: "race",  label: "Race" },
];

const TRANS_OPTS: { value: TransmissionUpgrade; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "sport", label: "Sport" },
  { value: "race",  label: "Race" },
  { value: "drift", label: "Drift" },
  { value: "drag",  label: "Drag" },
];

const CLUTCH_OPTS: { value: ClutchUpgrade; label: string }[] = [
  { value: "stock",        label: "Stock" },
  { value: "sport",        label: "Sport" },
  { value: "race",         label: "Race" },
  { value: "twin-plate",   label: "Twin Plate" },
  { value: "triple-plate", label: "Triple Plate" },
];

const DRIVELINE_OPTS: { value: DrivelineUpgrade; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "sport", label: "Sport" },
  { value: "race",  label: "Race" },
];

const DIFF_OPTS: { value: DiffUpgrade; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "sport", label: "Sport" },
  { value: "race",  label: "Race" },
  { value: "drift", label: "Drift" },
  { value: "rally", label: "Rally" },
];

const BRAKE_OPTS: { value: BrakeUpgrade; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "sport", label: "Sport" },
  { value: "race",  label: "Race" },
];

const SPRING_OPTS: { value: SpringUpgrade; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "sport", label: "Sport" },
  { value: "race",  label: "Race" },
  { value: "rally", label: "Rally" },
  { value: "drift", label: "Drift" },
];

const DAMPER_OPTS: { value: DamperUpgrade; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "sport", label: "Sport" },
  { value: "race",  label: "Race" },
];

const ARB_OPTS: { value: ARBUpgrade; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "sport", label: "Sport" },
  { value: "race",  label: "Race" },
];

const ROLL_CAGE_OPTS: { value: RollCage; label: string }[] = [
  { value: "none",   label: "None" },
  { value: "street", label: "Street" },
  { value: "race",   label: "Race" },
];

const TIRE_COMPOUND_OPTS: { value: TireCompound; label: string }[] = [
  { value: "stock",     label: "Stock" },
  { value: "sport",     label: "Sport" },
  { value: "race",      label: "Race" },
  { value: "semi-slick", label: "Semi-Slick" },
  { value: "slick",     label: "Slick" },
  { value: "rally",     label: "Rally" },
  { value: "offroad",   label: "Off-Road" },
];

const TIRE_WIDTH_OPTS: { value: TireWidth; label: string }[] = [
  { value: "stock",      label: "Stock" },
  { value: "narrow",     label: "Narrow" },
  { value: "wide",       label: "Wide" },
  { value: "extra-wide", label: "Extra Wide" },
];

const AERO_OPTS: { value: AeroUpgrade; label: string }[] = [
  { value: "none",   label: "None" },
  { value: "street", label: "Street" },
  { value: "race",   label: "Race" },
];

// ── Main Component ─────────────────────────────────────────────────────────

export default function UpgradesStep({ data, onChange, onBack, onNext }: Props) {
  const set = <K extends keyof Upgrades>(key: K, val: Upgrades[K]) =>
    onChange({ ...data, [key]: val });

  const showDownforce = data.aeroFront !== "none" || data.aeroRear !== "none";

  return (
    <div className="space-y-3">
      {/* Engine */}
      <Section title="Engine" defaultOpen={true}>
        <UpgradeRow label="Engine Swap"  options={ENGINE_SWAP_OPTS} value={data.engineSwap}  onChange={(v) => set("engineSwap", v)} />
        <UpgradeRow label="Aspiration"   options={ASPIRATION_OPTS}  value={data.aspiration}  onChange={(v) => set("aspiration", v)} />
        <UpgradeRow label="Exhaust"      options={EXHAUST_OPTS}     value={data.exhaust}     onChange={(v) => set("exhaust", v)} />
      </Section>

      {/* Drivetrain */}
      <Section title="Drivetrain" defaultOpen={true}>
        <UpgradeRow label="Transmission" options={TRANS_OPTS}    value={data.transmission} onChange={(v) => set("transmission", v)} />
        <UpgradeRow label="Clutch"        options={CLUTCH_OPTS}   value={data.clutch}       onChange={(v) => set("clutch", v)} />
        <UpgradeRow label="Driveline"     options={DRIVELINE_OPTS} value={data.driveline}   onChange={(v) => set("driveline", v)} />
        <UpgradeRow label="Differential"  options={DIFF_OPTS}    value={data.differential}  onChange={(v) => set("differential", v)} />
      </Section>

      {/* Handling */}
      <Section title="Handling" defaultOpen={true}>
        <UpgradeRow label="Brakes"         options={BRAKE_OPTS}     value={data.brakes}  onChange={(v) => set("brakes", v)} />
        <UpgradeRow label="Springs"        options={SPRING_OPTS}    value={data.springs} onChange={(v) => set("springs", v)} />
        <UpgradeRow label="Dampers"        options={DAMPER_OPTS}    value={data.dampers} onChange={(v) => set("dampers", v)} />
        <UpgradeRow label="Anti-Roll Bars" options={ARB_OPTS}       value={data.arb}     onChange={(v) => set("arb", v)} />
        <UpgradeRow label="Roll Cage"      options={ROLL_CAGE_OPTS} value={data.rollCage} onChange={(v) => set("rollCage", v)} />
      </Section>

      {/* Tires & Wheels */}
      <Section title="Tires & Wheels" defaultOpen={true}>
        <UpgradeRow label="Tire Compound"  options={TIRE_COMPOUND_OPTS} value={data.tireCompound}    onChange={(v) => set("tireCompound", v)} />
        <UpgradeRow label="Front Width"    options={TIRE_WIDTH_OPTS}    value={data.tireWidthFront}  onChange={(v) => set("tireWidthFront", v)} />
        <UpgradeRow label="Rear Width"     options={TIRE_WIDTH_OPTS}    value={data.tireWidthRear}   onChange={(v) => set("tireWidthRear", v)} />
      </Section>

      {/* Aero */}
      <Section title="Aero" defaultOpen={false}>
        <UpgradeRow label="Front Aero" options={AERO_OPTS} value={data.aeroFront} onChange={(v) => set("aeroFront", v)} />
        <UpgradeRow label="Rear Aero"  options={AERO_OPTS} value={data.aeroRear}  onChange={(v) => set("aeroRear", v)} />

        {showDownforce && (
          <div className="space-y-3 pt-2 border-t border-slate-700/60">
            {data.aeroFront !== "none" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Front Downforce — <span className="text-white">{data.frontDownforce}%</span>
                </label>
                <input
                  type="range" min={0} max={100} value={data.frontDownforce}
                  onChange={(e) => set("frontDownforce", Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            )}
            {data.aeroRear !== "none" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Rear Downforce — <span className="text-white">{data.rearDownforce}%</span>
                </label>
                <input
                  type="range" min={0} max={100} value={data.rearDownforce}
                  onChange={(e) => set("rearDownforce", Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold py-3 rounded-xl text-sm transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl text-sm uppercase tracking-widest transition-colors"
        >
          Next — Setup
        </button>
      </div>
    </div>
  );
}
