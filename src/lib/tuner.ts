// ─── Types ────────────────────────────────────────────────────────────────────

export type PIClass = "D" | "C" | "B" | "A" | "S1" | "S2" | "X";
export type Drivetrain = "FWD" | "RWD" | "AWD";
export type TuneType = "road" | "dirt" | "cross-country" | "drift" | "drag";
export type Season = "spring" | "summer" | "fall" | "winter";
export type Weather = "dry" | "light-rain" | "wet" | "storm" | "snow" | "blizzard";
export type EventType =
  | "sprint"
  | "circuit"
  | "street"
  | "drift-zone"
  | "drag-strip"
  | "speed-zone"
  | "danger-sign"
  | "cross-country"
  | "trailblazer";

export type Aspiration =
  | "stock"
  | "turbo"
  | "twin-turbo"
  | "supercharger"
  | "twin-supercharger";
export type EngineSwap = "stock" | "sport" | "race" | "elite";
export type ExhaustUpgrade = "stock" | "sport" | "race";
export type TransmissionUpgrade = "stock" | "sport" | "race" | "drift" | "drag";
export type ClutchUpgrade =
  | "stock"
  | "sport"
  | "race"
  | "twin-plate"
  | "triple-plate";
export type DrivelineUpgrade = "stock" | "sport" | "race";
export type BrakeUpgrade = "stock" | "sport" | "race";
export type SpringUpgrade = "stock" | "sport" | "race" | "rally" | "drift";
export type DamperUpgrade = "stock" | "sport" | "race";
export type ARBUpgrade = "stock" | "sport" | "race";
export type RollCage = "none" | "street" | "race";
export type TireCompound =
  | "stock"
  | "sport"
  | "race"
  | "semi-slick"
  | "slick"
  | "rally"
  | "offroad";
export type TireWidth = "stock" | "narrow" | "wide" | "extra-wide";
export type AeroUpgrade = "none" | "street" | "race";
export type DiffUpgrade = "stock" | "sport" | "race" | "drift" | "rally";

export interface Upgrades {
  // Engine
  aspiration: Aspiration;
  engineSwap: EngineSwap;
  exhaust: ExhaustUpgrade;
  // Drivetrain
  transmission: TransmissionUpgrade;
  clutch: ClutchUpgrade;
  driveline: DrivelineUpgrade;
  differential: DiffUpgrade;
  // Handling
  brakes: BrakeUpgrade;
  springs: SpringUpgrade;
  dampers: DamperUpgrade;
  arb: ARBUpgrade;
  rollCage: RollCage;
  // Tires
  tireCompound: TireCompound;
  tireWidthFront: TireWidth;
  tireWidthRear: TireWidth;
  // Aero
  aeroFront: AeroUpgrade;
  aeroRear: AeroUpgrade;
  frontDownforce: number; // 0–100
  rearDownforce: number;  // 0–100
}

export interface CarInfo {
  name: string;
  piClass: PIClass;
  weight: number;    // lbs
  power: number;     // hp
  drivetrain: Drivetrain;
  frontDist: number; // 0–100%
}

export interface TuneContext {
  tuneType: TuneType;
  season: Season;
  weather: Weather;
  eventType: EventType;
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
  springFront: number;
  springRear: number;
  rideHeightFront: number;
  rideHeightRear: number;
  bumpFront: number;
  bumpRear: number;
  reboundFront: number;
  reboundRear: number;
  arbFront: number;
  arbRear: number;
}

export interface DiffResult {
  frontAccel: number;
  frontDecel: number;
  rearAccel: number;
  rearDecel: number;
  centerBalance: number;
}

export interface BrakeResult {
  balance: number;
  pressure: number;
}

export interface TuneResult {
  tires: TireResult;
  suspension: SuspensionResult;
  diff: DiffResult;
  brakes: BrakeResult;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

function round0(v: number): number {
  return Math.round(v);
}

// ─── Main Calculator ──────────────────────────────────────────────────────────

export function calculateTune(
  car: CarInfo,
  upgrades: Upgrades,
  context: TuneContext
): TuneResult {
  const { weight, frontDist, power, drivetrain } = car;
  const { tuneType, season, weather } = context;
  const rearDist = 100 - frontDist;

  const frontCornerWeight = (weight * (frontDist / 100)) / 2;
  const rearCornerWeight  = (weight * (rearDist  / 100)) / 2;

  const isOffRoad = tuneType === "dirt" || tuneType === "cross-country";
  const isDrift   = tuneType === "drift";
  const isDrag    = tuneType === "drag";
  const isWinter  = season === "winter";
  const isSnowIce = weather === "snow" || weather === "blizzard";
  const isWet     = weather === "light-rain" || weather === "wet";
  const isStorm   = weather === "storm";

  // ── Tire Pressure ─────────────────────────────────────────────────────────
  const compoundBasePressure: Record<TireCompound, number> = {
    stock: 32, sport: 30, race: 29, "semi-slick": 27,
    slick: 25, rally: 26, offroad: 22,
  };

  const basePressure = compoundBasePressure[upgrades.tireCompound];

  // Weather adjustments
  let weatherPressureAdj = 0;
  if (isWet) weatherPressureAdj = -1;
  else if (isStorm) weatherPressureAdj = -2;
  else if (isSnowIce) weatherPressureAdj = -3;

  // Season
  const seasonAdj = isWinter ? -1 : 0;

  let pressureFront = basePressure + weatherPressureAdj + seasonAdj;
  let pressureRear  = basePressure + weatherPressureAdj + seasonAdj;

  // Drivetrain adjustment
  if (drivetrain === "RWD") pressureRear  += 1;
  if (drivetrain === "FWD") pressureRear  -= 1;

  // Drag
  if (isDrag) { pressureFront += 4; pressureRear -= 2; }

  pressureFront = clamp(pressureFront, 18, 42);
  pressureRear  = clamp(pressureRear,  18, 42);

  // ── Camber ────────────────────────────────────────────────────────────────
  let camberFront: number;
  let camberRear: number;

  if (isDrag) {
    camberFront = -0.3;
    camberRear  = 0;
  } else if (isDrift) {
    camberFront = drivetrain === "RWD" ? -1.0 : -1.2;
    camberRear  = drivetrain === "RWD" ?  0   : -0.5;
  } else if (isOffRoad) {
    camberFront = -0.5;
    camberRear  = -0.2;
  } else {
    // Road default
    camberFront = -1.3;
    camberRear  = -1.0;
  }

  // Tire width adjustments to camber
  const frontWidthCamberAdj: Record<TireWidth, number> = {
    stock: 0, narrow: 0.2, wide: -0.2, "extra-wide": -0.4,
  };
  const rearWidthCamberAdj: Record<TireWidth, number> = {
    stock: 0, narrow: 0.1, wide: -0.2, "extra-wide": -0.3,
  };
  camberFront += frontWidthCamberAdj[upgrades.tireWidthFront];
  camberRear  += rearWidthCamberAdj[upgrades.tireWidthRear];

  // Snow / blizzard — add +0.3 to both (less negative)
  if (isSnowIce) {
    camberFront += 0.3;
    camberRear  += 0.3;
  }

  // ── Toe ───────────────────────────────────────────────────────────────────
  let toeFront: number;
  let toeRear: number;

  if (isDrag) {
    toeFront = 0;
    toeRear  = 0;
  } else if (isDrift) {
    toeFront = -0.2;
    toeRear  = 0.3;
  } else if (drivetrain === "FWD") {
    toeFront = -0.1;
    toeRear  = -0.1;
  } else if (isOffRoad) {
    toeFront = 0;
    toeRear  = 0.1;
  } else {
    toeFront = 0;
    toeRear  = 0.1;
  }

  // ── Caster ────────────────────────────────────────────────────────────────
  let caster: number;
  if (isDrift)        caster = 6.5;
  else if (isDrag)    caster = 5.0;
  else if (isOffRoad) caster = 6.0;
  else                caster = 5.5;

  // ── Springs ───────────────────────────────────────────────────────────────
  const springStiffnessFactor: Record<SpringUpgrade, number> = {
    stock: 0.60, sport: 0.75, race: 0.95, rally: 0.70, drift: 1.05,
  };
  const sf = springStiffnessFactor[upgrades.springs];

  const downforceFront = upgrades.aeroFront !== "none" ? upgrades.frontDownforce / 100 : 0;
  const downforceRear  = upgrades.aeroRear  !== "none" ? upgrades.rearDownforce  / 100 : 0;

  // +12 per 10% downforce
  let springFrontRaw = frontCornerWeight * sf * 0.38 + downforceFront * 120;
  let springRearRaw  = rearCornerWeight  * sf * 0.38 + downforceRear  * 120;

  if (isDrag) {
    springFrontRaw *= 0.55;
    springRearRaw  *= 1.45;
  } else if (isOffRoad) {
    springFrontRaw *= 0.80;
    springRearRaw  *= 0.80;
  }

  if (isSnowIce) {
    springFrontRaw *= 0.75;
    springRearRaw  *= 0.75;
  }

  const springFront = round0(clamp(springFrontRaw, 80, 2500));
  const springRear  = round0(clamp(springRearRaw,  80, 2500));

  // ── Ride Height ───────────────────────────────────────────────────────────
  let rideHeightFront: number;
  let rideHeightRear: number;

  if (isDrag) {
    rideHeightFront = 7;
    rideHeightRear  = 9;
  } else if (isDrift) {
    rideHeightFront = 9;
    rideHeightRear  = 10;
  } else if (tuneType === "cross-country") {
    rideHeightFront = 22;
    rideHeightRear  = 24;
  } else if (tuneType === "dirt") {
    rideHeightFront = 18;
    rideHeightRear  = 20;
  } else {
    rideHeightFront = 10;
    rideHeightRear  = 11;
  }

  if (isSnowIce) {
    rideHeightFront += 3;
    rideHeightRear  += 3;
  }

  rideHeightFront = clamp(rideHeightFront, 6, 50);
  rideHeightRear  = clamp(rideHeightRear,  6, 50);

  // ── Dampers ───────────────────────────────────────────────────────────────
  const damperQualityMap: Record<DamperUpgrade, number> = {
    stock: 0.70, sport: 0.85, race: 1.00,
  };
  const dq = damperQualityMap[upgrades.dampers];

  const bumpFrontRaw = (springFront / 300) * dq;
  const bumpRearRaw  = (springRear  / 300) * dq;

  // Rebound ratios per tune type
  let reboundRatioFront: number;
  let reboundRatioRear: number;

  if (isDrag) {
    reboundRatioFront = 1.5;
    reboundRatioRear  = 2.2;
  } else if (isDrift) {
    reboundRatioFront = 1.8;
    reboundRatioRear  = 1.8;
  } else if (tuneType === "cross-country") {
    reboundRatioFront = 2.4;
    reboundRatioRear  = 2.4;
  } else if (tuneType === "dirt") {
    reboundRatioFront = 2.2;
    reboundRatioRear  = 2.2;
  } else if (isSnowIce) {
    reboundRatioFront = 2.5;
    reboundRatioRear  = 2.5;
  } else {
    reboundRatioFront = 2.0;
    reboundRatioRear  = 2.0;
  }

  const bumpFront    = round1(clamp(bumpFrontRaw, 1, 20));
  const bumpRear     = round1(clamp(bumpRearRaw,  1, 20));
  const reboundFront = round1(clamp(bumpFrontRaw * reboundRatioFront, 1, 20));
  const reboundRear  = round1(clamp(bumpRearRaw  * reboundRatioRear,  1, 20));

  // ── Anti-Roll Bars ────────────────────────────────────────────────────────
  const arbQualityMap: Record<ARBUpgrade, number> = {
    stock: 0.55, sport: 0.75, race: 1.00,
  };
  const aq = arbQualityMap[upgrades.arb];

  // Drivetrain factors
  let driverFactorFront: number;
  let driverFactorRear: number;

  if (isDrift && drivetrain === "RWD") {
    driverFactorFront = 1.15;
    driverFactorRear  = 0.70;
  } else if (drivetrain === "FWD") {
    driverFactorFront = 0.85;
    driverFactorRear  = 1.10;
  } else if (drivetrain === "AWD") {
    driverFactorFront = 0.95;
    driverFactorRear  = 1.05;
  } else {
    // RWD road
    driverFactorFront = 1.0;
    driverFactorRear  = 1.05;
  }

  let arbFrontRaw = (frontCornerWeight / 80) * aq * driverFactorFront;
  let arbRearRaw  = (rearCornerWeight  / 80) * aq * driverFactorRear;

  if (isDrag) {
    arbFrontRaw *= 0.45;
    arbRearRaw  *= 0.45;
  } else if (isOffRoad) {
    arbFrontRaw *= 0.65;
    arbRearRaw  *= 0.65;
  }

  if (isSnowIce) {
    arbFrontRaw *= 0.55;
    arbRearRaw  *= 0.55;
  }

  const arbFront = round0(clamp(arbFrontRaw, 1, 65));
  const arbRear  = round0(clamp(arbRearRaw,  1, 65));

  // ── Differential ─────────────────────────────────────────────────────────
  const hasDiff = upgrades.differential !== "stock";
  const powerFactor = clamp(power / 700, 0, 1);

  let frontAccel = 0, frontDecel = 0, rearAccel = 0, rearDecel = 0, centerBalance = 50;

  if (hasDiff) {
    if (drivetrain === "FWD") {
      if (isDrift) {
        frontAccel = 70;
        frontDecel = 0;
      } else {
        frontAccel = round0(clamp(45 + powerFactor * 20, 0, 100));
        frontDecel = 10;
      }
    } else if (drivetrain === "RWD") {
      if (isDrift) {
        rearAccel = round0(clamp(80 + powerFactor * 15, 0, 100));
        rearDecel = 10;
      } else if (isDrag) {
        rearAccel = 100;
        rearDecel = 0;
      } else {
        rearAccel = round0(clamp(40 + powerFactor * 25, 0, 100));
        rearDecel = round0(clamp(20 + powerFactor * 15, 0, 100));
      }
    } else {
      // AWD
      if (isDrift) {
        frontAccel    = 55;
        rearAccel     = 75;
        centerBalance = 45;
      } else if (isDrag) {
        frontAccel    = 60;
        rearAccel     = 100;
        centerBalance = 70;
      } else {
        frontAccel    = round0(clamp(40 + powerFactor * 10, 0, 100));
        rearAccel     = round0(clamp(50 + powerFactor * 15, 0, 100));
        centerBalance = 65;
      }
    }
  }

  // ── Brakes ────────────────────────────────────────────────────────────────
  let balance: number;
  let pressure: number;

  if (isDrift) {
    balance = 62;
  } else if (isDrag) {
    balance = 48;
  } else if (drivetrain === "FWD") {
    balance = 55;
  } else {
    balance = round0(50 + (frontDist - 50) * 0.3);
  }
  balance = clamp(balance, 40, 75);

  if (isDrag) {
    pressure = 80;
  } else if (isDrift) {
    pressure = 85;
  } else {
    pressure = round0(100 + powerFactor * 25);
  }
  pressure = clamp(pressure, 70, 200);

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
