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
      maxVideos: 30,
      maxShorts: 30,
    });
    
    // Debug: Log the raw response
    console.log(`[YouTube Apify] ${identifier}: Received ${items.length} items`);
    if (items.length > 0) {
      console.log(`  First item:`, JSON.stringify(items[0], null, 2));
      const withSubs = items.filter(item => item.numberOfSubscribers || item.subscribers || item.subscriberCount);
      if (withSubs.length > 0) {
        console.log(`  Items with subscriber count: ${withSubs.length}`);
      }
    }
    
    const { channel, posts } = mapYoutube(items, {
      channelId,
      contentType: category,
    });
    return { audience: channel.audience, posts };
  },
};
