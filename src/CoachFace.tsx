import type { Mood } from "./coach";
import { coachImage } from "./coachImage";

/** The coach's reaction photo for the current mood. */
export function CoachFace({ mood }: { mood: Mood }) {
  return (
    <img
      className="coach-avatar"
      src={coachImage(mood)}
      alt="José Mourinho reacting"
    />
  );
}
