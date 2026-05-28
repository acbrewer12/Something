import type { TuneResult } from "./tuner";

const KEY = "qtp-fh6-tunes";

export interface StoredTune {
  id: string;
  name: string;
  carName: string;
  piClass: string;
  drivetrain: string;
  tuneType: string;
  weather: string;
  season: string;
  results: TuneResult;
  createdAt: string;
}

export function getTunes(): StoredTune[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as StoredTune[];
  } catch {
    return [];
  }
}

export function saveTune(tune: Omit<StoredTune, "id" | "createdAt">): StoredTune {
  const full: StoredTune = {
    ...tune,
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    createdAt: new Date().toISOString(),
  };
  const tunes = getTunes();
  tunes.unshift(full);
  localStorage.setItem(KEY, JSON.stringify(tunes));
  return full;
}

export function deleteTune(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getTunes().filter((t) => t.id !== id)));
}
