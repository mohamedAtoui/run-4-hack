/**
 * Proxies text-to-speech so the ElevenLabs API key stays on the server.
 *
 * Reads ELEVENLABS_API_KEY (no VITE_ prefix — that prefix would inline the
 * value into the client bundle, which is exactly what this endpoint avoids).
 */
export const config = { runtime: "edge" };

const DEFAULT_VOICE_ID = "kIR0B1kiG8aJ0Uv9URKI";
const MAX_TEXT_LENGTH = 1000;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return new Response("ELEVENLABS_API_KEY is not configured", {
      status: 500,
    });
  }

  let body: { text?: unknown; voiceId?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return new Response("Missing text", { status: 400 });
  // Bound the request so an abusive caller cannot spend the whole quota at once.
  if (text.length > MAX_TEXT_LENGTH) {
    return new Response(`Text exceeds ${MAX_TEXT_LENGTH} characters`, {
      status: 413,
    });
  }

  const voiceId =
    typeof body.voiceId === "string" && /^[A-Za-z0-9]+$/.test(body.voiceId)
      ? body.voiceId
      : DEFAULT_VOICE_ID;

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.6 },
      }),
    },
  );

  if (!upstream.ok) {
    // Pass the status through, but never the upstream body: it can echo
    // account details back to the browser.
    return new Response(`ElevenLabs error ${upstream.status}`, {
      status: upstream.status === 401 ? 500 : upstream.status,
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
