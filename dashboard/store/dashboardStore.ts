/**
 * Global dashboard state (Zustand + localStorage persistence).
 *
 * `channels` is the user-managed source of truth — seeded with DEFAULT_CHANNELS
 * and persisted to the browser, so add/edit/delete/move survive refreshes with
 * no code changes. Fetched per-channel metrics are cached in `dataCache`
 * (not persisted; re-fetched on load / refresh).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CHANNELS } from "@/config/channels";
import { parseChannelUrl } from "@/lib/channelUrl";
import type {
  AudienceSnapshot,
  Category,
  ChannelData,
  ContentFilters,
  ManagedChannel,
  Platform,
} from "@/types";

/** Cap on stored snapshots per channel. */
const MAX_HISTORY = 60;

const defaultFilters: ContentFilters = {
  platform: "all",
  postType: "all",
  sortBy: "newest",
  search: "",
};

export interface AddChannelInput {
  platform: Platform;
  category: Category;
  url: string;
  /** Optional; derived from the URL when empty. */
  name?: string;
}

interface DashboardState {
  channels: ManagedChannel[];
  selectedChannelId: string | null;
  filters: ContentFilters;
  dataCache: Record<string, ChannelData>;
  /** Audience snapshots per channel (persisted) — powers real growth %. */
  audienceHistory: Record<string, AudienceSnapshot[]>;
  /** Channel ids currently being fetched (transient, not persisted). */
  loadingIds: string[];
  lastUpdated: number | null;

  // ---- channel management ----
  /** Returns the new channel, or an error string on invalid/duplicate URL. */
  addChannel: (input: AddChannelInput) => { ok: true } | { ok: false; error: string };
  updateChannel: (id: string, patch: Partial<ManagedChannel>) => void;
  removeChannel: (id: string) => void;
  toggleChannelEnabled: (id: string) => void;

  // ---- selection / filters ----
  selectChannel: (id: string | null) => void;
  setFilters: (patch: Partial<ContentFilters>) => void;
  resetFilters: () => void;

  // ---- data cache ----
  setChannelData: (data: ChannelData) => void;
  setLoading: (id: string, on: boolean) => void;
  touchLastUpdated: () => void;
}

function makeId(platform: Platform, identifier: string): string {
  const slug = identifier.replace(/^@/, "").replace(/\W+/g, "-").toLowerCase();
  return `${platform}-${slug}`;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      channels: DEFAULT_CHANNELS,
      selectedChannelId: null,
      filters: defaultFilters,
      dataCache: {},
      audienceHistory: {},
      loadingIds: [],
      lastUpdated: null,

      addChannel: (input) => {
        const parsed = parseChannelUrl(input.url, input.platform);
        if (!parsed) {
          return { ok: false, error: "That doesn't look like a valid URL for the selected platform." };
        }
        const id = makeId(input.platform, parsed.identifier);
        if (get().channels.some((c) => c.id === id)) {
          return { ok: false, error: "That channel is already added." };
        }
        const channel: ManagedChannel = {
          id,
          platform: input.platform,
          name: input.name?.trim() || parsed.name,
          url: input.url.trim(),
          identifier: parsed.identifier,
          category: input.category,
          enabled: true,
        };
        set((state) => ({ channels: [...state.channels, channel] }));
        return { ok: true };
      },

      updateChannel: (id, patch) =>
        set((state) => ({
          channels: state.channels.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),

      removeChannel: (id) =>
        set((state) => {
          const restCache = { ...state.dataCache };
          delete restCache[id];
          return {
            channels: state.channels.filter((c) => c.id !== id),
            dataCache: restCache,
            selectedChannelId:
              state.selectedChannelId === id ? null : state.selectedChannelId,
          };
        }),

      toggleChannelEnabled: (id) =>
        set((state) => ({
          channels: state.channels.map((c) =>
            c.id === id ? { ...c, enabled: !c.enabled } : c
          ),
        })),

      selectChannel: (id) => set({ selectedChannelId: id }),

      setFilters: (patch) =>
        set((state) => ({ filters: { ...state.filters, ...patch } })),

      resetFilters: () => set({ filters: defaultFilters }),

      setChannelData: (data) =>
        set((state) => {
          // Append an audience snapshot when it's the first reading or the
          // audience changed — this is what makes growth % real over time.
          const prev = state.audienceHistory[data.channelId] ?? [];
          const last = prev[prev.length - 1];
          const changed = !last || last.a !== data.audience;
          const history = changed
            ? [...prev, { t: data.fetchedAt, a: data.audience }].slice(-MAX_HISTORY)
            : prev;
          return {
            dataCache: { ...state.dataCache, [data.channelId]: data },
            audienceHistory: { ...state.audienceHistory, [data.channelId]: history },
            lastUpdated: Date.now(),
          };
        }),

      setLoading: (id, on) =>
        set((state) => ({
          loadingIds: on
            ? Array.from(new Set([...state.loadingIds, id]))
            : state.loadingIds.filter((x) => x !== id),
        })),

      touchLastUpdated: () => set({ lastUpdated: Date.now() }),
    }),
    {
      name: "gs-dashboard-channels",
      // Persist the user-managed list + audience history (for growth);
      // live metrics are re-fetched on load.
      partialize: (state) => ({
        channels: state.channels,
        audienceHistory: state.audienceHistory,
      }),
    }
  )
);
