export interface StreakState {
  streak: number;
  best: number;
  lastCheckIn: string | null; // YYYY-MM-DD
  totalWorkouts: number;
}

const KEY = "mourinho-streak";

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

export function loadState(): StreakState {
  const raw = localStorage.getItem(KEY);
  const state: StreakState = raw
    ? JSON.parse(raw)
    : { streak: 0, best: 0, lastCheckIn: null, totalWorkouts: 0 };
  // A missed day breaks the streak.
  if (
    state.lastCheckIn &&
    state.lastCheckIn !== todayKey() &&
    state.lastCheckIn !== yesterdayKey()
  ) {
    state.streak = 0;
  }
  return state;
}

export function checkedInToday(state: StreakState): boolean {
  return state.lastCheckIn === todayKey();
}

export function missedYesterday(state: StreakState): boolean {
  return state.lastCheckIn !== null && state.streak === 0;
}

export function checkIn(state: StreakState): StreakState {
  if (checkedInToday(state)) return state;
  const next: StreakState = {
    streak: state.streak + 1,
    best: Math.max(state.best, state.streak + 1),
    lastCheckIn: todayKey(),
    totalWorkouts: state.totalWorkouts + 1,
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
