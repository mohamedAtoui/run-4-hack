# Special One Run Club

Duolingo-style motivation app for sports, coached by a José Mourinho-inspired character. Put on your headphones, start a run, and the coach reacts to your pace — praise when you fly, roasts when you slack.

## Features

- **Run mode**: GPS pace tracking with spoken commentary every ~45s based on your pace.
- **Voice**: ElevenLabs TTS when `VITE_ELEVENLABS_API_KEY` is set; browser speech synthesis fallback otherwise.
- **Talk back (speech-to-speech)**: hold a live voice conversation with the coach via ElevenLabs Conversational AI when `VITE_ELEVENLABS_AGENT_ID` is set. The persona prompt (`src/persona.ts`) is sent as a session override, so the agent stays in character and gets your live run stats. For private agents set `VITE_ELEVENLABS_SIGNED_URL_ENDPOINT` to a backend route returning `{ signedUrl }`.
- **Auth**: Clerk sign-in when `VITE_CLERK_PUBLISHABLE_KEY` is set; open access otherwise.
- **"José" wake word**: during a run the app listens (Web Speech API, Chrome) and whatever you say after "José" is answered out loud — rain, breathing, cramps, pace, motivation are matched to coach answers in `src/advice.ts`; anything else gets a generic Mourinho reply. Listening pauses while he is talking.
- **Coach face**: a reaction photo matched to the coach's mood (`src/coachImage.ts`) — headphones off when you slow down, asleep at the desk when you skip a day, finger to the lips on a streak.
- **Streaks**: daily check-ins, streak/best/total counters (localStorage), mood-based coach messages.

## Setup

```bash
npm install
cp .env.example .env   # fill in keys (optional)
npm run dev
```

### ElevenLabs API key permissions

ElevenLabs keys are scoped per-permission, and a freshly created key may have
none enabled. The coach needs:

| Permission | Used by | Without it |
| --- | --- | --- |
| `text_to_speech` | spoken quotes and run commentary | every call 401s and the app falls back to the browser voice |

The speech-to-speech coach does **not** need a key as long as the agent is
public (see below) — the browser gets its own short-lived token.

To check a key before blaming the app:

```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  -H "xi-api-key: $VITE_ELEVENLABS_API_KEY" \
  https://api.elevenlabs.io/v1/user
```

`200` means the key is good; `401` means it is missing permissions, and the
response body names which one.

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
