import type { CarInfo, Upgrades, TuneContext } from "./tuner";

export interface PerformanceRatings {
  topSpeed:     number; // 0–100
  acceleration: number;
  handling:     number;
  launch:       number;
  braking:      number;
  overall:      number;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function getPerformanceRatings(
  car: CarInfo,
  upgrades: Upgrades,
  _context: TuneContext
): PerformanceRatings {
  const { weight, power, drivetrain, frontDist } = car;
  const pwr = clamp(power / 1200, 0, 1); // 0–1 power ratio
  const pwrToWeight = power / weight;     // hp/lb

  // ── Top Speed ─────────────────────────────────────────────────────────────
  const transBonus: Record<string, number> = {
    stock: 0, sport: 5, race: 10, drift: -5, drag: 15,
  };
  const aeroDownforcePenalty =
    ((upgrades.aeroFront !== "none" ? upgrades.frontDownforce : 0) +
      (upgrades.aeroRear !== "none" ? upgrades.rearDownforce : 0)) /
    2 *
    0.08; // high downforce trims top speed slightly
  const topSpeed = clamp(
    40 + pwr * 50 + (transBonus[upgrades.transmission] ?? 0) - aeroDownforcePenalty,
    0,
    100
  );

  // ── Acceleration ──────────────────────────────────────────────────────────
  const aspirationBonus: Record<string, number> = {
    stock: 0, turbo: 5, "twin-turbo": 10,
    supercharger: 7, "twin-supercharger": 12,
  };
  const clutchBonus: Record<string, number> = {
    stock: 0, sport: 3, race: 6, "twin-plate": 9, "triple-plate": 12,
  };
  const acceleration = clamp(
    30 + pwrToWeight * 120 +
      (aspirationBonus[upgrades.aspiration] ?? 0) +
      (clutchBonus[upgrades.clutch] ?? 0),
    0,
    100
  );

  // ── Handling ──────────────────────────────────────────────────────────────
  const springBonus: Record<string, number> = {
    stock: 0, sport: 8, race: 16, rally: 6, drift: 10,
  };
  const tireGrip: Record<string, number> = {
    stock: 0, sport: 5, race: 12, "semi-slick": 18, slick: 22, rally: 4, offroad: -4,
  };
  const arbBonus: Record<string, number> = { stock: 0, sport: 5, race: 10 };
  const downforceBonus =
    ((upgrades.aeroFront !== "none" ? upgrades.frontDownforce : 0) +
      (upgrades.aeroRear !== "none" ? upgrades.rearDownforce : 0)) /
    2 *
    0.2;
  const balanceBonus = 10 - Math.abs(frontDist - 50) * 0.3; // balanced dist = better handling
  const handling = clamp(
    20 +
      (springBonus[upgrades.springs] ?? 0) +
      (tireGrip[upgrades.tireCompound] ?? 0) +
      (arbBonus[upgrades.arb] ?? 0) +
      downforceBonus +
      balanceBonus,
    0,
    100
  );

  // ── Launch ────────────────────────────────────────────────────────────────
  const drivetrainLaunchBonus: Record<string, number> = {
    FWD: 0, RWD: 8, AWD: 18,
  };
  const diffBonus: Record<string, number> = {
    stock: 0, sport: 8, race: 15, drift: 12, rally: 10,
  };
  const tireLaunchGrip: Record<string, number> = {
    stock: 0, sport: 6, race: 12, "semi-slick": 18, slick: 22, rally: 8, offroad: 4,
  };
  const launch = clamp(
    20 +
      (drivetrainLaunchBonus[drivetrain] ?? 0) +
      (diffBonus[upgrades.differential] ?? 0) +
      (tireLaunchGrip[upgrades.tireCompound] ?? 0) +
      (clutchBonus[upgrades.clutch] ?? 0),
    0,
    100
  );

  // ── Braking ───────────────────────────────────────────────────────────────
  const brakeBonus: Record<string, number> = { stock: 0, sport: 15, race: 28 };
  const weightPenalty = clamp((weight - 2000) / 100, 0, 20); // heavier = worse braking
  const tireBrake: Record<string, number> = {
    stock: 0, sport: 4, race: 10, "semi-slick": 14, slick: 18, rally: 3, offroad: -2,
  };
  const braking = clamp(
    50 +
      (brakeBonus[upgrades.brakes] ?? 0) +
      (tireBrake[upgrades.tireCompound] ?? 0) -
      weightPenalty,
    0,
    100
  );

  // ── Overall (weighted) ────────────────────────────────────────────────────
  const overall = clamp(
    Math.round(
      handling     * 0.30 +
      acceleration * 0.25 +
      topSpeed     * 0.20 +
      launch       * 0.15 +
      braking      * 0.10
    ),
    0,
    100
  );

  return {
    topSpeed:     Math.round(topSpeed),
    acceleration: Math.round(acceleration),
    handling:     Math.round(handling),
    launch:       Math.round(launch),
    braking:      Math.round(braking),
    overall,
  };
}
