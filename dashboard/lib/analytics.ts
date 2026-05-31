/**
 * Pure analytics derivations from fetched channel data.
 *
 * Real (scraped): followers/subscribers, VIEWS (YT views + IG reel plays),
 * likes, comments, post/video counts, engagement rate, and GROWTH (computed
 * from audience snapshots stored over time).
 *
 * Not available via scraping (owner-only insights) → shown as "—":
 * IG reach/impressions, YT watch time.
 */

import { formatCompact, formatPercent } from "@/lib/format";
import type {
  AudienceSnapshot,
  ChannelData,
  KpiMetric,
  ManagedChannel,
  Post,
} from "@/types";

export const NA = "—";

function igCount(posts: Post[], type: "reel" | "carousel" | "image"): number {
  return posts.filter((p) => p.platform === "instagram" && p.postType === type)
    .length;
}
function sumLikes(posts: Post[]): number {
  return posts.reduce((a, p) => a + p.likes, 0);
}
function sumComments(posts: Post[]): number {
  return posts.reduce((a, p) => a + p.comments, 0);
}
/** Real view count across posts — YT views + IG reel/video plays. */
function sumViews(posts: Post[]): number {
  return posts.reduce((a, p) => a + p.views, 0);
}

/** Overall growth (%) since tracking began, from audience snapshots. */
export function growthPercent(history?: AudienceSnapshot[]): number | null {
  if (!history || history.length < 2) return null;
  const first = history[0].a;
  const last = history[history.length - 1].a;
  if (first <= 0) return null;
  return +(((last - first) / first) * 100).toFixed(1);
}

/** Engagement rate (%) from public data. */
function engagementRate(channel: ManagedChannel, data: ChannelData): number {
  const eng = sumLikes(data.posts) + sumComments(data.posts);
  if (channel.platform === "youtube") {
    const views = sumViews(data.posts);
    return views > 0 ? +((eng / views) * 100).toFixed(1) : 0;
  }
  if (data.audience > 0 && data.posts.length > 0) {
    const avg = eng / data.posts.length;
    return +((avg / data.audience) * 100).toFixed(1);
  }
  return 0;
}

function growthCard(history?: AudienceSnapshot[]): KpiMetric {
  const g = growthPercent(history);
  return g === null
    ? { label: "Growth", value: NA }
    : { label: "Growth", value: formatPercent(g), delta: g };
}

/** KPI cards for a single channel (section 3, individual view). */
export function buildChannelKpis(
  channel: ManagedChannel,
  data: ChannelData,
  history?: AudienceSnapshot[]
): KpiMetric[] {
  const er = engagementRate(channel, data);
  if (channel.platform === "instagram") {
    return [
      { label: "Followers", value: formatCompact(data.audience) },
      { label: "Total Views", value: formatCompact(sumViews(data.posts)) },
      { label: "Reels", value: formatCompact(igCount(data.posts, "reel")) },
      { label: "Carousels", value: formatCompact(igCount(data.posts, "carousel")) },
      { label: "Total Likes", value: formatCompact(sumLikes(data.posts)) },
      { label: "Engagement Rate", value: `${er}%` },
      growthCard(history),
      { label: "Reach", value: NA }, // owner-only insight
    ];
  }
  return [
    { label: "Subscribers", value: formatCompact(data.audience) },
    { label: "Total Views", value: formatCompact(sumViews(data.posts)) },
    {
      label: "Avg Views",
      value: formatCompact(
        data.posts.length ? Math.round(sumViews(data.posts) / data.posts.length) : 0
      ),
    },
    { label: "Total Likes", value: formatCompact(sumLikes(data.posts)) },
    { label: "Total Comments", value: formatCompact(sumComments(data.posts)) },
    { label: "Engagement Rate", value: `${er}%` },
    growthCard(history),
    { label: "Watch Time", value: NA }, // owner-only insight
  ];
}

/** Combined KPI cards for a category (or "all"). */
export function buildCategoryKpis(
  channels: ManagedChannel[],
  cache: Record<string, ChannelData>,
  histories: Record<string, AudienceSnapshot[]>
): { kpis: KpiMetric[]; loaded: number; total: number } {
  const enabled = channels.filter((c) => c.enabled);
  const loadedChannels = enabled.filter((c) => cache[c.id]);
  const allPosts = loadedChannels.flatMap((c) => cache[c.id].posts);

  const igFollowers = loadedChannels
    .filter((c) => c.platform === "instagram")
    .reduce((a, c) => a + cache[c.id].audience, 0);
  const ytSubs = loadedChannels
    .filter((c) => c.platform === "youtube")
    .reduce((a, c) => a + cache[c.id].audience, 0);

  const rates = loadedChannels.map((c) => engagementRate(c, cache[c.id]));
  const avgEng = rates.length
    ? +(rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1)
    : 0;

  const growths = loadedChannels
    .map((c) => growthPercent(histories[c.id]))
    .filter((g): g is number => g !== null);
  const avgGrowth = growths.length
    ? +(growths.reduce((a, b) => a + b, 0) / growths.length).toFixed(1)
    : null;

  const kpis: KpiMetric[] = [
    { label: "Total Followers", value: formatCompact(igFollowers) },
    { label: "Total Subscribers", value: formatCompact(ytSubs) },
    { label: "Total Views", value: formatCompact(sumViews(allPosts)) },
    { label: "Content Published", value: formatCompact(allPosts.length) },
    { label: "Avg Engagement", value: `${avgEng}%` },
    avgGrowth === null
      ? { label: "Growth Rate", value: NA }
      : { label: "Growth Rate", value: formatPercent(avgGrowth), delta: avgGrowth },
    { label: "Total Reach", value: NA }, // owner-only insight
    { label: "Total Watch Time", value: NA }, // owner-only insight
  ];

  return { kpis, loaded: loadedChannels.length, total: enabled.length };
}

/** Time series for the performance chart (views — plays for IG, views for YT). */
export function performanceSeries(posts: Post[]): {
  metric: string;
  points: { name: string; value: number }[];
} {
  const sorted = [...posts].sort(
    (a, b) => +new Date(a.publishedDate) - +new Date(b.publishedDate)
  );
  return {
    metric: "Views",
    points: sorted.map((p) => ({
      name: formatDateShort(p.publishedDate),
      value: p.views,
    })),
  };
}

function formatDateShort(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
