/**
 * Returns a short-lived signed URL for the Conversational AI agent, so the
 * agent can be made private and the API key never reaches the browser.
 *
 * The client reads this via VITE_ELEVENLABS_SIGNED_URL_ENDPOINT.
 */
export const config = { runtime: "edge" };

export default async function handler(): Promise<Response> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return new Response(
      JSON.stringify({
        error: "ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID must be configured",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    { headers: { "xi-api-key": apiKey } },
  );

  if (!upstream.ok) {
    return new Response(
      JSON.stringify({ error: `ElevenLabs error ${upstream.status}` }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  const data: { signed_url?: string } = await upstream.json();
  if (!data.signed_url) {
    return new Response(
      JSON.stringify({ error: "No signed_url in ElevenLabs response" }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ signedUrl: data.signed_url }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
