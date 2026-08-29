import type { RunRecord } from "./history";
import { fmtDuration, fmtPace } from "./format";

export function RunHistory({ runs }: { runs: RunRecord[] }) {
  if (runs.length === 0) return null;

  return (
    <div className="run-history">
      <span className="stat-label">recent runs</span>
      <ul>
        {runs.slice(0, 5).map((run) => (
          <li key={run.date}>
            <span>
              {new Date(run.date).toLocaleDateString(undefined, {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
            </span>
            <span>{run.distanceKm.toFixed(2)} km</span>
            <span>{fmtDuration(run.durationSec)}</span>
            <span>{fmtPace(run.paceMinPerKm)} /km</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
