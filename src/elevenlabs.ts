export const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as
  | string
  | undefined;

export const ELEVENLABS_VOICE_ID =
  (import.meta.env.VITE_ELEVENLABS_VOICE_ID as string | undefined) ??
  "JBFqnCBsd6RMkjVDRZzb";

/** Conversational AI agent used for the speech-to-speech coach. */
export const ELEVENLABS_AGENT_ID = import.meta.env
  .VITE_ELEVENLABS_AGENT_ID as string | undefined;

/**
 * Endpoint returning `{ signedUrl }` for private agents. Required only when the
 * agent is not public; keeps the API key off the client.
 */
export const ELEVENLABS_SIGNED_URL_ENDPOINT = import.meta.env
  .VITE_ELEVENLABS_SIGNED_URL_ENDPOINT as string | undefined;

export const CONVERSATION_ENABLED = Boolean(ELEVENLABS_AGENT_ID);

export async function fetchSignedUrl(): Promise<string> {
  const res = await fetch(ELEVENLABS_SIGNED_URL_ENDPOINT!);
  if (!res.ok) throw new Error(`Signed URL request failed (${res.status})`);
  const data: { signedUrl?: string; signed_url?: string } = await res.json();
  const url = data.signedUrl ?? data.signed_url;
  if (!url) throw new Error("Signed URL response missing signedUrl");
  return url;
}
