/**
 * Central type definitions for the Analytics Dashboard.
 * These mirror the shape of data the real Instagram Graph API and
 * YouTube Data API will eventually return, so the service layer can
 * swap mock JSON for live responses without changing any component.
 */

export type Platform = "instagram" | "youtube";

/** Content Type categories (dropdown #2) used for routing/filtering. */
export type ContentType = "all" | "talking-head" | "podcast" | "behaviour";

export type InstagramPostType = "reel" | "carousel" | "image";

export type SortOption = "newest" | "oldest" | "most-viewed" | "most-engaged";

/** A connected social channel (Instagram account or YouTube channel). */
export interface Channel {
  id: string;
  platform: Platform;
  /** @handle for Instagram, channel name for YouTube. */
  name: string;
  contentType: ContentType;
  /** Followers (Instagram) or subscribers (YouTube). */
  audience: number;
  avatarUrl?: string;
  /** Scrape identifier: IG username or YouTube channel URL/handle (live mode). */
  identifier?: string;
}

/** Base fields shared by every piece of content. */
interface BasePost {
  id: string;
  channelId: string;
  platform: Platform;
  thumbnailUrl: string;
  likes: number;
  comments: number;
  /** ISO date string. */
  publishedDate: string;
}

export interface InstagramPost extends BasePost {
  platform: "instagram";
  postType: InstagramPostType;
  caption: string;
  /** Play count for reels/videos (0 for images/carousels). */
  views: number;
  reach: number;
  shares: number;
  saves: number;
}

export interface YouTubePost extends BasePost {
  platform: "youtube";
  title: string;
  views: number;
  /** Total watch time in hours. */
  watchTimeHours: number;
  shares: number;
  /** Duration in seconds. */
  durationSeconds: number;
}

export type Post = InstagramPost | YouTubePost;

/** Aggregated analytics rendered as KPI cards in section (3). */
export interface AnalyticsSummary {
  instagram: {
    totalFollowers: number;
    totalReach: number;
    totalImpressions: number;
    totalProfileVisits: number;
    totalEngagements: number;
    totalPosts: number;
    totalReels: number;
    totalCarousels: number;
  };
  youtube: {
    totalSubscribers: number;
    totalViews: number;
    totalWatchTimeHours: number;
    totalVideos: number;
    averageWatchDurationSeconds: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
  };
  combined: {
    totalContentPublished: number;
    totalAudienceSize: number;
    totalEngagementRate: number;
    averageViewsPerContent: number;
    bestPerformingPlatform: Platform;
    growthPercentage: number;
  };
}

/** Active filters for the content panel (section 5). */
export interface ContentFilters {
  platform: Platform | "all";
  postType: InstagramPostType | "all";
  sortBy: SortOption;
  search: string;
}

/** Shape of a single KPI card. */
export interface KpiMetric {
  label: string;
  value: string;
  /** Optional period-over-period delta, e.g. +12.4 (%). */
  delta?: number;
}

/** Category a channel is filed under (subset of ContentType used by management). */
export type Category = "podcast" | "talking-head";

/**
 * A user-managed channel entry. This is the persisted source of truth
 * (stored in the browser) — users add/edit/delete these from the UI.
 * Live metrics are fetched on demand and cached separately.
 */
export interface ManagedChannel {
  id: string;
  platform: Platform;
  /** Display name shown in the UI (e.g. "@vaibhavsisinty.ig"). */
  name: string;
  /** Full profile/channel URL. */
  url: string;
  /** Scrape identifier: IG username (no @) or YT handle ("@x"). */
  identifier: string;
  category: Category;
  /** Disabled channels are hidden from analytics but kept in the list. */
  enabled: boolean;
}

/** Fetched + derived data for a single channel (cached in the store). */
export interface ChannelData {
  channelId: string;
  /** Followers (IG) or subscribers (YT). */
  audience: number;
  posts: Post[];
  /** epoch ms when this was fetched. */
  fetchedAt: number;
}

/** A point-in-time audience reading, used to compute real growth over time. */
export interface AudienceSnapshot {
  /** epoch ms. */
  t: number;
  /** audience (followers/subscribers) at that time. */
  a: number;
}
