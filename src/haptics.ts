/** Short vibration patterns, so the phone confirms taps you cannot look at mid-run. */
const PATTERNS = {
  tap: 10,
  start: [0, 40, 60, 40],
  finish: [0, 90, 60, 90, 60, 160],
} satisfies Record<string, number | number[]>;

export function buzz(pattern: keyof typeof PATTERNS) {
  navigator.vibrate?.(PATTERNS[pattern]);
}
