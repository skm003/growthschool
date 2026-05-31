/**
 * Apify client — SERVER ONLY.
 * Runs an Apify actor synchronously and returns its dataset items.
 * The token is read from APIFY_API_TOKEN and must never reach the browser,
 * so this module is only imported from route handlers under app/api/**.
 *
 * Docs: https://docs.apify.com/api/v2#/reference/actors/run-actor-synchronously-with-input-and-get-dataset-items
 */

const APIFY_BASE = "https://api.apify.com/v2";

function getToken(): string {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not set in the environment.");
  }
  return token;
}

/** True when live scraping is enabled (set USE_APIFY=true in .env.local). */
export function isApifyEnabled(): boolean {
  return process.env.USE_APIFY === "true" && !!process.env.APIFY_API_TOKEN;
}

/**
 * Run an actor and return its dataset items.
 * @param actorId e.g. "apify~instagram-scraper" (use ~ instead of /)
 * @param input   the actor's input object
 */
export async function runActor<T = unknown>(
  actorId: string,
  input: Record<string, unknown>
): Promise<T[]> {
  const token = getToken();
  const url = `${APIFY_BASE}/acts/${actorId}/run-sync-get-dataset-items?token=${token}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    // Scrapes can take a while; don't let Next cache the response.
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Apify actor ${actorId} failed (${res.status}): ${text}`);
  }

  return (await res.json()) as T[];
}
