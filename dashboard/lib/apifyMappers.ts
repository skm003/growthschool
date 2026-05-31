/**
 * Maps raw Apify actor output -> the dashboard's domain types.
 * Schemas verified against:
 *   - apify/instagram-scraper   (resultsType "details")
 *   - streamers/youtube-scraper
 *
 * NOTE: Private metrics (IG reach/impressions/profileVisits/saves/shares,
 * YT watchTime/averageWatchDuration) are NOT available via scraping and are
 * set to 0 here. They require the official APIs with account ownership/OAuth.
 */

import type {
  Channel,
  ContentType,
  InstagramPost,
  YouTubePost,
} from "@/types";

/* ----------------------------- Raw shapes ----------------------------- */

/**
 * One item from apify/instagram-scraper in `posts` mode with addParentData:true.
 * Each post also carries the parent profile's owner/follower fields.
 */
export interface RawIgItem {
  error?: string;
  id?: string;
  shortCode?: string;
  type?: string; // "Image" | "Video" | "Sidecar"
  caption?: string;
  likesCount?: number;
  commentsCount?: number;
  /** Total plays — the number Instagram shows as "views" on reels. */
  videoPlayCount?: number;
  /** Legacy "video views" (3s+) — lower than plays; used as fallback only. */
  videoViewCount?: number;
  timestamp?: string;
  displayUrl?: string;
  // Parent profile fields (from addParentData):
  ownerUsername?: string;
  ownerFullName?: string;
  followersCount?: number | string;
}

export interface RawYtVideo {
  /** Present when the actor returns an error item (e.g. "NO_RESULTS"). */
  error?: string;
  id?: string;
  title?: string;
  viewCount?: number;
  likes?: number;
  commentsCount?: number;
  duration?: string | number; // "HH:MM:SS"
  date?: string;
  thumbnailUrl?: string;
  channelName?: string;
  numberOfSubscribers?: number;
  channelAvatarUrl?: string;
  channelUrl?: string;
}

/* ----------------------------- Helpers ----------------------------- */

/** "00:01:19" -> 79. Accepts numbers and "MM:SS"/"HH:MM:SS". */
export function parseDurationToSeconds(d: string | number | undefined): number {
  if (typeof d === "number") return Math.round(d);
  if (!d) return 0;
  const parts = d.split(":").map((n) => parseInt(n, 10));
  if (parts.some(Number.isNaN)) return 0;
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

/** ISO timestamp -> "YYYY-MM-DD". */
export function toISODate(s?: string): string {
  if (!s) return "";
  return s.slice(0, 10);
}

function igPostType(t?: string): InstagramPost["postType"] {
  if (t === "Sidecar") return "carousel";
  if (t === "Video") return "reel";
  return "image";
}

/* ----------------------------- Mappers ----------------------------- */

export function mapInstagram(
  items: RawIgItem[],
  opts: { channelId: string; contentType: ContentType }
): { channel: Channel; posts: InstagramPost[] } {
  const valid = items.filter((p) => !p.error);
  const first = valid[0] ?? {};

  const channel: Channel = {
    id: opts.channelId,
    platform: "instagram",
    name: first.ownerUsername ? `@${first.ownerUsername}` : opts.channelId,
    contentType: opts.contentType,
    audience: Number(first.followersCount ?? 0) || 0,
    identifier: first.ownerUsername,
  };

  const posts: InstagramPost[] = valid
    .filter((p) => p.id || p.shortCode)
    .map((p) => ({
      id: p.shortCode ?? p.id ?? "",
      channelId: opts.channelId,
      platform: "instagram",
      thumbnailUrl: p.displayUrl ?? "",
      postType: igPostType(p.type),
      caption: p.caption ?? "",
      // Plays = the "views" Instagram displays on reels; fall back to video views.
      views: p.videoPlayCount ?? p.videoViewCount ?? 0,
      reach: 0, // private — not scrapable
      likes: p.likesCount ?? 0,
      comments: p.commentsCount ?? 0,
      shares: 0, // private — not scrapable
      saves: 0, // private — not scrapable
      publishedDate: toISODate(p.timestamp),
    }));

  return { channel, posts };
}

export function mapYoutube(
  items: RawYtVideo[],
  opts: { channelId: string; contentType: ContentType }
): { channel: Channel; posts: YouTubePost[] } {
  // Drop error/empty items (e.g. { error: "NO_RESULTS" } for channels with no videos).
  const videos = items.filter((v) => !v.error && (v.id || v.title));
  const first = videos[0] ?? items.find((v) => v.channelName) ?? {};

  const channel: Channel = {
    id: opts.channelId,
    platform: "youtube",
    name: first.channelName ?? opts.channelId,
    contentType: opts.contentType,
    audience: first.numberOfSubscribers ?? 0,
    avatarUrl: first.channelAvatarUrl,
    identifier: first.channelUrl,
  };

  const posts: YouTubePost[] = videos.map((v) => ({
    id: v.id ?? "",
    channelId: opts.channelId,
    platform: "youtube",
    thumbnailUrl: v.thumbnailUrl ?? "",
    title: v.title ?? "",
    views: v.viewCount ?? 0,
    watchTimeHours: 0, // private — not scrapable
    likes: v.likes ?? 0,
    comments: v.commentsCount ?? 0,
    shares: 0, // private — not scrapable
    durationSeconds: parseDurationToSeconds(v.duration),
    publishedDate: toISODate(v.date),
  }));

  return { channel, posts };
}
