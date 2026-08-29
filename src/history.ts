export interface RunRecord {
  date: string; // ISO timestamp
  distanceKm: number;
  durationSec: number;
  paceMinPerKm: number | null;
}

const RUNS_KEY = "mourinho-runs";
const GOAL_KEY = "mourinho-weekly-goal";

export const DEFAULT_WEEKLY_GOAL_KM = 20;

export function loadRuns(): RunRecord[] {
  const raw = localStorage.getItem(RUNS_KEY);
  return raw ? (JSON.parse(raw) as RunRecord[]) : [];
}

export function saveRun(run: RunRecord): RunRecord[] {
  const runs = [run, ...loadRuns()].slice(0, 50);
  localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
  return runs;
}

export function loadWeeklyGoal(): number {
  const raw = localStorage.getItem(GOAL_KEY);
  const parsed = raw === null ? NaN : Number(raw);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_WEEKLY_GOAL_KM;
}

export function saveWeeklyGoal(km: number): number {
  const goal = Math.max(1, Math.round(km));
  localStorage.setItem(GOAL_KEY, String(goal));
  return goal;
}

/** Monday 00:00 of the current week, local time. */
export function startOfWeek(now = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const daysSinceMonday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - daysSinceMonday);
  return d;
}

export function weeklyKm(runs: RunRecord[], now = new Date()): number {
  const from = startOfWeek(now).getTime();
  return runs
    .filter((r) => new Date(r.date).getTime() >= from)
    .reduce((sum, r) => sum + r.distanceKm, 0);
}
