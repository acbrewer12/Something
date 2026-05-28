"use client";

import { useState, useEffect } from "react";
import { getTunes, deleteTune as deleteStoredTune } from "@/lib/storage";
import type { StoredTune } from "@/lib/storage";
import type { TuneResult } from "@/lib/tuner";

interface Props {
  onLoad: (tune: StoredTune) => void;
  refreshKey: number;
}

const PI_COLORS: Record<string, string> = {
  D: "bg-gray-600", C: "bg-blue-700", B: "bg-green-700",
  A: "bg-yellow-600", S1: "bg-orange-600", S2: "bg-red-600", X: "bg-purple-600",
};

const TUNE_EMOJI: Record<string, string> = {
  road: "🏁", dirt: "🌿", "cross-country": "🏔️", drift: "💨", drag: "🚀",
};

const WEATHER_EMOJI: Record<string, string> = {
  dry: "☀️", "light-rain": "🌦️", wet: "🌧️", storm: "⛈️", snow: "🌨️", blizzard: "🌬️",
};

export default function SavedTunes({ onLoad, refreshKey }: Props) {
  const [tunes, setTunes] = useState<StoredTune[]>([]);

  useEffect(() => {
    setTunes(getTunes());
  }, [refreshKey]);

  function handleDelete(id: string) {
    deleteStoredTune(id);
    setTunes((prev) => prev.filter((t) => t.id !== id));
  }

  if (tunes.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 text-center">
        <p className="text-slate-500 text-sm">No saved tunes yet — calculate one first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tunes.map((tune) => (
        <div key={tune.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex items-center gap-3">
          <span className={`${PI_COLORS[tune.piClass] ?? "bg-slate-600"} text-white text-xs font-bold px-2 py-1 rounded-md min-w-[32px] text-center`}>
            {tune.piClass}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{tune.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400 truncate">{tune.carName || "Unknown car"}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">{tune.drivetrain}</span>
              <span className="text-xs">{TUNE_EMOJI[tune.tuneType] ?? "🏁"}</span>
              <span className="text-xs">{WEATHER_EMOJI[tune.weather] ?? ""}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => onLoad(tune)}
              className="text-xs bg-cyan-900/60 hover:bg-cyan-800 text-cyan-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              Load
            </button>
            <button
              onClick={() => handleDelete(tune.id)}
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
