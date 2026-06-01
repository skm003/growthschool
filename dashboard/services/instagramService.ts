/**
 * InstagramService — SERVER ONLY (imported by app/api/channel route).
 * Fetches data via the official Instagram Graph API (Business Discovery) when
 * INSTAGRAM_ACCESS_TOKEN is configured; otherwise falls back to scraping via Apify.
 */

import { isApifyEnabled, runActor } from "./apify";
import { mapInstagram, type RawIgItem } from "@/lib/apifyMappers";
import type { Category, InstagramPost } from "@/types";

const IG_ACTOR = "apify~instagram-scraper";

const profileUrl = (username: string) =>
  `https://www.instagram.com/${username.replace(/^@/, "")}/`;

/**
 * Retrieve the user's connected Instagram Business Account ID from their Facebook Pages.
 */
async function getInstagramBusinessAccountId(accessToken: string): Promise<string> {
  const url = `https://graph.facebook.com/v20.0/me/accounts?fields=instagram_business_account&access_token=${accessToken}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch Facebook accounts: ${res.statusText}`);
  }
  const data = await res.json();
  const page = data.data?.find((p: any) => p.instagram_business_account?.id);
  if (!page) {
    throw new Error(
      "No connected Instagram Business Account found linked to your Facebook Page. " +
      "Please make sure your Instagram Creator/Business account is connected to a Facebook Page."
    );
  }
  return page.instagram_business_account.id;
}

export const instagramService = {
  /** Fetch a profile's audience + recent posts. */
  async fetchByIdentifier(
    identifier: string,
    channelId: string,
    category: Category
  ): Promise<{ audience: number; posts: InstagramPost[] }> {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (accessToken) {
      console.log(`[Instagram API] Using official Graph API (Business Discovery) for "${identifier}"`);
      try {
        const businessAccountId = await getInstagramBusinessAccountId(accessToken);
        const username = identifier.replace(/^@/, "").trim();

        // Business Discovery query
        const fields = `business_discovery.username(${username}){followers_count,media_count,media.limit(30){caption,media_url,media_type,permalink,timestamp,like_count,comments_count}}`;
        const url = `https://graph.facebook.com/v20.0/${businessAccountId}?fields=${encodeURIComponent(
          fields
        )}&access_token=${accessToken}`;

        const res = await fetch(url);
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Instagram Graph API error: ${res.statusText} (${errText})`);
        }

        const data = await res.json();
        const disc = data.business_discovery;
        if (!disc) {
          throw new Error(`No business discovery data returned for ${username}`);
        }

        const posts: InstagramPost[] = (disc.media?.data || []).map((m: any) => {
          let postType: InstagramPost["postType"] = "image";
          if (m.media_type === "VIDEO") {
            postType = "reel";
          } else if (m.media_type === "CAROUSEL_ALBUM") {
            postType = "carousel";
          }

          return {
            id: m.id,
            channelId,
            platform: "instagram",
            thumbnailUrl: m.media_url || "",
            postType,
            caption: m.caption || "",
            views: 0, // Business Discovery does not return view/play counts for public media
            reach: 0,
            likes: m.like_count || 0,
            comments: m.comments_count || 0,
            shares: 0,
            saves: 0,
            publishedDate: m.timestamp ? m.timestamp.slice(0, 10) : "",
          };
        });

        return {
          audience: disc.followers_count || 0,
          posts,
        };
      } catch (error) {
        console.error(
          `[Instagram API] Graph API request failed for "${identifier}". Falling back to Apify.`,
          error
        );
      }
    }

    // Apify Fallback
    if (!isApifyEnabled()) return { audience: 0, posts: [] };

    console.log(`[Instagram API] Running Apify scraper for "${identifier}"`);
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
