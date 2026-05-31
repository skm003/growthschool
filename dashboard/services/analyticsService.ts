/**
 * AnalyticsService — CLIENT-SAFE facade.
 * Components call this; it fetches the app's own /api/channel route, which
 * holds the Apify token server-side. Swapping mock/live needs no UI changes.
 *
 * Also exports the pure filter/sort/search helper used by the content panel.
 */

import type { ContentFilters, ManagedChannel, Post } from "@/types";

/** Fetch one channel's audience + posts (scraped live when USE_APIFY=true). */
export async function fetchChannelData(
  channel: ManagedChannel
): Promise<{ audience: number; posts: Post[] }> {
  const res = await fetch("/api/channel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      platform: channel.platform,
      identifier: channel.identifier,
      channelId: channel.id,
      category: channel.category,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch channel data (${res.status})`);
  }
  return (await res.json()) as { audience: number; posts: Post[] };
}

/* ------------------------------------------------------------------ *
 * Pure client-side filtering/sorting/searching for the content grid.
 * ------------------------------------------------------------------ */

function engagementOf(post: Post): number {
  if (post.platform === "instagram") {
    return post.likes + post.comments + post.shares + post.saves;
  }
  return post.likes + post.comments + post.shares;
}

function viewsOf(post: Post): number {
  // Both platforms now carry a real view count (IG = reel/video plays).
  return post.views;
}

function searchHaystack(post: Post): string {
  const text = post.platform === "instagram" ? post.caption : post.title;
  return text.toLowerCase();
}

export function applyFilters(posts: Post[], filters: ContentFilters): Post[] {
  let result = [...posts];

  if (filters.platform !== "all") {
    result = result.filter((p) => p.platform === filters.platform);
  }
  if (filters.postType !== "all") {
    result = result.filter(
      (p) => p.platform === "instagram" && p.postType === filters.postType
    );
  }
  const q = filters.search.trim().toLowerCase();
  if (q) {
    result = result.filter((p) => searchHaystack(p).includes(q));
  }

  switch (filters.sortBy) {
    case "newest":
      result.sort((a, b) => +new Date(b.publishedDate) - +new Date(a.publishedDate));
      break;
    case "oldest":
      result.sort((a, b) => +new Date(a.publishedDate) - +new Date(b.publishedDate));
      break;
    case "most-viewed":
      result.sort((a, b) => viewsOf(b) - viewsOf(a));
      break;
    case "most-engaged":
      result.sort((a, b) => engagementOf(b) - engagementOf(a));
      break;
  }
  return result;
}
