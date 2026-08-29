import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { pickQuote, type Mood } from "./coach";
import { speak } from "./voice";
import {
  checkIn,
  checkedInToday,
  loadState,
  missedYesterday,
  type StreakState,
} from "./streak";
import { RunMode } from "./RunMode";
import { CoachTalk } from "./CoachTalk";
import { RunHistory } from "./RunHistory";
import { WeeklyGoal } from "./WeeklyGoal";
import { weeklyLine } from "./weekly";
import { useWeekBoundary } from "./useWeekBoundary";
import {
  loadRuns,
  loadWeeklyGoal,
  saveRun,
  saveWeeklyGoal,
  weeklyKm,
  type RunRecord,
} from "./history";
import { CLERK_ENABLED } from "./clerk";
import "./App.css";

function moodFor(state: StreakState): Mood {
  if (checkedInToday(state)) {
    if (state.streak > 0 && state.streak % 7 === 0) return "milestone";
    return state.streak >= 3 ? "streak" : "checkin";
  }
  if (missedYesterday(state)) return "missed";
  return "greeting";
}

function Home() {
  const [state, setState] = useState<StreakState>(loadState);
  const [running, setRunning] = useState(false);
  const [quote, setQuote] = useState(() => pickQuote(moodFor(loadState())));
  const [runs, setRuns] = useState<RunRecord[]>(loadRuns);
  const [goalKm, setGoalKm] = useState<number>(loadWeeklyGoal);

  const weekStart = useWeekBoundary();
  const doneKm = weeklyKm(runs, weekStart);

  const done = checkedInToday(state);

  const handleCheckIn = () => {
    const next = checkIn(state);
    setState(next);
    const line = pickQuote(moodFor(next));
    setQuote(line);
    void speak(line);
  };

  const finishRun = (run: RunRecord) => {
    setRunning(false);
    const nextRuns = saveRun(run);
    setRuns(nextRuns);
    if (!checkedInToday(state)) setState(checkIn(state));
    setQuote(weeklyLine(weeklyKm(nextRuns), goalKm));
  };

  const changeGoal = (km: number) => setGoalKm(saveWeeklyGoal(km));

  if (running) return <RunMode onFinish={finishRun} streak={state.streak} />;

  return (
    <>
      <div className="coach-card">
        <div className="coach-avatar">🧥</div>
        <p className="coach-line">“{quote}”</p>
        <p className="coach-name">— The Special Coach</p>
      </div>

      <div className="streak-row">
        <div className="stat">
          <span className="stat-value">{state.streak} 🔥</span>
          <span className="stat-label">streak</span>
        </div>
        <div className="stat">
          <span className="stat-value">{state.best}</span>
          <span className="stat-label">best</span>
        </div>
        <div className="stat">
          <span className="stat-value">{state.totalWorkouts}</span>
          <span className="stat-label">workouts</span>
        </div>
      </div>

      <WeeklyGoal doneKm={doneKm} goalKm={goalKm} onChangeGoal={changeGoal} />

      <button className="btn btn-primary" onClick={() => setRunning(true)}>
        Start a run 🏃
      </button>
      <button className="btn" onClick={handleCheckIn} disabled={done}>
        {done ? "Trained today ✓" : "I trained today (no run)"}
      </button>
      <CoachTalk
        elapsedSec={0}
        distanceKm={0}
        paceMinPerKm={null}
        streak={state.streak}
      />
      <RunHistory runs={runs} />
    </>
  );
}

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Special One Run Club</h1>
        {CLERK_ENABLED && (
          <SignedIn>
            <UserButton />
          </SignedIn>
        )}
      </header>
      {CLERK_ENABLED ? (
        <>
          <SignedOut>
            <div className="coach-card">
              <p className="coach-line">
                “Sign in. I do not coach anonymous people.”
              </p>
              <SignInButton mode="modal">
                <button className="btn btn-primary">Sign in</button>
              </SignInButton>
            </div>
          </SignedOut>
          <SignedIn>
            <Home />
          </SignedIn>
        </>
      ) : (
        <Home />
      )}
    </div>
  );
}
