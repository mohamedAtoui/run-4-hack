import { useEffect, useRef, useState } from "react";
import { pickQuote, type Mood } from "./coach";
import { speak } from "./voice";
import { useRun } from "./useRun";
import { CoachTalk } from "./CoachTalk";
import type { RunRecord } from "./history";
import { fmtDuration, fmtPace } from "./format";

const COMMENT_INTERVAL_SEC = 45;
const FAST_PACE = 5.5; // min/km — faster than this earns praise
const SLOW_PACE = 8; // min/km — slower than this gets roasted

export function RunMode({
  onFinish,
  streak,
}: {
  onFinish: (run: RunRecord) => void;
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
    onFinish({
      date: new Date().toISOString(),
      distanceKm: stats.distanceKm,
      durationSec: stats.elapsedSec,
      paceMinPerKm:
        stats.distanceKm > 0
          ? stats.elapsedSec / 60 / stats.distanceKm
          : null,
    });
  };

  return (
    <div className="run-mode">
      <div className="run-stats">
        <div className="stat">
          <span className="stat-value">{fmtDuration(stats.elapsedSec)}</span>
          <span className="stat-label">time</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.distanceKm.toFixed(2)}</span>
          <span className="stat-label">km</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {fmtPace(stats.paceMinPerKm)} /km
          </span>
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
