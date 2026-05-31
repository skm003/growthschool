"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";

function formatStamp(ms: number): string {
  const d = new Date(ms);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} | ${time}`;
}

/**
 * Last Updated timestamp + manual Refresh Now button.
 * Auto-refresh (every 15 min) is wired in DashboardView.
 */
export function RefreshBar({
  lastUpdated,
  refreshing,
  onRefresh,
}: {
  lastUpdated: number | null;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-[11px] uppercase tracking-wide text-muted">
          Last Updated · Auto-syncs hourly
        </p>
        <p className="text-xs font-medium">
          {lastUpdated ? formatStamp(lastUpdated) : "Syncing…"}
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/5"
      >
        <RefreshCw size={15} className={cn(refreshing && "animate-spin")} />
        <span className="hidden md:inline">
          {refreshing ? "Refreshing…" : "Refresh Now"}
        </span>
      </button>
    </div>
  );
}
