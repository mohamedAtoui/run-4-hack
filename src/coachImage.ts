import type { Mood } from "./coach";
import asleep from "./assets/mou-asleep.webp";
import headphones from "./assets/mou-headphones.webp";
import presser from "./assets/mou-presser.webp";
import shush from "./assets/mou-shush.webp";
import smirk from "./assets/mou-smirk.webp";
import stare from "./assets/mou-stare.webp";
import steady from "./assets/mou-steady.webp";

const IMAGES: Record<Mood, string> = {
  greeting: presser,
  checkin: smirk,
  streak: shush,
  milestone: shush,
  missed: asleep,
  runStart: stare,
  paceFast: smirk,
  paceSlow: headphones,
  paceSteady: steady,
  runFinish: smirk,
  weekAhead: shush,
  weekBehind: headphones,
  weekDone: smirk,
};

export function coachImage(mood: Mood): string {
  return IMAGES[mood];
}
