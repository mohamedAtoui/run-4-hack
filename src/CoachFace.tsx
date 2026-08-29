import type { Mood } from "./coach";
import { coachImage } from "./coachImage";

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The coach's reaction photo for the current mood, optionally ringed by weekly
 * goal progress (0–1) so the week reads at a glance instead of as a flat bar.
 */
export function CoachFace({
  mood,
  progress,
}: {
  mood: Mood;
  progress?: number;
}) {
  const face = (
    <img
      className="coach-avatar"
      src={coachImage(mood)}
      alt="José Mourinho reacting"
    />
  );

  if (progress === undefined) return face;

  const done = Math.max(0, Math.min(1, progress));

  return (
    <div className="coach-ring">
      <svg viewBox="0 0 184 184" aria-hidden="true">
        <circle className="ring-track" cx="92" cy="92" r={RADIUS} />
        <circle
          className="ring-fill"
          cx="92"
          cy="92"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - done)}
        />
      </svg>
      {face}
    </div>
  );
}
