export type Mood =
  | "checkin"
  | "streak"
  | "missed"
  | "greeting"
  | "milestone"
  | "runStart"
  | "paceFast"
  | "paceSlow"
  | "paceSteady"
  | "runFinish"
  | "weekAhead"
  | "weekBehind"
  | "weekDone";

const QUOTES: Record<Mood, string[]> = {
  greeting: [
    "Please don't call me arrogant, but I am your coach and I am a special one.",
    "I am not afraid of your excuses. I have seen bigger problems at half-time.",
    "Some coaches ask for effort. I demand it. Politely. For now.",
    "You are here. Good. That is already more than my critics expected of you.",
  ],
  checkin: [
    "You trained today. I am not surprised. I am never surprised. But I am pleased.",
    "This is what champions do when nobody is watching. Except me. I am always watching.",
    "Beautiful. The pundits said you would quit. The pundits know nothing.",
    "One session. One statement. The others are sleeping — you are working.",
    "I don't celebrate small victories. But today, maybe a small smile. Very small.",
  ],
  streak: [
    "The streak grows. The doubters shrink. This is football... I mean, life.",
    "Consistency. It is not sexy, but neither is losing. Choose consistency.",
    "You are building something special. I know special when I see it. I invented it.",
    "Day after day. Brick after brick. This is how you park the bus in front of failure.",
  ],
  missed: [
    "Yesterday you did not train. If I speak, I am in big trouble. So I say nothing. *stares*",
    "The streak is dead. But the season is long. Champions respond. So — respond.",
    "I have seen many comebacks. Yours starts today, or we have a very serious meeting.",
    "Zero days. For me, this is not a crisis. It is an opportunity for a masterclass.",
  ],
  milestone: [
    "Seven days. A week of work. The others talk. You deliver. This is the difference.",
    "This streak? This is not luck. Luck is for teams without a plan. You have a plan: me.",
    "They said it could not be done. They also said I would fail. We proved them wrong together.",
  ],
  runStart: [
    "Okay. We go. Remember: the first kilometre is a lie, the last one is the truth.",
    "The run begins. I will be watching your pace. I am always watching.",
    "Warm up is over. Now we see who you really are.",
  ],
  paceFast: [
    "Wow. Wow! Who is this athlete? Keep this pace and I will give you an interview.",
    "This pace! Even my critics would applaud. And they never applaud.",
    "Magnificent. You run like you have something to prove. Good. You do.",
  ],
  paceSlow: [
    "My grandmother moves faster, and she is very much retired. Pick it up.",
    "Are we jogging or are we sightseeing? Decide quickly.",
    "This pace is a scandal. I have seen defenders turn faster than this.",
    "If you slow down more, we will be going backwards. Physics will be embarrassed.",
  ],
  paceSteady: [
    "Steady. Controlled. Tactical. You learned this from me, obviously.",
    "Good rhythm. Boring, but good. Boring wins titles.",
    "You are managing the game. I mean the run. Keep going.",
  ],
  runFinish: [
    "Finished. You survived me for the whole session. That is the real achievement.",
    "The run is done. Go home, drink water, and think about how lucky you are to have me.",
    "Full time. Result: you, one. Sofa, nil.",
  ],
  weekAhead: [
    "You are ahead of your weekly target. Do not tell the others. Let them discover it.",
    "Ahead of schedule. This is what happens when you listen to a top, top coach.",
  ],
  weekBehind: [
    "Your weekly target is looking at you. It is not impressed. Neither am I.",
    "There are kilometres missing this week. I do not accept a bad week. I accept a response.",
  ],
  weekDone: [
    "Weekly target complete. Now I have to find something new to complain about.",
    "Target reached. You may celebrate for eleven seconds, then we go again.",
  ],
};

export function pickQuote(mood: Mood): string {
  const pool = QUOTES[mood];
  return pool[Math.floor(Math.random() * pool.length)];
}
