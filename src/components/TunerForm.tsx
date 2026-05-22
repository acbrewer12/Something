"use client";

import { useState } from "react";
import type {
  CarStats, Drivetrain, PIClass, TrackType, Style,
  TireCompound, SpringPart, DamperPart, ARBPart, AeroPart, DiffPart,
} from "@/lib/tuner";

const PI_CLASSES: PIClass[] = ["D", "C", "B", "A", "S1", "S2", "X"];
const DRIVETRAINS: Drivetrain[] = ["FWD", "RWD", "AWD"];
const TRACK_TYPES: { value: TrackType; label: string }[] = [
  { value: "road", label: "Road" },
  { value: "dirt", label: "Dirt" },
  { value: "cross-country", label: "Cross-Country" },
  { value: "mixed", label: "Mixed" },
];
const STYLES: { value: Style; label: string }[] = [
  { value: "grip", label: "Grip" },
  { value: "balance", label: "Balance" },
  { value: "drift", label: "Drift" },
];

interface Props {
  onCalculate: (stats: CarStats & { name: string; carName: string }) => void;
  loading: boolean;
}

function Select<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function NumberInput({
  label, value, onChange, min, max, step = 1, unit = "",
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          min={min} max={max} step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 pr-10"
        />
        {unit && (
          <span className="absolute right-3 top-2 text-xs text-slate-400">{unit}</span>
        )}
      </div>
    </div>
  );
}

export default function TunerForm({ onCalculate, loading }: Props) {
  const [tuneName, setTuneName] = useState("My Tune");
  const [carName, setCarName] = useState("");
  const [piClass, setPiClass] = useState<PIClass>("A");
  const [weight, setWeight] = useState(3200);
  const [frontDist, setFrontDist] = useState(50);
  const [power, setPower] = useState(450);
  const [drivetrain, setDrivetrain] = useState<Drivetrain>("RWD");
  const [trackType, setTrackType] = useState<TrackType>("road");
  const [style, setStyle] = useState<Style>("balance");

  const [tireCompound, setTireCompound] = useState<TireCompound>("race");
  const [springs, setSprings] = useState<SpringPart>("race");
  const [dampers, setDampers] = useState<DamperPart>("race");
  const [arb, setArb] = useState<ARBPart>("race");
  const [aero, setAero] = useState<AeroPart>("race");
  const [differential, setDifferential] = useState<DiffPart>("race");
  const [frontAeroDownforce, setFrontAeroDownforce] = useState(50);
  const [rearAeroDownforce, setRearAeroDownforce] = useState(70);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCalculate({
      name: tuneName,
      carName,
      piClass, weight, frontDist, power, drivetrain, trackType, style,
      parts: {
        tireCompound, springs, dampers, arb, aero, differential,
        frontAeroDownforce, rearAeroDownforce,
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tune metadata */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Tune Info</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Tune Name</label>
            <input
              value={tuneName}
              onChange={(e) => setTuneName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="My Tune"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Car Name</label>
            <input
              value={carName}
              onChange={(e) => setCarName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="e.g. Bugatti Chiron"
            />
          </div>
        </div>
      </div>

      {/* Car stats */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Car Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <Select label="PI Class" value={piClass} options={PI_CLASSES.map((v) => ({ value: v, label: v }))} onChange={setPiClass} />
          <Select label="Drivetrain" value={drivetrain} options={DRIVETRAINS.map((v) => ({ value: v, label: v }))} onChange={setDrivetrain} />
          <NumberInput label="Weight" value={weight} onChange={setWeight} min={1000} max={6000} unit="lbs" />
          <NumberInput label="Power" value={power} onChange={setPower} min={50} max={2000} unit="hp" />
          <NumberInput label="Front Weight Dist." value={frontDist} onChange={setFrontDist} min={20} max={80} unit="%" />
          <div className="text-xs text-slate-400 flex items-end pb-2">
            Rear: <span className="text-white font-bold ml-1">{100 - frontDist}%</span>
          </div>
        </div>
      </div>

      {/* Setup */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Setup</h2>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Track Type" value={trackType} options={TRACK_TYPES} onChange={setTrackType} />
          <Select label="Driving Style" value={style} options={STYLES} onChange={setStyle} />
        </div>
      </div>

      {/* Parts */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Installed Parts</h2>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Tire Compound" value={tireCompound}
            options={([["stock","Stock"],["sport","Sport"],["race","Race"],["semi-slick","Semi-Slick"],["slick","Slick"]] as [TireCompound,string][]).map(([v,l])=>({value:v,label:l}))}
            onChange={setTireCompound}
          />
          <Select label="Springs" value={springs}
            options={([["stock","Stock"],["sport","Sport"],["race","Race"],["rally","Rally"],["drift","Drift"]] as [SpringPart,string][]).map(([v,l])=>({value:v,label:l}))}
            onChange={setSprings}
          />
          <Select label="Dampers" value={dampers}
            options={([["stock","Stock"],["sport","Sport"],["race","Race"]] as [DamperPart,string][]).map(([v,l])=>({value:v,label:l}))}
            onChange={setDampers}
          />
          <Select label="Anti-Roll Bars" value={arb}
            options={([["stock","Stock"],["sport","Sport"],["race","Race"]] as [ARBPart,string][]).map(([v,l])=>({value:v,label:l}))}
            onChange={setArb}
          />
          <Select label="Aerodynamics" value={aero}
            options={([["none","None"],["sport","Sport"],["race","Race"]] as [AeroPart,string][]).map(([v,l])=>({value:v,label:l}))}
            onChange={setAero}
          />
          <Select label="Differential" value={differential}
            options={([["stock","Stock (locked)"],["sport","Sport"],["race","Race"],["drift","Drift"]] as [DiffPart,string][]).map(([v,l])=>({value:v,label:l}))}
            onChange={setDifferential}
          />
        </div>

        {aero !== "none" && (
          <div className="mt-3 pt-3 border-t border-slate-700 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400">Aero Downforce Settings</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Front Downforce <span className="text-white">{frontAeroDownforce}%</span></label>
                <input type="range" min={0} max={100} value={frontAeroDownforce} onChange={(e) => setFrontAeroDownforce(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Rear Downforce <span className="text-white">{rearAeroDownforce}%</span></label>
                <input type="range" min={0} max={100} value={rearAeroDownforce} onChange={(e) => setRearAeroDownforce(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm uppercase tracking-widest transition-colors"
      >
        {loading ? "Calculating…" : "Calculate Tune"}
      </button>
    </form>
  );
}
