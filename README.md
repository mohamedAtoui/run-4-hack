# Special One Run Club

Duolingo-style motivation app for sports, coached by a José Mourinho-inspired character. Put on your headphones, start a run, and the coach reacts to your pace — praise when you fly, roasts when you slack.

## Features

- **Run mode**: GPS pace tracking with spoken commentary every ~45s based on your pace.
- **Voice**: ElevenLabs TTS when `VITE_ELEVENLABS_API_KEY` is set; browser speech synthesis fallback otherwise.
- **Talk back (speech-to-speech)**: hold a live voice conversation with the coach via ElevenLabs Conversational AI when `VITE_ELEVENLABS_AGENT_ID` is set. The persona prompt (`src/persona.ts`) is sent as a session override, so the agent stays in character and gets your live run stats. For private agents set `VITE_ELEVENLABS_SIGNED_URL_ENDPOINT` to a backend route returning `{ signedUrl }`.
- **Auth**: Clerk sign-in when `VITE_CLERK_PUBLISHABLE_KEY` is set; open access otherwise.
- **Streaks**: daily check-ins, streak/best/total counters (localStorage), mood-based coach messages.

## Setup

```bash
npm install
cp .env.example .env   # fill in keys (optional)
npm run dev
```

### ElevenLabs agent setup

The speech-to-speech coach sends `src/persona.ts` to the agent as a **session
override** at connect time. The agent must be configured to accept them, or it
silently falls back to its own dashboard settings and the persona is lost.

In the ElevenLabs dashboard, on the agent:

1. **Security -> Overrides**: enable `System prompt`, `First message`, and `Voice ID`.
2. **Security -> Authentication**: leave auth **disabled** (public agent), otherwise
   `VITE_ELEVENLABS_SIGNED_URL_ENDPOINT` and a backend are required.
3. **Voice**: set `kIR0B1kiG8aJ0Uv9URKI` as a fallback for when overrides are unavailable.
4. **LLM temperature**: ~0.8. The default of 0 makes the persona flat and repetitive.

## Scripts

- `npm run dev` — dev server
- `npm run build` — typecheck + production build
- `npm run lint` — oxlint
