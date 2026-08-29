# Special One Run Club

Duolingo-style motivation app for sports, coached by a José Mourinho-inspired character. Put on your headphones, start a run, and the coach reacts to your pace — praise when you fly, roasts when you slack.

## Features

- **Run mode**: GPS pace tracking with spoken commentary every ~45s based on your pace.
- **Voice**: ElevenLabs TTS when `VITE_ELEVENLABS_API_KEY` is set; browser speech synthesis fallback otherwise.
- **Auth**: Clerk sign-in when `VITE_CLERK_PUBLISHABLE_KEY` is set; open access otherwise.
- **Streaks**: daily check-ins, streak/best/total counters (localStorage), mood-based coach messages.

## Setup

```bash
npm install
cp .env.example .env   # fill in keys (optional)
npm run dev
```

## Scripts

- `npm run dev` — dev server
- `npm run build` — typecheck + production build
- `npm run lint` — oxlint
