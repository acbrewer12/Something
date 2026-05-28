"use client";

import type { CarInfo, PIClass, Drivetrain, EngineLocation, Balance, Units } from "@/lib/tuner";

interface Props {
  data: CarInfo;
  onChange: (data: CarInfo) => void;
  onNext: () => void;
}

const PI_CLASSES: { value: PIClass; color: string }[] = [
  { value: "D",  color: "bg-gray-600 hover:bg-gray-500" },
  { value: "C",  color: "bg-blue-700 hover:bg-blue-600" },
  { value: "B",  color: "bg-green-700 hover:bg-green-600" },
  { value: "A",  color: "bg-yellow-600 hover:bg-yellow-500" },
  { value: "S1", color: "bg-orange-600 hover:bg-orange-500" },
  { value: "S2", color: "bg-red-600 hover:bg-red-500" },
  { value: "X",  color: "bg-purple-600 hover:bg-purple-500" },
];

function NumInput({
  label, value, onChange, min, max, step = 1, unit,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10"
        />
        {unit && <span className="absolute right-3 top-2.5 text-xs text-slate-400">{unit}</span>}
      </div>
    </div>
  );
}

function ChipGroup<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: { value: T; label: string; color?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              value === o.value
                ? o.color ?? "bg-cyan-500 text-black"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CarInfoStep({ data, onChange, onNext }: Props) {
  const set = <K extends keyof CarInfo>(key: K, val: CarInfo[K]) =>
    onChange({ ...data, [key]: val });

  const canContinue = data.name.trim().length > 0 && data.weight > 0 && data.power > 0;

  return (
    <div className="space-y-5">
      {/* Car Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Car Name</label>
        <input
          value={data.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="e.g. Lamborghini Huracán EVO"
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* PI Class */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">PI Class</label>
        <div className="flex gap-2 flex-wrap">
          {PI_CLASSES.map(({ value, color }) => (
            <button
              key={value}
              onClick={() => set("piClass", value)}
              className={`w-10 h-10 rounded-lg font-black text-sm text-white transition-all ${
                data.piClass === value
                  ? `${color} ring-2 ring-white ring-offset-2 ring-offset-slate-900`
                  : `${color} opacity-50`
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Drivetrain + Engine Location */}
      <div className="grid grid-cols-2 gap-3">
        <ChipGroup<Drivetrain>
          label="Drivetrain"
          value={data.drivetrain}
          onChange={(v) => set("drivetrain", v)}
          options={[
            { value: "FWD", label: "FWD" },
            { value: "RWD", label: "RWD" },
            { value: "AWD", label: "AWD" },
          ]}
        />
        <ChipGroup<EngineLocation>
          label="Engine Location"
          value={data.engineLocation}
          onChange={(v) => set("engineLocation", v)}
          options={[
            { value: "front", label: "Front" },
            { value: "mid",   label: "Mid" },
            { value: "rear",  label: "Rear" },
          ]}
        />
      </div>

      {/* Weight, Power, Torque */}
      <div className="grid grid-cols-3 gap-3">
        <NumInput label="Weight" value={data.weight} onChange={(v) => set("weight", v)} min={800} max={6000} step={10} unit="lbs" />
        <NumInput label="Power"  value={data.power}  onChange={(v) => set("power",  v)} min={50}  max={2000} step={5}  unit="hp"  />
        <NumInput label="Torque" value={data.torque} onChange={(v) => set("torque", v)} min={30}  max={2000} step={5}  unit="lb·ft" />
      </div>

      {/* Weight distribution */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
          Weight Distribution —{" "}
          <span className="text-white">Front {data.frontDist}% / Rear {100 - data.frontDist}%</span>
        </label>
        <input
          type="range" min={20} max={80} value={data.frontDist}
          onChange={(e) => set("frontDist", Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
          <span>Front heavy</span><span>Balanced</span><span>Rear heavy</span>
        </div>
      </div>

      {/* Gear Count */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">
          Gears — <span className="text-white">{data.gearCount}-speed</span>
        </label>
        <input
          type="range" min={3} max={10} step={1} value={data.gearCount}
          onChange={(e) => set("gearCount", Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
          <span>3</span><span>6</span><span>10</span>
        </div>
      </div>

      {/* Balance + Units */}
      <div className="grid grid-cols-2 gap-3">
        <ChipGroup<Balance>
          label="Handling Balance"
          value={data.balance}
          onChange={(v) => set("balance", v)}
          options={[
            { value: "understeer", label: "US" },
            { value: "neutral",    label: "Neutral" },
            { value: "oversteer",  label: "OS" },
          ]}
        />
        <ChipGroup<Units>
          label="Units"
          value={data.units}
          onChange={(v) => set("units", v)}
          options={[
            { value: "imperial", label: "Imperial" },
            { value: "metric",   label: "Metric" },
          ]}
        />
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl text-sm uppercase tracking-widest transition-colors"
      >
        Next — Build
      </button>
    </div>
  );
}
