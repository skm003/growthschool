import type { Platform } from "@/types";

/** Detect platform from a URL, or null if it's neither IG nor YT. */
export function detectPlatform(url: string): Platform | null {
  const u = url.toLowerCase();
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  return null;
}

/**
 * Parse a profile/channel URL into a scrape identifier + a display name.
 * - Instagram: identifier = username (no @); name = "@username".
 * - YouTube:   identifier = "@handle" (or the URL for /channel/ links);
 *              name = "@handle" or "Channel".
 */
export function parseChannelUrl(
  rawUrl: string,
  platform: Platform
): { identifier: string; name: string } | null {
  const url = rawUrl.trim();
  if (!url) return null;

  if (platform === "instagram") {
    const m = url.match(/instagram\.com\/([^/?#]+)/i);
    if (!m) return null;
    const username = m[1].replace(/^@/, "");
    if (!username || username === "p" || username === "reel") return null;
    return { identifier: username, name: `@${username}` };
  }

  // YouTube
  const handle = url.match(/youtube\.com\/(@[^/?#]+)/i);
  if (handle) {
    return { identifier: handle[1], name: handle[1] };
  }
  const channelId = url.match(/youtube\.com\/channel\/([^/?#]+)/i);
  if (channelId) {
    // Keep the full URL as the identifier for /channel/ links.
    return { identifier: url, name: "YouTube Channel" };
  }
  return null;
}

/** Validate that a URL belongs to the expected platform. */
export function isValidChannelUrl(url: string, platform: Platform): boolean {
  return parseChannelUrl(url, platform) !== null;
}
