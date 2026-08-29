import { useEffect, useState } from "react";
import { startOfWeek } from "./history";

/**
 * Returns the current week's start and re-renders when the week rolls over, so
 * weekly totals reset without needing user interaction.
 */
export function useWeekBoundary(): Date {
  const [weekStart, setWeekStart] = useState(() => startOfWeek());

  useEffect(() => {
    const nextWeek = new Date(weekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const timer = window.setTimeout(
      () => setWeekStart(startOfWeek()),
      Math.max(1000, nextWeek.getTime() - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [weekStart]);

  return weekStart;
}
