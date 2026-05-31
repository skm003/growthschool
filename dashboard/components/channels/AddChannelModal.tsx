"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, SegmentedTwo } from "@/components/ui/FormControls";
import { useDashboardStore } from "@/store/dashboardStore";
import { detectPlatform } from "@/lib/channelUrl";
import type { Category, Platform } from "@/types";

/**
 * (4) Add Channel — users connect a new IG/YT account by URL, with a category.
 * Display name is optional and auto-derived from the URL when empty.
 * Persists via the store (localStorage), so it survives refresh — no code change.
 */
export function AddChannelModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addChannel = useDashboardStore((s) => s.addChannel);

  const [platform, setPlatform] = useState<Platform>("instagram");
  const [category, setCategory] = useState<Category>("podcast");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPlatform("instagram");
    setCategory("podcast");
    setUrl("");
    setName("");
    setError(null);
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setError(null);
    // Auto-detect platform from the pasted URL for convenience.
    const detected = detectPlatform(value);
    if (detected) setPlatform(detected);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addChannel({ platform, category, url, name });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Channel">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <Field label="Channel URL">
          <input
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={
              platform === "instagram"
                ? "https://www.instagram.com/account"
                : "https://www.youtube.com/@channel"
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </Field>

        <Field label="Display Name (optional)">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Auto-detected from URL if left empty"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </Field>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!url.trim()}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
