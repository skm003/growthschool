"use client";

import { useEffect, useMemo, useRef } from "react";
import { ContentTypeDropdown } from "@/components/layout/ContentTypeDropdown";
import { SectionNav } from "@/components/layout/SectionNav";
import { RefreshBar } from "@/components/layout/RefreshBar";
import { IndividualAnalytics } from "@/components/analytics/IndividualAnalytics";
import { CategoryAnalytics } from "@/components/analytics/CategoryAnalytics";
import { ChannelListPanel } from "@/components/channels/ChannelListPanel";
import { ContentPanel } from "@/components/content/ContentPanel";
import { useDashboardStore } from "@/store/dashboardStore";
import { useChannelLoader } from "@/hooks/useChannelLoader";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import type { ContentType } from "@/types";

/** Auto-sync cadence: re-scrape every channel once an hour. */
const AUTO_REFRESH_MS = 60 * 60 * 1000;

/**
 * Top-level dashboard orchestrator (rendered by every content-type route).
 * - Channels come from the persisted store (seeded with the pre-configured list).
 * - Selecting a channel shows ITS analytics + posts.
 * - Otherwise the category/All combined analytics are shown.
 */
export function DashboardView({ contentType }: { contentType: ContentType }) {
  const hydrated = useStoreHydrated();

  const channels = useDashboardStore((s) => s.channels);
  const selectedChannelId = useDashboardStore((s) => s.selectedChannelId);
  const dataCache = useDashboardStore((s) => s.dataCache);
  const audienceHistory = useDashboardStore((s) => s.audienceHistory);
  const loadingIds = useDashboardStore((s) => s.loadingIds);
  const lastUpdated = useDashboardStore((s) => s.lastUpdated);
  const selectChannel = useDashboardStore((s) => s.selectChannel);

  const { loadChannel, loadChannels } = useChannelLoader();
  const didInitialSync = useRef(false);

  // Reset selection when switching content-type view (show category analytics).
  useEffect(() => {
    selectChannel(null);
  }, [contentType, selectChannel]);

  // Initial auto-sync: once hydrated, fetch every enabled channel so the
  // dashboard shows live data immediately — no manual loading needed.
  useEffect(() => {
    if (!hydrated || didInitialSync.current) return;
    didInitialSync.current = true;
    const enabled = useDashboardStore.getState().channels.filter((c) => c.enabled);
    if (enabled.length) void loadChannels(enabled);
  }, [hydrated, loadChannels]);

  // Hourly auto-sync: force re-scrape every enabled channel.
  useEffect(() => {
    const id = setInterval(() => {
      const enabled = useDashboardStore
        .getState()
        .channels.filter((c) => c.enabled);
      if (enabled.length) void loadChannels(enabled, { force: true });
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [loadChannels]);

  const scopeChannels = useMemo(() => {
    const enabled = channels.filter((c) => c.enabled);
    if (contentType === "all") return enabled;
    return enabled.filter((c) => c.category === contentType);
  }, [channels, contentType]);

  const scopeLabel =
    contentType === "all"
      ? "All Channels"
      : contentType === "podcast"
        ? "Podcast"
        : "Talking Head";

  const selectedChannel = useMemo(
    () => channels.find((c) => c.id === selectedChannelId) ?? null,
    [channels, selectedChannelId]
  );
  const selectedData = selectedChannelId
    ? dataCache[selectedChannelId]
    : undefined;

  const scopeLoadingCount = scopeChannels.filter((c) =>
    loadingIds.includes(c.id)
  ).length;
  const refreshing = loadingIds.length > 0;

  const handleRefresh = () => {
    if (selectedChannel) {
      void loadChannel(selectedChannel, { force: true });
      return;
    }
    const cached = scopeChannels.filter((c) => dataCache[c.id]);
    void loadChannels(cached.length ? cached : scopeChannels, { force: true });
  };

  const handleLoadAll = () => {
    void loadChannels(scopeChannels);
  };

  if (!hydrated) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6">
      {/* Sticky bar: section nav + content-type + refresh */}
      <div className="sticky top-16 z-30 -mx-4 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionNav ready={hydrated} />
          <div className="flex flex-wrap items-end gap-4">
            <ContentTypeDropdown value={contentType} />
            <RefreshBar
              lastUpdated={lastUpdated}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          </div>
        </div>
      </div>

      {/* (3) Analytics — individual when a channel is selected, else category */}
      {selectedChannel ? (
        selectedData ? (
          <IndividualAnalytics
            channel={selectedChannel}
            data={selectedData}
            history={audienceHistory[selectedChannel.id]}
          />
        ) : (
          <AnalyticsLoading label={`Loading ${selectedChannel.name}…`} />
        )
      ) : (
        <CategoryAnalytics
          scopeLabel={scopeLabel}
          channels={scopeChannels}
          cache={dataCache}
          histories={audienceHistory}
          loadingCount={scopeLoadingCount}
          onLoadAll={handleLoadAll}
        />
      )}

      {/* Main: (4) channel list 30% + (5) content panel 70% */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        <div className="lg:col-span-3 lg:h-[calc(100vh-10rem)] lg:sticky lg:top-32">
          <ChannelListPanel />
        </div>
        <div className="lg:col-span-7 lg:h-[calc(100vh-10rem)]">
          <ContentPanel />
        </div>
      </div>
    </div>
  );
}

function AnalyticsLoading({ label }: { label?: string }) {
  return (
    <div className="space-y-3">
      {label && <p className="text-sm text-muted">{label}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 py-6">
      <AnalyticsLoading />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        <div className="h-96 animate-pulse rounded-xl border border-border bg-card lg:col-span-3" />
        <div className="h-96 animate-pulse rounded-xl border border-border bg-card lg:col-span-7" />
      </div>
    </div>
  );
}
