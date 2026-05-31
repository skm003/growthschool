/** Display/formatting helpers used across KPI cards and content cards. */

/** 2_400_000 -> "2.4M", 125_000 -> "125K". */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${stripZero(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${stripZero(value / 1_000)}K`;
  }
  return value.toLocaleString("en-US");
}

function stripZero(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "");
}

/** Seconds -> "12:22" or "1:02:15". */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = m.toString().padStart(h > 0 ? 2 : 1, "0");
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Hours -> "5.8K hrs" style compact watch time. */
export function formatWatchTime(hours: number): string {
  return `${formatCompact(hours)} hrs`;
}

/** ISO date -> "May 22, 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** 12.4 -> "+12.4%", -3 -> "-3%". */
export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${stripZero(value)}%`;
}
