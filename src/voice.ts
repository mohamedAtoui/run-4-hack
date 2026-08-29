import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from "./elevenlabs";

let currentAudio: HTMLAudioElement | null = null;

async function speakWithElevenLabs(text: string): Promise<void> {
  const res = await fetch(
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
  if (!res.ok) throw new Error(`ElevenLabs error ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  currentAudio?.pause();
  currentAudio = new Audio(url);
  await currentAudio.play();
  currentAudio.addEventListener("ended", () => URL.revokeObjectURL(url));
}

function speakWithBrowser(text: string): void {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 0.8;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export async function speak(text: string): Promise<void> {
  if (ELEVENLABS_API_KEY) {
    try {
      await speakWithElevenLabs(text);
      return;
    } catch (err) {
      console.warn("ElevenLabs TTS failed, falling back to browser speech", err);
    }
  }
  speakWithBrowser(text);
}
