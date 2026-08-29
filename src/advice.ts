import type { Mood } from "./coach";

export interface Advice {
  mood: Mood;
  line: string;
}

interface Topic {
  match: RegExp;
  mood: Mood;
  lines: string[];
}

/** Keyword-matched coach answers, used when no live ElevenLabs agent is configured. */
const TOPICS: Topic[] = [
  {
    match: /rain|wet|storm|snow|cold|freezing|wind/,
    mood: "paceSteady",
    lines: [
      "It is raining? Beautiful. Rain is the referee that separates the serious from the tourists. Shorter steps, no puddle heroics, keep going.",
      "Bad weather is not a problem, it is a filter. Everybody else is on the sofa. Slow down five percent, watch your footing, finish the job.",
    ],
  },
  {
    match: /breath|breathe|breathing|out of breath|can'?t breathe|winded|lungs/,
    mood: "paceSlow",
    lines: [
      "Breathe in for three steps, out for two. Nose in, mouth out. If you cannot say my name in one breath, you are running too fast for today.",
      "Relax the shoulders, drop the jaw, three steps in, two steps out. Panic is for defenders in the last minute, not for you.",
    ],
  },
  {
    match: /tired|exhausted|heavy|dying|quit|stop|give up|done/,
    mood: "missed",
    lines: [
      "Tired? Of course you are tired, you are working. Two more minutes at this pace, then you decide. You will not decide to stop. I know you.",
      "Everybody is tired. The difference is what you do in the ninety-third minute. Shorten the stride, lift the eyes, keep the rhythm.",
    ],
  },
  {
    match: /cramp|stitch|pain|hurt|knee|ankle|injur/,
    mood: "paceSlow",
    lines: [
      "Pain is not the same as effort. Walk it out, breathe deep, and if it is still there tomorrow you see a doctor, not a coach.",
      "Slow to a walk. A cramp is your body writing me a very rude letter. Water, salt, patience — we go again another day.",
    ],
  },
  {
    match: /hill|climb|uphill|stairs/,
    mood: "paceSteady",
    lines: [
      "The hill is not your enemy, it is your sparring partner. Small steps, quick feet, eyes at the top. Do not look at your shoes, they are not interesting.",
      "Up the hill you lose pace and you gain character. Keep the effort even, not the speed. The clock can wait.",
    ],
  },
  {
    match: /motivat|bored|why|lazy|mood|sad/,
    mood: "streak",
    lines: [
      "You want motivation? Motivation is for people who need permission. You already left the house. Now finish like a professional.",
      "Nobody is clapping for you right now. That is exactly why it counts. Keep going and let the results do the talking.",
    ],
  },
  {
    match: /water|drink|thirsty|hydrat|fuel|eat|food/,
    mood: "paceSteady",
    lines: [
      "Small sips, often. Do not drink like you just crossed a desert — your stomach will send a complaint mid-run.",
      "Water now, food after. Anything else and we are having a very unpleasant conversation with your stomach at kilometre five.",
    ],
  },
  {
    match: /fast|slow|pace|speed|how (fast|quick)/,
    mood: "paceFast",
    lines: [
      "Pace is a tactic, not an ego. If you cannot speak a full sentence, you are too fast. If you can sing, you are too slow.",
      "Control the first half, attack the second. Anybody can start fast; starting fast is not a plan, it is a hobby.",
    ],
  },
  {
    match: /hot|heat|sun|humid/,
    mood: "paceSteady",
    lines: [
      "In this heat you run by feel, not by watch. Slow down, take the shade, and stop being a hero for the statistics.",
      "The sun does not care about your target pace. Drink, cover your head, run the effort not the number.",
    ],
  },
];

const GENERIC: string[] = [
  "Interesting question. My answer is the same as always: keep moving, keep breathing, and stop negotiating with yourself.",
  "I could give you a long philosophical answer. I prefer a short one: next kilometre, same rhythm, no excuses.",
  "You are asking me this in the middle of a run? Good sign. It means you still have oxygen. Use it to keep going.",
];

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

/** Answers a spoken question with a coach line and the matching reaction mood. */
export function adviseOn(question: string): Advice {
  const q = question.toLowerCase();
  const topic = TOPICS.find((t) => t.match.test(q));
  if (topic) return { mood: topic.mood, line: pick(topic.lines) };
  return { mood: "greeting", line: pick(GENERIC) };
}
