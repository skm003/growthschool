"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, SegmentedTwo } from "@/components/ui/FormControls";
import { useDashboardStore } from "@/store/dashboardStore";
import type { Category, ManagedChannel, Platform } from "@/types";

/**
 * (4) Edit Channel — change display name, category, or platform.
 * Changes update the store immediately and propagate across the dashboard.
 */
export function EditChannelModal({
  channel,
  onClose,
}: {
  channel: ManagedChannel | null;
  onClose: () => void;
}) {
  if (!channel) return null;
  // Keyed remount initializes the form from the channel — no sync effect needed.
  return <EditForm key={channel.id} channel={channel} onClose={onClose} />;
}

function EditForm({
  channel,
  onClose,
}: {
  channel: ManagedChannel;
  onClose: () => void;
}) {
  const updateChannel = useDashboardStore((s) => s.updateChannel);

  const [name, setName] = useState(channel.name);
  const [category, setCategory] = useState<Category>(channel.category);
  const [platform, setPlatform] = useState<Platform>(channel.platform);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateChannel(channel.id, {
      name: name.trim() || channel.name,
      category,
      platform,
    });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Edit Channel">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Display Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </Field>

        <Field label="Category">
          <SegmentedTwo
            value={category}
            options={[
              { value: "podcast", label: "Podcast" },
              { value: "talking-head", label: "Talking Head" },
            ]}
            onChange={setCategory}
          />
        </Field>

        <Field label="Platform">
          <SegmentedTwo
            value={platform}
            options={[
              { value: "instagram", label: "Instagram" },
              { value: "youtube", label: "YouTube" },
            ]}
            onChange={setPlatform}
          />
        </Field>

        <p className="break-all text-xs text-muted">URL: {channel.url}</p>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}
