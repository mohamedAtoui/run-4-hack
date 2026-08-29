import type { Mood } from "./coach";

export const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY as
  | string
  | undefined;

export const MEMES_ENABLED = Boolean(GIPHY_API_KEY);

/** Giphy search terms per mood — real Mourinho reaction GIFs, not local art. */
const QUERIES: Record<Mood, string> = {
  greeting: "mourinho press conference",
  checkin: "mourinho nod approval",
  streak: "mourinho smug",
  milestone: "mourinho celebration",
  missed: "mourinho angry",
  runStart: "mourinho pointing touchline",
  paceFast: "mourinho celebration",
  paceSlow: "mourinho disappointed",
  paceSteady: "mourinho shrug",
  runFinish: "mourinho applause",
  weekAhead: "mourinho smug",
  weekBehind: "mourinho angry",
  weekDone: "mourinho celebration",
};

interface GiphyResponse {
  data: { images: { downsized_medium: { url: string } } }[];
}

const cache = new Map<Mood, string>();

/** Resolves a Giphy URL for the mood, or null when unavailable. */
export async function fetchMeme(mood: Mood): Promise<string | null> {
  if (!GIPHY_API_KEY) return null;
  const cached = cache.get(mood);
  if (cached) return cached;

  const url = new URL("https://api.giphy.com/v1/gifs/search");
  url.searchParams.set("api_key", GIPHY_API_KEY);
  url.searchParams.set("q", QUERIES[mood]);
  url.searchParams.set("limit", "15");
  url.searchParams.set("rating", "pg-13");

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const body = (await res.json()) as GiphyResponse;
    const gifs = body.data ?? [];
    if (gifs.length === 0) return null;

    const pick = gifs[Math.floor(Math.random() * gifs.length)];
    const src = pick.images.downsized_medium.url;
    cache.set(mood, src);
    return src;
  } catch {
    return null;
  }
}
