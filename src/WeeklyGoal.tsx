export function WeeklyGoal({
  doneKm,
  goalKm,
  onChangeGoal,
}: {
  doneKm: number;
  goalKm: number;
  onChangeGoal: (km: number) => void;
}) {
  const pct = Math.min(100, (doneKm / goalKm) * 100);

  return (
    <div className="weekly-goal">
      <div className="weekly-header">
        <span className="stat-label">this week</span>
        <span>
          {doneKm.toFixed(1)} / {goalKm} km
        </span>
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="goal-controls">
        <button
          className="btn btn-small"
          onClick={() => onChangeGoal(goalKm - 5)}
          disabled={goalKm <= 5}
        >
          −5 km
        </button>
        <button className="btn btn-small" onClick={() => onChangeGoal(goalKm + 5)}>
          +5 km
        </button>
      </div>
    </div>
  );
}
