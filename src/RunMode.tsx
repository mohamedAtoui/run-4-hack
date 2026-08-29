import { useEffect, useRef, useState } from "react";
import { pickQuote, type Mood } from "./coach";
import { speak } from "./voice";
import { useRun } from "./useRun";
import { CoachTalk } from "./CoachTalk";

const COMMENT_INTERVAL_SEC = 45;
const FAST_PACE = 5.5; // min/km — faster than this earns praise
const SLOW_PACE = 8; // min/km — slower than this gets roasted

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fmtPace(p: number | null): string {
  if (p === null) return "--:--";
  const m = Math.floor(p);
  const s = Math.round((p - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")} /km`;
}

export function RunMode({
  onFinish,
  streak,
}: {
  onFinish: () => void;
  streak: number;
}) {
  const { stats, start, stop } = useRun();
  const [lastLine, setLastLine] = useState("");
  const lastCommentAt = useRef(0);

  const say = (mood: Mood) => {
    const line = pickQuote(mood);
    setLastLine(line);
    void speak(line);
  };

  useEffect(() => {
    start();
    say("runStart");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!stats.running) return;
    if (stats.elapsedSec - lastCommentAt.current < COMMENT_INTERVAL_SEC) return;
    lastCommentAt.current = stats.elapsedSec;
    const pace = stats.paceMinPerKm;
    if (pace === null) say("paceSteady");
    else if (pace < FAST_PACE) say("paceFast");
    else if (pace > SLOW_PACE) say("paceSlow");
    else say("paceSteady");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.elapsedSec]);

  const finish = () => {
    stop();
    say("runFinish");
    onFinish();
  };

  return (
    <div className="run-mode">
      <div className="run-stats">
        <div className="stat">
          <span className="stat-value">{fmtTime(stats.elapsedSec)}</span>
          <span className="stat-label">time</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.distanceKm.toFixed(2)}</span>
          <span className="stat-label">km</span>
        </div>
        <div className="stat">
          <span className="stat-value">{fmtPace(stats.paceMinPerKm)}</span>
          <span className="stat-label">pace</span>
        </div>
      </div>
      {stats.gpsError && (
        <p className="gps-error">GPS: {stats.gpsError} — pace commentary limited.</p>
      )}
      {lastLine && <p className="coach-line">“{lastLine}”</p>}
      <CoachTalk
        elapsedSec={stats.elapsedSec}
        distanceKm={stats.distanceKm}
        paceMinPerKm={stats.paceMinPerKm}
        streak={streak}
      />
      <button className="btn btn-danger" onClick={finish}>
        Finish run
      </button>
    </div>
  );
}
