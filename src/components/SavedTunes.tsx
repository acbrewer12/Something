"use client";

import { useState, useEffect } from "react";
import type { TuneResult } from "@/lib/tuner";

interface SavedTune {
  id: string;
  name: string;
  carName: string;
  piClass: string;
  drivetrain: string;
  trackType: string;
  style: string;
  results: string;
  createdAt: string;
}

interface LoadedTune extends Omit<SavedTune, "results"> {
  results: TuneResult;
}

interface Props {
  onLoad: (tune: LoadedTune) => void;
  refreshKey: number;
}

const PI_COLORS: Record<string, string> = {
  D: "bg-gray-600", C: "bg-blue-700", B: "bg-green-700",
  A: "bg-yellow-600", S1: "bg-orange-600", S2: "bg-red-600", X: "bg-purple-600",
};

export default function SavedTunes({ onLoad, refreshKey }: Props) {
  const [tunes, setTunes] = useState<SavedTune[]>([]);

  async function fetchTunes() {
    const res = await fetch("/api/tunes");
    const data = await res.json();
    setTunes(data);
  }

  useEffect(() => { fetchTunes(); }, [refreshKey]);

  async function deleteTune(id: string) {
    await fetch(`/api/tunes/${id}`, { method: "DELETE" });
    setTunes((prev) => prev.filter((t) => t.id !== id));
  }

  if (tunes.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
        <p className="text-slate-500 text-sm">No saved tunes yet. Calculate one above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tunes.map((tune) => (
        <div key={tune.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex items-center gap-4">
          <span className={`${PI_COLORS[tune.piClass] ?? "bg-slate-600"} text-white text-xs font-bold px-2 py-1 rounded-md min-w-[32px] text-center`}>
            {tune.piClass}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{tune.name}</p>
            <p className="text-xs text-slate-400 truncate">
              {tune.carName || "Unknown car"} · {tune.drivetrain} · {tune.style} · {tune.trackType}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onLoad({ ...tune, results: JSON.parse(tune.results) as TuneResult })}
              className="text-xs bg-cyan-900/60 hover:bg-cyan-800 text-cyan-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              Load
            </button>
            <button
              onClick={() => deleteTune(tune.id)}
              className="text-xs bg-red-900/40 hover:bg-red-800/60 text-red-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
