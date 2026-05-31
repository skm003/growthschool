/**
 * InstagramService — SERVER ONLY (imported by app/api/channel route).
 * Scrapes a single Instagram profile (stats + recent posts) via Apify when
 * USE_APIFY=true; otherwise returns empty data.
 *
 * TODO: Connect Instagram Graph API for private metrics (reach, impressions,
 *       profile visits, saves, shares) — scraping cannot provide those.
 */

import { isApifyEnabled, runActor } from "./apify";
import { mapInstagram, type RawIgItem } from "@/lib/apifyMappers";
import type { Category, InstagramPost } from "@/types";

const IG_ACTOR = "apify~instagram-scraper";

const profileUrl = (username: string) =>
  `https://www.instagram.com/${username.replace(/^@/, "")}/`;

export const instagramService = {
  /** Fetch a profile's audience + recent posts. */
  async fetchByIdentifier(
    identifier: string,
    channelId: string,
    category: Category
  ): Promise<{ audience: number; posts: InstagramPost[] }> {
    if (!isApifyEnabled()) return { audience: 0, posts: [] };

    // `posts` mode + addParentData gives BOTH real play counts (videoPlayCount)
    // and the parent profile's follower count in a single run.
    const items = await runActor<RawIgItem>(IG_ACTOR, {
      directUrls: [profileUrl(identifier)],
      resultsType: "posts",
      resultsLimit: 30,
      addParentData: true,
    });
    const { channel, posts } = mapInstagram(items, {
      channelId,
      contentType: category,
    });
    return { audience: channel.audience, posts };
  },
};
