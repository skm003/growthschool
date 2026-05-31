"use client";

import {
  Camera,
  ChevronRight,
  Eye,
  EyeOff,
  Loader2,
  MonitorPlay,
  Pencil,
  Trash2,
} from "lucide-react";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { ManagedChannel } from "@/types";

interface ChannelRowProps {
  channel: ManagedChannel;
  selected: boolean;
  loading?: boolean;
  /** Cached audience count, if loaded. */
  audience?: number;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleEnabled: () => void;
}

export function ChannelRow({
  channel,
  selected,
  loading,
  audience,
  onSelect,
  onEdit,
  onDelete,
  onToggleEnabled,
}: ChannelRowProps) {
  const Icon = channel.platform === "instagram" ? Camera : MonitorPlay;
  const iconColor =
    channel.platform === "instagram" ? "text-pink-600" : "text-red-600";

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors",
        selected
          ? "border-blue-500 bg-blue-500/5"
          : "border-transparent hover:bg-black/5 dark:hover:bg-white/5",
        !channel.enabled && "opacity-50"
      )}
    >
      <button
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        aria-pressed={selected}
      >
        <Icon size={16} className={cn("shrink-0", iconColor)} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {channel.name}
          </span>
          <span className="block text-xs text-muted">
            {loading
              ? "Loading…"
              : audience !== undefined
                ? `${formatCompact(audience)} ${channel.platform === "instagram" ? "followers" : "subscribers"}`
                : "Not loaded"}
          </span>
        </span>
      </button>

      <div className="flex items-center opacity-0 transition group-hover:opacity-100">
        <IconButton label="Edit" onClick={onEdit}>
          <Pencil size={14} />
        </IconButton>
        <IconButton
          label={channel.enabled ? "Disable" : "Enable"}
          onClick={onToggleEnabled}
        >
          {channel.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
        </IconButton>
        <IconButton label="Delete" danger onClick={onDelete}>
          <Trash2 size={14} />
        </IconButton>
      </div>

      <button
        onClick={onSelect}
        aria-label={`View ${channel.name}`}
        className="rounded-md p-1 text-muted transition hover:text-foreground"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ChevronRight
            size={16}
            className={cn("transition-transform", selected && "rotate-90")}
          />
        )}
      </button>
    </div>
  );
}

function IconButton({
  label,
  danger,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-md p-1 text-muted transition",
        danger ? "hover:text-red-600" : "hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
