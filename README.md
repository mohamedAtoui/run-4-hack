# Special One Run Club

Duolingo-style motivation app for sports, coached by a José Mourinho-inspired character. Put on your headphones, start a run, and the coach reacts to your pace — praise when you fly, roasts when you slack.

## Features

- **Run mode**: GPS pace tracking with spoken commentary every ~45s based on your pace.
- **Voice**: ElevenLabs TTS when `VITE_ELEVENLABS_API_KEY` is set; browser speech synthesis fallback otherwise.
- **Talk back (speech-to-speech)**: hold a live voice conversation with the coach via ElevenLabs Conversational AI when `VITE_ELEVENLABS_AGENT_ID` is set. The persona prompt (`src/persona.ts`) is sent as a session override, so the agent stays in character and gets your live run stats. For private agents set `VITE_ELEVENLABS_SIGNED_URL_ENDPOINT` to a backend route returning `{ signedUrl }`.
- **Auth**: Clerk sign-in when `VITE_CLERK_PUBLISHABLE_KEY` is set; open access otherwise.
- **Coach face**: a reaction picture matched to the coach's mood. Bundled original illustrations by default; set `VITE_GIPHY_API_KEY` to pull real Mourinho reaction GIFs from Giphy instead (searched per mood, never stored in the repo).
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
