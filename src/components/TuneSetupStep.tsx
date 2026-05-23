"use client";

import type { TuneContext, TuneType, Season, Weather, EventType } from "@/lib/tuner";

interface Props {
  data: TuneContext;
  onChange: (data: TuneContext) => void;
  onBack: () => void;
  onCalculate: () => void;
  loading: boolean;
}

// ── Tune Types ────────────────────────────────────────────────────────────

const TUNE_TYPES: { value: TuneType; label: string; icon: string; desc: string }[] = [
  { value: "road",          label: "Road",          icon: "🏁", desc: "Tarmac circuits & sprints" },
  { value: "dirt",          label: "Dirt",          icon: "🌿", desc: "Gravel & dirt tracks" },
  { value: "cross-country", label: "Cross-Country", icon: "🏔️", desc: "All-terrain off-road" },
  { value: "drift",         label: "Drift",         icon: "💨", desc: "Controlled slides" },
  { value: "drag",          label: "Drag",          icon: "🚀", desc: "Straight-line speed" },
];

// ── Seasons ────────────────────────────────────────────────────────────────

const SEASONS: { value: Season; label: string; color: string }[] = [
  { value: "spring", label: "Spring", color: "bg-green-700 text-green-200" },
  { value: "summer", label: "Summer", color: "bg-yellow-600 text-yellow-100" },
  { value: "fall",   label: "Fall",   color: "bg-orange-600 text-orange-100" },
  { value: "winter", label: "Winter", color: "bg-blue-700 text-blue-100" },
];

// ── Weather ────────────────────────────────────────────────────────────────

const WEATHER: { value: Weather; label: string; icon: string }[] = [
  { value: "dry",         label: "Dry",         icon: "☀️" },
  { value: "light-rain",  label: "Light Rain",  icon: "🌦️" },
  { value: "wet",         label: "Wet",         icon: "🌧️" },
  { value: "storm",       label: "Storm",       icon: "⛈️" },
  { value: "snow",        label: "Snow",        icon: "🌨️" },
  { value: "blizzard",    label: "Blizzard",    icon: "❄️" },
];

// ── Event Types ────────────────────────────────────────────────────────────

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "sprint",        label: "Sprint" },
  { value: "circuit",       label: "Circuit" },
  { value: "street",        label: "Street Scene" },
  { value: "drift-zone",    label: "Drift Zone" },
  { value: "drag-strip",    label: "Drag Strip" },
  { value: "speed-zone",    label: "Speed Zone" },
  { value: "danger-sign",   label: "Danger Sign" },
  { value: "cross-country", label: "Cross Country" },
  { value: "trailblazer",   label: "Trailblazer" },
];

// ── Main Component ─────────────────────────────────────────────────────────

export default function TuneSetupStep({ data, onChange, onBack, onCalculate, loading }: Props) {
  const set = <K extends keyof TuneContext>(key: K, val: TuneContext[K]) =>
    onChange({ ...data, [key]: val });

  return (
    <div className="space-y-6">
      {/* Tune Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Tune Type</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TUNE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => set("tuneType", t.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                data.tuneType === t.value
                  ? "border-cyan-500 bg-cyan-500/10 text-white"
                  : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              <span className="text-2xl leading-none">{t.icon}</span>
              <span className="text-sm font-bold">{t.label}</span>
              <span className="text-[10px] text-slate-500 leading-tight">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Season */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Season</label>
        <div className="flex gap-2 flex-wrap">
          {SEASONS.map((s) => (
            <button
              key={s.value}
              onClick={() => set("season", s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                data.season === s.value
                  ? `${s.color} ring-2 ring-white/30 ring-offset-1 ring-offset-slate-900`
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-600"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weather */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Weather</label>
        <div className="flex gap-2 flex-wrap">
          {WEATHER.map((w) => (
            <button
              key={w.value}
              onClick={() => set("weather", w.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                data.weather === w.value
                  ? "bg-cyan-500 text-black ring-2 ring-cyan-400/40 ring-offset-1 ring-offset-slate-900"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600"
              }`}
            >
              <span>{w.icon}</span>
              <span>{w.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Event Type */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Event Type</label>
        <div className="grid grid-cols-3 gap-2">
          {EVENT_TYPES.map((e) => (
            <button
              key={e.value}
              onClick={() => set("eventType", e.value)}
              className={`px-2 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                data.eventType === e.value
                  ? "bg-cyan-500 text-black"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold py-3 rounded-xl text-sm transition-colors"
        >
          Back
        </button>
        <button
          onClick={onCalculate}
          disabled={loading}
          className="flex-1 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl text-sm uppercase tracking-widest transition-colors"
        >
          {loading ? "Calculating…" : "Calculate Tune"}
        </button>
      </div>
    </div>
  );
}
