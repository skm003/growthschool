"use client";

import { Layers, RefreshCw } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { Button } from "@/components/ui/Button";
import { buildCategoryKpis } from "@/lib/analytics";
import type {
  AudienceSnapshot,
  ChannelData,
  ManagedChannel,
} from "@/types";

/**
 * (3) Category analytics — combined metrics across all channels in scope
 * ("All", "Podcast", or "Talking Head"). Aggregates whatever is loaded and
 * offers a one-click load for the rest (cost-aware: scraping is on demand).
 */
export function CategoryAnalytics({
  scopeLabel,
  channels,
  cache,
  histories,
  loadingCount,
  onLoadAll,
}: {
  scopeLabel: string;
  channels: ManagedChannel[];
  cache: Record<string, ChannelData>;
  histories: Record<string, AudienceSnapshot[]>;
  loadingCount: number;
  onLoadAll: () => void;
}) {
  const { kpis, loaded, total } = buildCategoryKpis(channels, cache, histories);
  const allLoaded = loaded >= total && total > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-blue-600" />
          <h3 className="text-base font-semibold">{scopeLabel} Analytics</h3>
          <span className="text-xs text-muted">
            {loaded} of {total} loaded
          </span>
        </div>
        {!allLoaded && total > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onLoadAll}
            disabled={loadingCount > 0}
          >
            <RefreshCw
              size={14}
              className={loadingCount > 0 ? "animate-spin" : ""}
            />
            {loadingCount > 0 ? `Loading ${loadingCount}…` : "Load all live data"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      {loaded === 0 && total > 0 && (
        <p className="text-sm text-muted">
          No live data yet. Click a channel on the left to load it, or use
          “Load all live data” to fetch every {scopeLabel.toLowerCase()} channel.
        </p>
      )}

      <p className="text-xs text-muted">
        “—” Reach &amp; Watch Time are owner-only insights and require official
        API access. Growth is tracked from audience changes over time.
      </p>
    </div>
  );
}
