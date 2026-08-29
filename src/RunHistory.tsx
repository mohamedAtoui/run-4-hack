import type { RunRecord } from "./history";

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtPace(p: number | null): string {
  if (p === null) return "--:--";
  const m = Math.floor(p);
  const s = Math.round((p - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

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
