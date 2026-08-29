import {
  ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID,
  TTS_PROXY_ENDPOINT,
} from "./elevenlabs";

let currentAudio: HTMLAudioElement | null = null;

/**
 * Set once the proxy has proven absent (the dev server has no serverless
 * function runtime, so `/api/tts` is a plain 404). Without this every spoken
 * line pays for a doomed round trip before falling back.
 */
let proxyUnavailable = false;

/** Keeps the diagnostic below to one line per distinct cause. */
const reported = new Set<string>();

/** Marks an error whose cause `reportOnce` has already explained. */
const EXPLAINED = Symbol("explained");

/**
 * Explains a failure once, in terms the reader can act on. The usual causes
 * are indistinguishable in the console otherwise: a 401 from a key that lacks
 * the `text_to_speech` permission looks the same as a revoked one.
 */
function reportOnce(reason: string, detail?: string) {
  const key = `${reason}|${detail ?? ""}`;
  if (reported.has(key)) return;
  reported.add(key);
  console.warn(
    `[voice] ElevenLabs unavailable - using the browser voice instead. ${reason}` +
      (detail ? ` (${detail})` : ""),
  );
}

/** Requests audio from the server proxy, which holds the API key. */
function requestViaProxy(text: string): Promise<Response> {
  return fetch(TTS_PROXY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceId: ELEVENLABS_VOICE_ID }),
  });
}

/** Local-development fallback: calls ElevenLabs with a client-side key. */
function requestDirect(text: string): Promise<Response> {
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.6 },
      }),
    },
  );
}

async function speakWithElevenLabs(text: string): Promise<void> {
  // The proxy is the normal path; a direct key only works when one is set.
  let res: Response | null = proxyUnavailable ? null : await requestViaProxy(text);

  // 404/405 means there is no function serving this route at all (the usual
  // case under `vite dev`), so stop asking for the rest of the session.
  if (res && (res.status === 404 || res.status === 405)) {
    proxyUnavailable = true;
    reportOnce(
      "No /api/tts function is serving this origin, so the request went straight to ElevenLabs.",
      "expected under `npm run dev`; deploy to Vercel to exercise the proxy",
    );
    res = null;
  }

  if ((!res || !res.ok) && ELEVENLABS_API_KEY) res = await requestDirect(text);

  if (!res) {
    throw new Error(
      "No ElevenLabs route available: /api/tts is missing and VITE_ELEVENLABS_API_KEY is unset",
    );
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    reportOnce(
      res.status === 401
        ? "The API key was rejected. In the ElevenLabs dashboard, give it the `text_to_speech` permission (a key with no permissions returns 401 for every call)."
        : `The request failed with status ${res.status}.`,
      detail.slice(0, 300) || undefined,
    );
    throw Object.assign(new Error(`ElevenLabs error ${res.status}`), {
      [EXPLAINED]: true,
    });
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  currentAudio?.pause();
  const audio = new Audio(url);
  currentAudio = audio;
  await audio.play();
  await new Promise<void>((resolve) => {
    audio.addEventListener(
      "ended",
      () => {
        URL.revokeObjectURL(url);
        resolve();
      },
      { once: true },
    );
  });
}

function speakWithBrowser(text: string): Promise<void> {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 0.8;
  window.speechSynthesis.cancel();
  return new Promise<void>((resolve) => {
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export async function speak(text: string): Promise<void> {
  // Always try ElevenLabs first: the proxy may serve it even with no local key.
  try {
    await speakWithElevenLabs(text);
    return;
  } catch (err) {
    // Recognised causes are already explained in full above; only report the
    // rest (network errors, blocked autoplay) so the console does not carry a
    // vaguer duplicate of a message it just printed.
    if (!(err instanceof Error && EXPLAINED in err)) {
      reportOnce("The request could not be completed.", String(err));
    }
  }
  await speakWithBrowser(text);
}
