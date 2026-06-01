/**
 * YouTube API Service — Official YouTube Data API v3
 * Fetches real YouTube channel statistics and recent videos using Google's API.
 * Uses forUsername lookup to resolve custom handles to channel IDs.
 */

import type { Category, YouTubePost } from "@/types";

const YT_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeChannelSnippet {
  title: string;
  description: string;
  customUrl?: string;
  profileImageUrl?: string;
  publishedAt: string;
}

interface YouTubeChannelStatistics {
  viewCount: string;
  commentCount: string;
  subscriberCount: string;
  hiddenSubscriberCount: boolean;
  videoCount: string;
}

interface YouTubeChannelResponse {
  items: Array<{
    id: string;
    snippet: YouTubeChannelSnippet;
    statistics: YouTubeChannelStatistics;
  }>;
}

interface YouTubeVideoSnippet {
  title: string;
  description: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
  publishedAt: string;
  channelTitle: string;
}

interface YouTubeVideoStatistics {
  viewCount: string;
  likeCount?: string;
  commentCount?: string;
}

interface YouTubeVideoContentDetails {
  duration: string;
}

interface YouTubeVideoResponse {
  items: Array<{
    id: string;
    snippet: YouTubeVideoSnippet;
    statistics: YouTubeVideoStatistics;
    contentDetails: YouTubeVideoContentDetails;
  }>;
}

/** Convert ISO 8601 duration to seconds. e.g., "PT10M30S" => 630 */
function parseDuration(iso8601: string): number {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/** Extract channel handle from identifier (e.g., "@Vaibhavsisinty-IG" => "Vaibhavsisinty-IG") */
function normalizeHandle(identifier: string): string {
  let handle = identifier.trim();
  if (handle.startsWith("@")) {
    handle = handle.substring(1);
  }
  return handle;
}

/**
 * Fetch channel ID from custom handle using forUsername parameter.
 * YouTube API: channels?part=id&forUsername=...
 */
async function resolveChannelIdFromHandle(
  handle: string,
  apiKey: string
): Promise<string | null> {
  try {
    const url = new URL(`${YT_API_BASE}/channels`);
    url.searchParams.set("part", "id");
    url.searchParams.set("forUsername", handle);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(
        `[YouTube API] forUsername lookup failed: ${response.status}`
      );
      return null;
    }

    const data = (await response.json()) as YouTubeChannelResponse;
    return data.items?.[0]?.id || null;
  } catch (error) {
    console.error(`[YouTube API] Error resolving handle "${handle}":`, error);
    return null;
  }
}

/**
 * Fetch channel statistics (subscribers, views, etc.)
 */
async function fetchChannelStats(
  channelId: string,
  apiKey: string
): Promise<{
  subscribers: number;
  viewCount: number;
  videoCount: number;
  avatarUrl?: string;
}> {
  try {
    const url = new URL(`${YT_API_BASE}/channels`);
    url.searchParams.set("part", "statistics,snippet");
    url.searchParams.set("id", channelId);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(
        `[YouTube API] Channel stats fetch failed: ${response.status}`
      );
      return { subscribers: 0, viewCount: 0, videoCount: 0 };
    }

    const data = (await response.json()) as YouTubeChannelResponse;
    const channel = data.items?.[0];

    if (!channel) {
      return { subscribers: 0, viewCount: 0, videoCount: 0 };
    }

    const stats = channel.statistics;
    const snippet = channel.snippet;

    return {
      subscribers: parseInt(stats.subscriberCount || "0", 10),
      viewCount: parseInt(stats.viewCount || "0", 10),
      videoCount: parseInt(stats.videoCount || "0", 10),
      avatarUrl: snippet.profileImageUrl,
    };
  } catch (error) {
    console.error(
      `[YouTube API] Error fetching channel stats for "${channelId}":`,
      error
    );
    return { subscribers: 0, viewCount: 0, videoCount: 0 };
  }
}

/**
 * Fetch recent videos from a channel (up to 20 videos)
 */
async function fetchChannelVideos(
  channelId: string,
  apiKey: string
): Promise<YouTubePost[]> {
  try {
    // First, get the uploads playlist ID
    const channelUrl = new URL(`${YT_API_BASE}/channels`);
    channelUrl.searchParams.set("part", "contentDetails");
    channelUrl.searchParams.set("id", channelId);
    channelUrl.searchParams.set("key", apiKey);

    const channelResponse = await fetch(channelUrl.toString());
    if (!channelResponse.ok) {
      console.error(
        `[YouTube API] Channel details fetch failed: ${channelResponse.status}`
      );
      return [];
    }

    const channelData = (await channelResponse.json()) as {
      items: Array<{
        contentDetails: { relatedPlaylists: { uploads: string } };
      }>;
    };
    const uploadsPlaylistId =
      channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      console.warn(
        `[YouTube API] No uploads playlist found for channel "${channelId}"`
      );
      return [];
    }

    // Fetch videos from the uploads playlist
    const playlistUrl = new URL(
      `${YT_API_BASE}/playlistItems`
    );
    playlistUrl.searchParams.set("part", "snippet,contentDetails");
    playlistUrl.searchParams.set("playlistId", uploadsPlaylistId);
    playlistUrl.searchParams.set("maxResults", "20");
    playlistUrl.searchParams.set("key", apiKey);

    const playlistResponse = await fetch(playlistUrl.toString());
    if (!playlistResponse.ok) {
      console.error(
        `[YouTube API] Playlist fetch failed: ${playlistResponse.status}`
      );
      return [];
    }

    const playlistData = (await playlistResponse.json()) as {
      items: Array<{ contentDetails: { videoId: string } }>;
    };
    const videoIds = playlistData.items
      ?.map((item) => item.contentDetails.videoId)
      .filter(Boolean) as string[];

    if (!videoIds || videoIds.length === 0) {
      return [];
    }

    // Fetch video statistics
    const videosUrl = new URL(`${YT_API_BASE}/videos`);
    videosUrl.searchParams.set("part", "snippet,statistics,contentDetails");
    videosUrl.searchParams.set("id", videoIds.join(","));
    videosUrl.searchParams.set("key", apiKey);

    const videosResponse = await fetch(videosUrl.toString());
    if (!videosResponse.ok) {
      console.error(
        `[YouTube API] Videos fetch failed: ${videosResponse.status}`
      );
      return [];
    }

    const videosData = (await videosResponse.json()) as YouTubeVideoResponse;

    return videosData.items
      .map((video) => ({
        id: video.id,
        channelId: channelId,
        platform: "youtube" as const,
        title: video.snippet.title,
        thumbnailUrl:
          video.snippet.thumbnails.high?.url ||
          video.snippet.thumbnails.medium?.url ||
          video.snippet.thumbnails.default?.url ||
          "",
        publishedDate: video.snippet.publishedAt,
        views: parseInt(video.statistics.viewCount || "0", 10),
        likes: parseInt(video.statistics.likeCount || "0", 10),
        comments: parseInt(video.statistics.commentCount || "0", 10),
        shares: 0, // YouTube API doesn't expose share count
        watchTimeHours: 0, // Would need YouTube Analytics API
        durationSeconds: parseDuration(video.contentDetails.duration),
      }))
      .sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime()
      );
  } catch (error) {
    console.error(
      `[YouTube API] Error fetching videos for channel "${channelId}":`,
      error
    );
    return [];
  }
}

export const youtubeApiService = {
  /**
   * Fetch a channel's audience + recent videos using official YouTube API.
   * @param identifier - Channel handle (e.g., "@Vaibhavsisinty-IG") or channel ID
   * @param channelId - Channel ID (from ManagedChannel), used as fallback
   * @param category - Content category for posts
   * @returns Channel subscriber count and recent videos
   */
  async fetchByIdentifier(
    identifier: string,
    channelId: string,
    category: Category
  ): Promise<{ audience: number; posts: YouTubePost[] }> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.warn(
        "[YouTube API] YOUTUBE_API_KEY not configured. Set it in environment variables."
      );
      return { audience: 0, posts: [] };
    }

    // Normalize handle: remove @ prefix if present
    const handle = normalizeHandle(identifier);

    // Try to resolve channel ID from handle
    let resolvedChannelId: string | null = null;

    // If identifier looks like a handle (contains alphanumerics, -, _)
    if (/^[@\w\-]+$/.test(identifier)) {
      console.log(
        `[YouTube API] Resolving channel from handle: "${handle}"`
      );
      resolvedChannelId = await resolveChannelIdFromHandle(handle, apiKey);
    }

    // Fallback to channelId from config if resolution failed
    const finalChannelId = resolvedChannelId || channelId;

    if (!finalChannelId) {
      console.error(
        `[YouTube API] Could not resolve channel ID from "${identifier}"`
      );
      return { audience: 0, posts: [] };
    }

    console.log(
      `[YouTube API] Fetching data for channel: ${finalChannelId}`
    );

    // Fetch channel stats and videos in parallel
    const [stats, videos] = await Promise.all([
      fetchChannelStats(finalChannelId, apiKey),
      fetchChannelVideos(finalChannelId, apiKey),
    ]);

    console.log(
      `[YouTube API] ${identifier}: ${stats.subscribers} subscribers, ${videos.length} videos`
    );

    return {
      audience: stats.subscribers,
      posts: videos,
    };
  },
};
