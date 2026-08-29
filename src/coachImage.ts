import type { Mood } from "./coach";
import applause from "./assets/coach-applause.webp";
import asleep from "./assets/coach-asleep.webp";
import despair from "./assets/coach-despair.webp";
import proud from "./assets/coach-proud.webp";
import rant from "./assets/coach-rant.webp";
import smirk from "./assets/coach-smirk.webp";
import stare from "./assets/coach-stare.webp";

const IMAGES: Record<Mood, string> = {
  greeting: stare,
  checkin: smirk,
  streak: proud,
  milestone: applause,
  missed: asleep,
  runStart: rant,
  paceFast: proud,
  paceSlow: despair,
  paceSteady: stare,
  runFinish: applause,
  weekAhead: proud,
  weekBehind: despair,
  weekDone: smirk,
};

export function coachImage(mood: Mood): string {
  return IMAGES[mood];
}
