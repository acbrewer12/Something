"use client";

import type { TuneResult } from "@/lib/tuner";

interface Props {
  results: TuneResult;
  drivetrain: string;
  hasDiff: boolean;
  hasAero: boolean;
}

function StatRow({ label, value, unit }: { label: string; value: number | string; unit?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-sm font-bold text-white">
        {value}{unit && <span className="text-slate-400 font-normal ml-0.5 text-xs">{unit}</span>}
      </span>
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className={`bg-slate-800/50 rounded-xl p-4 border border-slate-700`}>
      <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${color}`}>{title}</h3>
      {children}
    </div>
  );
}

export default function ResultsPanel({ results, drivetrain, hasDiff, hasAero }: Props) {
  const { tires, suspension, diff, brakes } = results;

  return (
    <div className="space-y-4">
      <Section title="Tires & Alignment" color="text-yellow-400">
        <div className="grid grid-cols-2 gap-x-6">
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Pressure</p>
            <StatRow label="Front" value={tires.pressureFront} unit=" PSI" />
            <StatRow label="Rear"  value={tires.pressureRear}  unit=" PSI" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Alignment</p>
            <StatRow label="Camber Front" value={tires.camberFront} unit="°" />
            <StatRow label="Camber Rear"  value={tires.camberRear}  unit="°" />
            <StatRow label="Toe Front"    value={tires.toeFront}    unit="°" />
            <StatRow label="Toe Rear"     value={tires.toeRear}     unit="°" />
            <StatRow label="Caster"       value={tires.caster}      unit="°" />
          </div>
        </div>
      </Section>

      <Section title="Suspension & ARB" color="text-green-400">
        <div className="grid grid-cols-2 gap-x-6">
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Springs</p>
            <StatRow label="Front" value={suspension.springFront} unit=" lb/in" />
            <StatRow label="Rear"  value={suspension.springRear}  unit=" lb/in" />
            <p className="text-xs text-slate-500 font-semibold mb-1 mt-2">Ride Height</p>
            <StatRow label="Front" value={suspension.rideHeightFront} unit=" cm" />
            <StatRow label="Rear"  value={suspension.rideHeightRear}  unit=" cm" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold mb-1">Damping</p>
            <StatRow label="Bump Front"     value={suspension.bumpFront}    />
            <StatRow label="Bump Rear"      value={suspension.bumpRear}     />
            <StatRow label="Rebound Front"  value={suspension.reboundFront} />
            <StatRow label="Rebound Rear"   value={suspension.reboundRear}  />
            <p className="text-xs text-slate-500 font-semibold mb-1 mt-2">Anti-Roll Bars</p>
            <StatRow label="Front" value={suspension.arbFront} />
            <StatRow label="Rear"  value={suspension.arbRear}  />
          </div>
        </div>
      </Section>

      {hasDiff && (
        <Section title="Differential" color="text-purple-400">
          <div className="grid grid-cols-2 gap-x-6">
            {(drivetrain === "FWD" || drivetrain === "AWD") && (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">Front Diff</p>
                <StatRow label="Acceleration" value={diff.frontAccel} unit="%" />
                <StatRow label="Deceleration" value={diff.frontDecel} unit="%" />
              </div>
            )}
            {(drivetrain === "RWD" || drivetrain === "AWD") && (
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1">Rear Diff</p>
                <StatRow label="Acceleration" value={diff.rearAccel} unit="%" />
                <StatRow label="Deceleration" value={diff.rearDecel} unit="%" />
              </div>
            )}
            {drivetrain === "AWD" && (
              <div className="col-span-2 mt-2">
                <p className="text-xs text-slate-500 font-semibold mb-1">Center Balance (front bias)</p>
                <StatRow label="Balance" value={diff.centerBalance} unit="%" />
              </div>
            )}
          </div>
        </Section>
      )}

      <Section title="Brakes" color="text-red-400">
        <div className="grid grid-cols-2 gap-x-6">
          <StatRow label="Balance (front)" value={brakes.balance} unit="%" />
          <StatRow label="Pressure"         value={brakes.pressure} unit="%" />
        </div>
      </Section>
    </div>
  );
}
