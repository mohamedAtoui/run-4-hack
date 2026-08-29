import type { Mood } from "./coach";
import applause from "./assets/coach-applause.webp";
import deadpan from "./assets/coach-deadpan.webp";
import furious from "./assets/coach-furious.webp";
import pointing from "./assets/coach-pointing.webp";
import smug from "./assets/coach-smug.webp";

const IMAGES: Record<Mood, string> = {
  greeting: deadpan,
  checkin: smug,
  streak: smug,
  milestone: applause,
  missed: furious,
  runStart: pointing,
  paceFast: applause,
  paceSlow: furious,
  paceSteady: deadpan,
  runFinish: applause,
  weekAhead: smug,
  weekBehind: furious,
  weekDone: applause,
};

export function coachImage(mood: Mood): string {
  return IMAGES[mood];
}
