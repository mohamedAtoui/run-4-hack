import { useEffect, useRef, useState } from "react";
import { pickQuote, type Mood } from "./coach";
import { speak } from "./voice";
import { useRun } from "./useRun";
import { CoachTalk } from "./CoachTalk";
import type { RunRecord } from "./history";
import { fmtDuration, fmtPace } from "./format";
import { CoachFace } from "./CoachFace";
import { adviseOn } from "./advice";
import { useWakeWord } from "./useWakeWord";
import { MicToggle } from "./MicToggle";
import { useWakeLock } from "./useWakeLock";

const COMMENT_INTERVAL_SEC = 45;
const FAST_PACE = 5.5; // min/km — faster than this earns praise
const SLOW_PACE = 8; // min/km — slower than this gets roasted
const SIGN_OFF_TIMEOUT_MS = 6000;

export function RunMode({
  onFinish,
  streak,
}: {
  onFinish: (run: RunRecord) => void;
  streak: number;
}) {
  const { stats, start, stop } = useRun();
  const [lastLine, setLastLine] = useState("");
  const [mood, setMood] = useState<Mood>("runStart");
  const [speaking, setSpeaking] = useState(false);
  const [question, setQuestion] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const lastCommentAt = useRef(0);
  const speakingRef = useRef(false);

  useWakeLock(stats.running);

  const deliver = (nextMood: Mood, line: string): Promise<void> => {
    setMood(nextMood);
    setLastLine(line);
    speakingRef.current = true;
    setSpeaking(true);
    return speak(line)
      .catch(() => undefined)
      .finally(() => {
        speakingRef.current = false;
        setSpeaking(false);
      });
  };

  const say = (nextMood: Mood) => void deliver(nextMood, pickQuote(nextMood));

  const wake = useWakeWord({
    enabled: micOn,
    paused: speaking,
    onQuestion: (asked) => {
      setQuestion(asked);
      const advice = adviseOn(asked);
      void deliver(advice.mood, advice.line);
    },
  });

  useEffect(() => {
    start();
    say("runStart");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!stats.running) return;
    if (stats.elapsedSec - lastCommentAt.current < COMMENT_INTERVAL_SEC) return;
    if (speakingRef.current) return; // never talk over an answer he is giving

    lastCommentAt.current = stats.elapsedSec;
    const pace = stats.paceMinPerKm;
    if (pace === null) say("paceSteady");
    else if (pace < FAST_PACE) say("paceFast");
    else if (pace > SLOW_PACE) say("paceSlow");
    else say("paceSteady");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.elapsedSec]);

  // Stays mounted until the sign-off finishes so his last reaction is actually seen.
  const finish = () => {
    stop();
    setFinishing(true);
    const run: RunRecord = {
      date: new Date().toISOString(),
      distanceKm: stats.distanceKm,
      durationSec: stats.elapsedSec,
      paceMinPerKm:
        stats.distanceKm > 0
          ? stats.elapsedSec / 60 / stats.distanceKm
          : null,
    };
    // The run is saved even if speech stalls — the sign-off only buys it a moment on screen.
    const spoken = deliver("runFinish", pickQuote("runFinish"));
    const capped = new Promise<void>((resolve) =>
      window.setTimeout(resolve, SIGN_OFF_TIMEOUT_MS),
    );
    void Promise.race([spoken, capped]).then(() => onFinish(run));
  };

  return (
    <div className="run-mode">
      <div className="run-hero">
        <span className="run-clock">{fmtDuration(stats.elapsedSec)}</span>
        <div className="run-splits">
          <div className="stat">
            <span className="stat-value">{stats.distanceKm.toFixed(2)}</span>
            <span className="stat-label">km</span>
          </div>
          <div className="stat">
            <span className="stat-value">{fmtPace(stats.paceMinPerKm)}</span>
            <span className="stat-label">pace /km</span>
          </div>
        </div>
      </div>
      {stats.gpsError && (
        <p className="gps-error">GPS: {stats.gpsError} — pace commentary limited.</p>
      )}
      <div className="coach-card run-coach">
        <CoachFace mood={mood} />
        {lastLine && <p className="coach-line">“{lastLine}”</p>}
      </div>
      <MicToggle
        listening={micOn}
        onToggle={() => setMicOn((on) => !on)}
        state={wake.state}
        speaking={speaking}
        question={question}
      />
      <CoachTalk
        elapsedSec={stats.elapsedSec}
        distanceKm={stats.distanceKm}
        paceMinPerKm={stats.paceMinPerKm}
        streak={streak}
      />
      <div className="action-bar">
        <button
          className="btn btn-danger"
          onClick={finish}
          disabled={finishing}
        >
          {finishing ? "Wrapping up…" : "Finish run"}
        </button>
      </div>
    </div>
  );
}
