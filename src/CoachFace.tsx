import { useEffect, useState } from "react";
import type { Mood } from "./coach";
import { coachImage } from "./coachImage";
import { fetchMeme } from "./memes";

/** Shows a real Mourinho reaction GIF when Giphy is configured, else the illustration. */
export function CoachFace({ mood }: { mood: Mood }) {
  const [memes, setMemes] = useState<Partial<Record<Mood, string>>>({});

  useEffect(() => {
    let cancelled = false;
    void fetchMeme(mood).then((src) => {
      if (src && !cancelled) setMemes((prev) => ({ ...prev, [mood]: src }));
    });
    return () => {
      cancelled = true;
    };
  }, [mood]);

  return (
    <img
      className="coach-avatar"
      src={memes[mood] ?? coachImage(mood)}
      alt="José Mourinho reacting"
    />
  );
}
