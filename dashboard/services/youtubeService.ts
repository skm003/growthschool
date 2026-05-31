/**
 * YouTubeService — SERVER ONLY (imported by app/api/channel route).
 * Scrapes a single YouTube channel (stats + recent videos) via Apify when
 * USE_APIFY=true; otherwise returns empty data.
 *
 * TODO: Connect YouTube Analytics API for private metrics (watch time,
 *       average view duration) — scraping cannot provide those.
 */

import { isApifyEnabled, runActor } from "./apify";
import { mapYoutube, type RawYtVideo } from "@/lib/apifyMappers";
import type { Category, YouTubePost } from "@/types";

const YT_ACTOR = "streamers~youtube-scraper";

/** Build a /videos URL from a handle ("@x"), bare handle, or full URL. */
function videosUrl(identifier: string): string {
  let base = identifier.trim();
  if (!/^https?:\/\//i.test(base)) {
    if (!base.startsWith("@")) base = `@${base}`;
    base = `https://www.youtube.com/${base}`;
  }
  return base.replace(/\/+$/, "").replace(/\/videos$/, "") + "/videos";
}

export const youtubeService = {
  /** Fetch a channel's audience + recent videos. */
  async fetchByIdentifier(
    identifier: string,
    channelId: string,
    category: Category
  ): Promise<{ audience: number; posts: YouTubePost[] }> {
    if (!isApifyEnabled()) return { audience: 0, posts: [] };

    const items = await runActor<RawYtVideo>(YT_ACTOR, {
      startUrls: [{ url: videosUrl(identifier) }],
      maxResults: 30,
    });
    const { channel, posts } = mapYoutube(items, {
      channelId,
      contentType: category,
    });
    return { audience: channel.audience, posts };
  },
};
