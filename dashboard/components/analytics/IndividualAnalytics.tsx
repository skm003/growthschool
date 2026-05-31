import { Camera, MonitorPlay } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { PerformanceChart } from "./PerformanceChart";
import { Card } from "@/components/ui/Card";
import { buildChannelKpis } from "@/lib/analytics";
import type { AudienceSnapshot, ChannelData, ManagedChannel } from "@/types";

/**
 * (3) Individual channel analytics — shows ONLY the selected channel's data.
 */
export function IndividualAnalytics({
  channel,
  data,
  history,
}: {
  channel: ManagedChannel;
  data: ChannelData;
  history?: AudienceSnapshot[];
}) {
  const kpis = buildChannelKpis(channel, data, history);
  const Icon = channel.platform === "instagram" ? Camera : MonitorPlay;
  const iconColor =
    channel.platform === "instagram" ? "text-pink-600" : "text-red-600";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon size={18} className={iconColor} />
        <h3 className="text-base font-semibold">{channel.name}</h3>
        <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs capitalize text-muted dark:bg-white/10">
          {channel.category.replace("-", " ")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {kpis.map((m) => (
          <KpiCard key={m.label} {...m} />
        ))}
      </div>

      <Card className="p-4">
        <p className="mb-3 text-sm font-semibold">Recent Performance</p>
        <PerformanceChart posts={data.posts} />
      </Card>
    </div>
  );
}
