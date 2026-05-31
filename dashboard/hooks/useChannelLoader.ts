"use client";

import { useCallback } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import { fetchChannelData } from "@/services/analyticsService";
import type { ManagedChannel } from "@/types";

/** Cache freshness window (ms) — matches the 15-minute auto-refresh cadence. */
const FRESH_MS = 15 * 60 * 1000;

/**
 * Centralizes scraping a channel into the store cache, with dedupe + freshness.
 * Components call `loadChannel` / `loadChannels`; loading state lives in the store.
 */
export function useChannelLoader() {
  const setChannelData = useDashboardStore((s) => s.setChannelData);
  const setLoading = useDashboardStore((s) => s.setLoading);

  const loadChannel = useCallback(
    async (channel: ManagedChannel, opts?: { force?: boolean }) => {
      const state = useDashboardStore.getState();
      const cached = state.dataCache[channel.id];
      const fresh = cached && Date.now() - cached.fetchedAt < FRESH_MS;
      if (!opts?.force && fresh) return;
      if (state.loadingIds.includes(channel.id)) return;

      setLoading(channel.id, true);
      try {
        const { audience, posts } = await fetchChannelData(channel);
        setChannelData({
          channelId: channel.id,
          audience,
          posts,
          fetchedAt: Date.now(),
        });
      } catch (err) {
        console.error(`Failed to load ${channel.name}`, err);
      } finally {
        setLoading(channel.id, false);
      }
    },
    [setChannelData, setLoading]
  );

  const loadChannels = useCallback(
    async (channels: ManagedChannel[], opts?: { force?: boolean }) => {
      await Promise.all(channels.map((c) => loadChannel(c, opts)));
    },
    [loadChannel]
  );

  return { loadChannel, loadChannels };
}
