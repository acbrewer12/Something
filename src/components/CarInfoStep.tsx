"use client";

import type { CarInfo, PIClass, Drivetrain } from "@/lib/tuner";

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
                  : `${color} opacity-60`
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Drivetrain */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Drivetrain</label>
        <div className="flex gap-2">
          {(["FWD", "RWD", "AWD"] as Drivetrain[]).map((dt) => (
            <button
              key={dt}
              onClick={() => set("drivetrain", dt)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                data.drivetrain === dt
                  ? "bg-cyan-500 text-black"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600"
              }`}
            >
              {dt}
            </button>
          ))}
        </div>
      </div>

      {/* Weight & Power */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Weight</label>
          <div className="relative">
            <input
              type="number" min={800} max={6000} step={10}
              value={data.weight}
              onChange={(e) => set("weight", Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400">lbs</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Power</label>
          <div className="relative">
            <input
              type="number" min={50} max={2000} step={5}
              value={data.power}
              onChange={(e) => set("power", Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-8"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-400">hp</span>
          </div>
        </div>
      </div>

      {/* Front Weight Dist */}
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
          <span>Front heavy (20%)</span>
          <span>Balanced (50%)</span>
          <span>Rear heavy (80%)</span>
        </div>
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
