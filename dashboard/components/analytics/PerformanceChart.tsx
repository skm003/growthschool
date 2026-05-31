"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact } from "@/lib/format";
import { performanceSeries } from "@/lib/analytics";
import type { Post } from "@/types";

/**
 * Recent performance over time (likes for IG, views for YT).
 * This is a per-post timeline; true follower/subscriber growth requires
 * historical snapshots (a future background-sync feature).
 */
export function PerformanceChart({ posts }: { posts: Post[] }) {
  const { metric, points } = performanceSeries(posts);
  const color = posts[0]?.platform === "youtube" ? "#ef4444" : "#ec4899";

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            minTickGap={24}
          />
          <YAxis
            tickFormatter={(v) => formatCompact(Number(v))}
            tickLine={false}
            axisLine={false}
            width={44}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
          />
          <Tooltip
            formatter={(v) => [formatCompact(Number(v)), metric]}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#perfFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
