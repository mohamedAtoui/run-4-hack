import {
  ELEVENLABS_API_KEY,
  ELEVENLABS_VOICE_ID,
  TTS_PROXY_ENDPOINT,
} from "./elevenlabs";

let currentAudio: HTMLAudioElement | null = null;

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
  let res = await requestViaProxy(text);
  if (!res.ok && ELEVENLABS_API_KEY) res = await requestDirect(text);
  if (!res.ok) throw new Error(`ElevenLabs error ${res.status}`);
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
    console.warn("ElevenLabs TTS failed, falling back to browser speech", err);
  }
  await speakWithBrowser(text);
}
