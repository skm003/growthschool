import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { KpiMetric } from "@/types";

/** (3) A single large KPI card: label on top, big value, optional delta. */
export function KpiCard({ label, value, delta }: KpiMetric) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium",
              positive ? "text-emerald-600" : "text-red-600"
            )}
          >
            {positive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {formatPercent(delta).replace("+", "")}
          </span>
        )}
      </div>
    </Card>
  );
}
