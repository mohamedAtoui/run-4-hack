export function fmtDuration(sec: number): string {
  const total = Math.max(0, Math.round(sec));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Formats a pace in minutes per km as `m:ss`. */
export function fmtPace(paceMinPerKm: number | null): string {
  if (paceMinPerKm === null) return "--:--";
  return fmtDuration(paceMinPerKm * 60);
}
