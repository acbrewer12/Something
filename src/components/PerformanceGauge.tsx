"use client";

interface Props {
  label: string;
  value: number; // 0–100
  color: string; // tailwind bg color class
  icon?: string;
}

export default function PerformanceGauge({ label, value, color, icon }: Props) {
  const rating =
    value >= 80 ? "S" : value >= 65 ? "A" : value >= 50 ? "B" : value >= 35 ? "C" : "D";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">{value}</span>
          <span
            className={`text-[10px] font-black w-5 h-5 rounded flex items-center justify-center ${color} text-black`}
          >
            {rating}
          </span>
        </div>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
