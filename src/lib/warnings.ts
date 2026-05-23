import type { CarInfo, Upgrades, TuneContext } from "./tuner";

export interface Warning {
  level: "error" | "warn" | "info";
  message: string;
}

export function getBuildWarnings(
  car: CarInfo,
  upgrades: Upgrades,
  context: TuneContext
): Warning[] {
  const warnings: Warning[] = [];
  const { tuneType, weather, eventType } = context;
  const { power, drivetrain, piClass } = car;

  const isOffRoadEvent =
    eventType === "cross-country" || eventType === "trailblazer";
  const isOffRoadTune =
    tuneType === "dirt" || tuneType === "cross-country";
  const isSnowWet =
    weather === "snow" ||
    weather === "blizzard" ||
    weather === "wet" ||
    weather === "storm";
  const highClass =
    piClass === "S1" || piClass === "S2" || piClass === "X";

  // ── Errors ────────────────────────────────────────────────────────────────

  if (
    upgrades.tireCompound === "slick" &&
    (isOffRoadTune || isOffRoadEvent)
  ) {
    warnings.push({
      level: "error",
      message:
        "Slick tires are not suitable for dirt/cross-country terrain — no grip off-road.",
    });
  }

  if (
    upgrades.tireCompound === "offroad" &&
    (tuneType === "road" || tuneType === "drift" || tuneType === "drag")
  ) {
    warnings.push({
      level: "error",
      message:
        "Off-road tires perform poorly on tarmac — switch to a road-compatible compound.",
    });
  }

  if (
    upgrades.transmission === "drag" &&
    (tuneType === "drift" || tuneType === "dirt" || tuneType === "road")
  ) {
    warnings.push({
      level: "error",
      message:
        "Drag transmission is only suited for drag strips — wrong gear ratios for this tune type.",
    });
  }

  // ── Warnings ──────────────────────────────────────────────────────────────

  if (tuneType === "drift" && drivetrain === "FWD") {
    warnings.push({
      level: "warn",
      message:
        "Drift tune with FWD drivetrain: front-wheel drive makes sustained drifts very difficult.",
    });
  }

  if (power > 600 && upgrades.clutch === "stock") {
    warnings.push({
      level: "warn",
      message: `High power (${power} hp) with stock clutch — upgrade the clutch to handle the torque.`,
    });
  }

  if (
    (upgrades.aspiration === "twin-turbo" ||
      upgrades.aspiration === "twin-supercharger") &&
    upgrades.exhaust === "stock"
  ) {
    warnings.push({
      level: "warn",
      message:
        "Twin forced induction with stock exhaust — you're leaving power on the table.",
    });
  }

  if (
    (upgrades.aeroFront === "race" || upgrades.aeroRear === "race") &&
    upgrades.springs === "stock"
  ) {
    warnings.push({
      level: "warn",
      message:
        "Race aero generates significant downforce that stock springs cannot properly handle — upgrade your springs.",
    });
  }

  if (upgrades.differential === "stock" && tuneType === "drift") {
    warnings.push({
      level: "warn",
      message:
        "No differential upgrade for a drift tune — a drift or race diff is essential for controlled slides.",
    });
  }

  if (upgrades.differential === "stock" && tuneType === "drag") {
    warnings.push({
      level: "warn",
      message:
        "No differential upgrade for a drag tune — a race diff will dramatically improve launch consistency.",
    });
  }

  if (upgrades.tireCompound === "rally" && tuneType === "road") {
    warnings.push({
      level: "warn",
      message:
        "Rally tires on a road tune — these tires lack grip on tarmac, consider race or semi-slick.",
    });
  }

  // ── Info ──────────────────────────────────────────────────────────────────

  if (upgrades.springs === "sport" && upgrades.dampers === "race") {
    warnings.push({
      level: "info",
      message:
        "Sport springs with race dampers: the dampers exceed the springs' capability — consider matching upgrade levels.",
    });
  }

  if (
    highClass &&
    upgrades.aeroFront === "none" &&
    upgrades.aeroRear === "none"
  ) {
    warnings.push({
      level: "info",
      message: `${piClass} class car with no aerodynamics — you're losing significant downforce potential at high speeds.`,
    });
  }

  if (upgrades.tireCompound === "slick" && isSnowWet) {
    warnings.push({
      level: "info",
      message:
        "Slick tires in wet/snow conditions are extremely dangerous — aquaplaning and zero cold-weather grip.",
    });
  }

  if (upgrades.brakes === "stock" && power > 500) {
    warnings.push({
      level: "info",
      message: `High power (${power} hp) with stock brakes — upgrading brakes will significantly reduce stopping distances.`,
    });
  }

  return warnings;
}
