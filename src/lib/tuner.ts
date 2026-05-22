export type Drivetrain = "FWD" | "RWD" | "AWD";
export type PIClass = "D" | "C" | "B" | "A" | "S1" | "S2" | "X";
export type TrackType = "road" | "dirt" | "cross-country" | "mixed";
export type Style = "grip" | "drift" | "balance";
export type TireCompound = "stock" | "sport" | "race" | "semi-slick" | "slick";
export type SpringPart = "stock" | "sport" | "race" | "rally" | "drift";
export type DamperPart = "stock" | "sport" | "race";
export type ARBPart = "stock" | "sport" | "race";
export type AeroPart = "none" | "sport" | "race";
export type DiffPart = "stock" | "sport" | "race" | "drift";

export interface Parts {
  tireCompound: TireCompound;
  springs: SpringPart;
  dampers: DamperPart;
  arb: ARBPart;
  aero: AeroPart;
  differential: DiffPart;
  frontAeroDownforce: number; // 0–100
  rearAeroDownforce: number;  // 0–100
}

export interface CarStats {
  weight: number;           // lbs
  frontDist: number;        // 0–100 (%)
  power: number;            // hp
  drivetrain: Drivetrain;
  piClass: PIClass;
  trackType: TrackType;
  style: Style;
  parts: Parts;
}

export interface TireResult {
  pressureFront: number;
  pressureRear: number;
  camberFront: number;
  camberRear: number;
  toeFront: number;
  toeRear: number;
  caster: number;
}

export interface SuspensionResult {
  springFront: number;       // lbs/in
  springRear: number;
  rideHeightFront: number;   // cm
  rideHeightRear: number;
  bumpFront: number;         // 1–20
  bumpRear: number;
  reboundFront: number;
  reboundRear: number;
  arbFront: number;          // 1–65
  arbRear: number;
}

export interface DiffResult {
  frontAccel: number;        // 0–100%
  frontDecel: number;
  rearAccel: number;
  rearDecel: number;
  centerBalance: number;     // AWD only, 0–100 (front bias)
}

export interface BrakeResult {
  balance: number;           // 0–100 (front bias)
  pressure: number;          // 0–200%
}

export interface TuneResult {
  tires: TireResult;
  suspension: SuspensionResult;
  diff: DiffResult;
  brakes: BrakeResult;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function round1(v: number) {
  return Math.round(v * 10) / 10;
}

function round0(v: number) {
  return Math.round(v);
}

// ─── main calculator ─────────────────────────────────────────────────────────

export function calculateTune(car: CarStats): TuneResult {
  const { weight, frontDist, power, drivetrain, parts, trackType, style } = car;
  const rearDist = 100 - frontDist;
  const frontCornerWeight = (weight * (frontDist / 100)) / 2;
  const rearCornerWeight  = (weight * (rearDist  / 100)) / 2;

  // ── Tire pressure ──────────────────────────────────────────────────────────
  const tireCompoundPressure: Record<TireCompound, number> = {
    stock: 32, sport: 30, race: 29, "semi-slick": 27, slick: 25,
  };
  const basePressure = tireCompoundPressure[parts.tireCompound];
  const offRoadPressureAdj = trackType === "cross-country" ? -3
    : trackType === "dirt" ? -2 : 0;
  const pressureFront = clamp(basePressure + offRoadPressureAdj, 20, 40);
  const pressureRear  = clamp(basePressure + offRoadPressureAdj + (drivetrain === "FWD" ? -1 : 1), 20, 40);

  // ── Alignment ──────────────────────────────────────────────────────────────
  const isOffRoad = trackType === "dirt" || trackType === "cross-country";
  const isDrift   = style === "drift";

  const camberFront = isDrift ? -1.0
    : isOffRoad ? -0.5
    : trackType === "mixed" ? -1.0
    : -1.3;
  const camberRear  = isDrift ? 0
    : isOffRoad ? -0.2
    : -1.0;

  const toeFront = isDrift ? -0.2 : isOffRoad ? 0 : -0.1;
  const toeRear  = isDrift ? 0.3
    : drivetrain === "FWD" ? -0.1
    : isOffRoad ? 0.1 : 0.1;

  const caster = isDrift ? 6.5 : isOffRoad ? 6.0 : 5.5;

  // ── Springs ────────────────────────────────────────────────────────────────
  const springStiffnessFactor: Record<SpringPart, number> = {
    stock: 0.70, sport: 0.85, race: 1.0, rally: 0.80, drift: 1.10,
  };
  const sf = springStiffnessFactor[parts.springs];

  const downforceFront = (parts.aero !== "none" ? parts.frontAeroDownforce / 100 : 0);
  const downforceRear  = (parts.aero !== "none" ? parts.rearAeroDownforce  / 100 : 0);

  const baseSpringFront = (frontCornerWeight * sf * 0.38) + (downforceFront * 80);
  const baseSpringRear  = (rearCornerWeight  * sf * 0.38) + (downforceRear  * 80);

  const springFront = round0(clamp(baseSpringFront, 100, 2500));
  const springRear  = round0(clamp(baseSpringRear,  100, 2500));

  // ── Ride height ────────────────────────────────────────────────────────────
  const baseRideHeight = isOffRoad ? 25 : parts.springs === "drift" ? 8 : 10;
  const rideHeightFront = clamp(baseRideHeight + (downforceFront > 0.5 ? -1 : 0), 6, 40);
  const rideHeightRear  = clamp(baseRideHeight + (downforceRear  > 0.6 ? 0 : 1), 6, 40);

  // ── Dampers ────────────────────────────────────────────────────────────────
  const damperQuality: Record<DamperPart, number> = { stock: 0.7, sport: 0.85, race: 1.0 };
  const dq = damperQuality[parts.dampers];

  const bumpFront   = round1(clamp((springFront / 300) * dq, 1, 20));
  const bumpRear    = round1(clamp((springRear  / 300) * dq, 1, 20));
  const reboundFront = round1(clamp(bumpFront * 2.0, 1, 20));
  const reboundRear  = round1(clamp(bumpRear  * 2.0, 1, 20));

  // ── Anti-roll bars ─────────────────────────────────────────────────────────
  const arbQuality: Record<ARBPart, number> = { stock: 0.6, sport: 0.8, race: 1.0 };
  const aq = arbQuality[parts.arb];

  let arbFrontRaw = (frontCornerWeight / 120) * aq;
  let arbRearRaw  = (rearCornerWeight  / 120) * aq;

  // Under/oversteer tendency by drivetrain
  if (drivetrain === "FWD") {
    arbFrontRaw *= 0.85; arbRearRaw *= 1.10;
  } else if (drivetrain === "RWD" && isDrift) {
    arbFrontRaw *= 1.10; arbRearRaw *= 0.75;
  } else if (drivetrain === "AWD") {
    arbFrontRaw *= 0.95; arbRearRaw *= 1.05;
  }

  if (isOffRoad) { arbFrontRaw *= 0.75; arbRearRaw *= 0.75; }

  const arbFront = round0(clamp(arbFrontRaw, 1, 65));
  const arbRear  = round0(clamp(arbRearRaw,  1, 65));

  // ── Differential ───────────────────────────────────────────────────────────
  const hasDiff = parts.differential !== "stock";
  const powerFactor = clamp(power / 600, 0, 1);

  let frontAccel = 0, frontDecel = 0, rearAccel = 0, rearDecel = 0, centerBalance = 50;

  if (hasDiff) {
    if (drivetrain === "FWD") {
      frontAccel = round0(clamp(isDrift ? 60 : 50 + powerFactor * 20, 20, 100));
      frontDecel = round0(clamp(15 - powerFactor * 5, 0, 50));
    } else if (drivetrain === "RWD") {
      rearAccel  = round0(clamp(isDrift ? 75 : 40 + powerFactor * 25, 20, 100));
      rearDecel  = round0(clamp(isDrift ? 15 : 25 + powerFactor * 10, 0, 50));
    } else {
      frontAccel   = round0(clamp(isDrift ? 55 : 40 + powerFactor * 15, 20, 100));
      rearAccel    = round0(clamp(isDrift ? 65 : 50 + powerFactor * 20, 20, 100));
      centerBalance = round0(clamp(isDrift ? 45 : 65, 20, 80));
    }
  }

  // ── Brakes ─────────────────────────────────────────────────────────────────
  const balance = round0(clamp(
    isDrift ? 60 : drivetrain === "FWD" ? 55 : 50 + (frontDist - 50) * 0.4,
    40, 75
  ));
  const pressure = round0(clamp(isDrift ? 85 : 100 + powerFactor * 30, 80, 200));

  return {
    tires: {
      pressureFront: round1(pressureFront),
      pressureRear:  round1(pressureRear),
      camberFront:   round1(camberFront),
      camberRear:    round1(camberRear),
      toeFront:      round1(toeFront),
      toeRear:       round1(toeRear),
      caster:        round1(caster),
    },
    suspension: {
      springFront, springRear,
      rideHeightFront, rideHeightRear,
      bumpFront, bumpRear, reboundFront, reboundRear,
      arbFront, arbRear,
    },
    diff: { frontAccel, frontDecel, rearAccel, rearDecel, centerBalance },
    brakes: { balance, pressure },
  };
}
