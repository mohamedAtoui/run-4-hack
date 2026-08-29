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
import { weeklyMood } from "./weekly";
import { CoachFace } from "./CoachFace";
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
import { MicToggle } from "./MicToggle";
import { useWakeWord, type WakeState } from "./useWakeWord";
import { adviseOn } from "./advice";
import { TabBar, type Tab } from "./TabBar";
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
  const [tab, setTab] = useState<Tab>("home");
  const [running, setRunning] = useState(false);
  const [mood, setMood] = useState<Mood>(() => moodFor(loadState()));
  const [quote, setQuote] = useState(() => pickQuote(moodFor(loadState())));
  const [runs, setRuns] = useState<RunRecord[]>(loadRuns);
  const [goalKm, setGoalKm] = useState<number>(loadWeeklyGoal);
  const [micOn, setMicOn] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [question, setQuestion] = useState("");

  const wake = useWakeWord({
    enabled: micOn && !running,
    paused: speaking,
    onQuestion: (asked) => {
      setQuestion(asked);
      const advice = adviseOn(asked);
      setMood(advice.mood);
      setQuote(advice.line);
      setSpeaking(true);
      void speak(advice.line)
        .catch(() => undefined)
        .finally(() => setSpeaking(false));
    },
  });

  const weekStart = useWeekBoundary();
  const doneKm = weeklyKm(runs, weekStart);

  const done = checkedInToday(state);

  const handleCheckIn = () => {
    const next = checkIn(state);
    setState(next);
    const nextMood = moodFor(next);
    const line = pickQuote(nextMood);
    setMood(nextMood);
    setQuote(line);
    void speak(line);
  };

  const finishRun = (run: RunRecord) => {
    setRunning(false);
    setTab("history");
    const nextRuns = saveRun(run);
    setRuns(nextRuns);
    if (!checkedInToday(state)) setState(checkIn(state));
    const nextMood = weeklyMood(weeklyKm(nextRuns), goalKm);
    setMood(nextMood);
    setQuote(pickQuote(nextMood));
  };

  const changeGoal = (km: number) => setGoalKm(saveWeeklyGoal(km));

  if (running) return <RunMode onFinish={finishRun} streak={state.streak} />;

  return (
    <>
      <div className="tab-page">
        {tab === "home" && (
          <HomeTab
            state={state}
            mood={mood}
            quote={quote}
            micOn={micOn}
            onToggleMic={() => setMicOn((on) => !on)}
            wakeState={wake.state}
            speaking={speaking}
            question={question}
            done={done}
            onCheckIn={handleCheckIn}
          />
        )}
        {tab === "run" && (
          <RunTab
            doneKm={doneKm}
            goalKm={goalKm}
            onChangeGoal={changeGoal}
            onStart={() => setRunning(true)}
            streak={state.streak}
          />
        )}
        {tab === "history" && <HistoryTab runs={runs} />}
      </div>
      <TabBar tab={tab} onSelect={setTab} />
    </>
  );
}

function HomeTab({
  state,
  mood,
  quote,
  micOn,
  onToggleMic,
  wakeState,
  speaking,
  question,
  done,
  onCheckIn,
}: {
  state: StreakState;
  mood: Mood;
  quote: string;
  micOn: boolean;
  onToggleMic: () => void;
  wakeState: WakeState;
  speaking: boolean;
  question: string;
  done: boolean;
  onCheckIn: () => void;
}) {
  return (
    <>
      <div className="coach-card">
        <CoachFace mood={mood} />
        <p className="coach-line">“{quote}”</p>
        <p className="coach-name">— José Mourinho</p>
      </div>

      <MicToggle
        listening={micOn}
        onToggle={onToggleMic}
        state={wakeState}
        speaking={speaking}
        question={question}
      />

      <div className="card streak-row">
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

      <div className="action-bar">
        <button className="btn" onClick={onCheckIn} disabled={done}>
          {done ? "Trained today ✓" : "I trained today (no run)"}
        </button>
      </div>
    </>
  );
}

function RunTab({
  doneKm,
  goalKm,
  onChangeGoal,
  onStart,
  streak,
}: {
  doneKm: number;
  goalKm: number;
  onChangeGoal: (km: number) => void;
  onStart: () => void;
  streak: number;
}) {
  return (
    <>
      <div className="card">
        <WeeklyGoal doneKm={doneKm} goalKm={goalKm} onChangeGoal={onChangeGoal} />
      </div>
      <div className="action-bar">
        <button className="btn btn-primary btn-hero" onClick={onStart}>
          Start a run 🏃
        </button>
      </div>
      <CoachTalk
        elapsedSec={0}
        distanceKm={0}
        paceMinPerKm={null}
        streak={streak}
      />
    </>
  );
}

function HistoryTab({ runs }: { runs: RunRecord[] }) {
  if (runs.length === 0) {
    return (
      <div className="card empty-state">
        <p className="coach-line">
          “No runs. An empty page. Even my substitutes have more minutes.”
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <RunHistory runs={runs} />
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>
          Special One <span>Run Club</span>
        </h1>
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
