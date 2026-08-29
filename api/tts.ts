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
    // Pass the status through, plus the reason when ElevenLabs gives a
    // machine-readable one. `detail.status` is an enum-like string such as
    // "missing_permissions" or "quota_exceeded", and for auth failures the
    // message names the missing permission - both are about the key, not the
    // account, so they are safe to surface and are the only way a caller can
    // tell a misconfigured key from an outage. Nothing else is forwarded.
    // A 401 here is *our* key failing upstream, not the caller being
    // unauthenticated, so report it as a gateway failure rather than passing
    // 401 down to the browser.
    return new Response(`ElevenLabs error ${upstream.status}: ${await failureReason(upstream)}`, {
      status: upstream.status === 401 ? 502 : upstream.status,
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

/**
 * Extracts a short, non-sensitive reason from an ElevenLabs error response.
 * Never returns the raw body, which can carry account details.
 */
async function failureReason(res: Response): Promise<string> {
  try {
    const body: { detail?: { status?: unknown; message?: unknown; type?: unknown } } =
      await res.json();
    const detail = body.detail ?? {};
    const status = typeof detail.status === "string" ? detail.status : null;
    // The message is only echoed for auth failures, where it names the
    // permission the key is missing.
    const message =
      detail.type === "authentication_error" && typeof detail.message === "string"
        ? detail.message.slice(0, 200)
        : null;
    return [status, message].filter(Boolean).join(" - ") || "no reason given";
  } catch {
    return "no reason given";
  }
}
