"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ChannelRow } from "./ChannelRow";
import { AddChannelModal } from "./AddChannelModal";
import { EditChannelModal } from "./EditChannelModal";
import { Card } from "@/components/ui/Card";
import { useDashboardStore } from "@/store/dashboardStore";
import { useChannelLoader } from "@/hooks/useChannelLoader";
import type { Category, ManagedChannel, Platform } from "@/types";

/**
 * (4) Channel List Panel — left sidebar (~30%).
 * Channels are grouped dynamically: Platform -> Category. Fully user-managed
 * (add / edit / delete / enable-disable). Selecting a channel loads its data.
 */

const PLATFORMS: { key: Platform; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
];
const CATEGORIES: { key: Category; label: string }[] = [
  { key: "podcast", label: "Podcast" },
  { key: "talking-head", label: "Talking Head" },
];

export function ChannelListPanel() {
  const channels = useDashboardStore((s) => s.channels);
  const selectedChannelId = useDashboardStore((s) => s.selectedChannelId);
  const selectChannel = useDashboardStore((s) => s.selectChannel);
  const removeChannel = useDashboardStore((s) => s.removeChannel);
  const toggleChannelEnabled = useDashboardStore((s) => s.toggleChannelEnabled);
  const dataCache = useDashboardStore((s) => s.dataCache);
  const loadingIds = useDashboardStore((s) => s.loadingIds);

  const { loadChannel } = useChannelLoader();

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<ManagedChannel | null>(null);

  const handleSelect = (channel: ManagedChannel) => {
    selectChannel(channel.id);
    void loadChannel(channel);
  };

  return (
    <>
      <Card className="flex h-full flex-col overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Channels</h2>
          <p className="text-xs text-muted">
            {channels.length} managed account
            {channels.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="scroll-thin flex-1 space-y-4 overflow-y-auto p-2">
          {channels.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">
              No channels yet. Add one below.
            </p>
          ) : (
            PLATFORMS.map(({ key: platform, label: platformLabel }) => {
              const platformChannels = channels.filter(
                (c) => c.platform === platform
              );
              if (platformChannels.length === 0) return null;

              return (
                <div
                  key={platform}
                  id={`platform-${platform}`}
                  className="scroll-mt-4 space-y-2"
                >
                  <p className="px-3 text-xs font-bold uppercase tracking-wider text-foreground">
                    {platformLabel}
                  </p>
                  {CATEGORIES.map(({ key: category, label: categoryLabel }) => {
                    const list = platformChannels.filter(
                      (c) => c.category === category
                    );
                    if (list.length === 0) return null;

                    return (
                      <div key={category} className="space-y-0.5">
                        <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted">
                          {categoryLabel}
                        </p>
                        {list.map((channel) => (
                          <ChannelRow
                            key={channel.id}
                            channel={channel}
                            selected={channel.id === selectedChannelId}
                            loading={loadingIds.includes(channel.id)}
                            audience={dataCache[channel.id]?.audience}
                            onSelect={() => handleSelect(channel)}
                            onEdit={() => setEditing(channel)}
                            onDelete={() => removeChannel(channel.id)}
                            onToggleEnabled={() =>
                              toggleChannelEnabled(channel.id)
                            }
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-border p-3">
          <button
            onClick={() => setAddOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-sm font-medium text-muted transition-colors hover:border-blue-500 hover:text-blue-600"
          >
            <Plus size={16} />
            Add Channel
          </button>
        </div>
      </Card>

      <AddChannelModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditChannelModal channel={editing} onClose={() => setEditing(null)} />
    </>
  );
}
