"use client";

import { useMemo } from "react";
import { LayoutGrid, SearchX } from "lucide-react";
import { ContentGrid } from "./ContentGrid";
import { ContentFilters } from "./ContentFilters";
import { SearchBar } from "./SearchBar";
import { EmptyState } from "./EmptyState";
import { Card } from "@/components/ui/Card";
import { useDashboardStore } from "@/store/dashboardStore";
import { applyFilters } from "@/services/analyticsService";

/**
 * (5) Channel Content Panel — right side (~70%).
 * Shows ONLY the selected channel's posts (from the store cache), with
 * filters/search/sort. Data is loaded when the channel is selected.
 */
export function ContentPanel() {
  const channels = useDashboardStore((s) => s.channels);
  const selectedChannelId = useDashboardStore((s) => s.selectedChannelId);
  const dataCache = useDashboardStore((s) => s.dataCache);
  const loadingIds = useDashboardStore((s) => s.loadingIds);
  const filters = useDashboardStore((s) => s.filters);

  const selectedChannel = useMemo(
    () => channels.find((c) => c.id === selectedChannelId) ?? null,
    [channels, selectedChannelId]
  );

  const data = selectedChannelId ? dataCache[selectedChannelId] : undefined;
  const loading = selectedChannelId
    ? loadingIds.includes(selectedChannelId)
    : false;

  const visiblePosts = useMemo(
    () => (data ? applyFilters(data.posts, filters) : []),
    [data, filters]
  );

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <div className="space-y-3 border-b border-border p-4">
        <div>
          <h2 className="text-sm font-semibold">
            {selectedChannel ? selectedChannel.name : "Channel Content"}
          </h2>
          <p className="text-xs text-muted">
            {selectedChannel
              ? loading
                ? "Loading content…"
                : `${visiblePosts.length} item${visiblePosts.length === 1 ? "" : "s"}`
              : "Select a channel to begin"}
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <SearchBar />
          <ContentFilters />
        </div>
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto p-4">
        {!selectedChannel ? (
          <EmptyState
            icon={<LayoutGrid size={20} />}
            title="No channel selected"
            description="Select a channel from the left panel to view its posts and analytics."
          />
        ) : loading && !data ? (
          <ContentSkeleton />
        ) : visiblePosts.length === 0 ? (
          <EmptyState
            icon={<SearchX size={20} />}
            title="No content available"
            description="No posts match the current filters for this channel."
          />
        ) : (
          <ContentGrid posts={visiblePosts} />
        )}
      </div>
    </Card>
  );
}

function ContentSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-border bg-card"
        >
          <div className="aspect-video w-full rounded-t-xl bg-black/5 dark:bg-white/5" />
          <div className="space-y-2 p-3">
            <div className="h-3 w-3/4 rounded bg-black/5 dark:bg-white/5" />
            <div className="h-3 w-1/2 rounded bg-black/5 dark:bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
