import { pickQuote } from "./coach";
import { startOfWeek } from "./history";

/**
 * Expected share of the weekly goal by now, assuming an even spread across the
 * seven days — used to decide whether the coach praises or complains.
 */
function expectedShare(now = new Date()): number {
  const elapsedDays = (now.getTime() - startOfWeek(now).getTime()) / 86_400_000;
  return Math.min(1, elapsedDays / 7);
}

export function weeklyMood(doneKm: number, goalKm: number) {
  if (doneKm >= goalKm) return "weekDone" as const;
  return doneKm / goalKm >= expectedShare()
    ? ("weekAhead" as const)
    : ("weekBehind" as const);
}

export function weeklyLine(doneKm: number, goalKm: number): string {
  return pickQuote(weeklyMood(doneKm, goalKm));
}
