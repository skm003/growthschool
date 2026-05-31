"use client";

import { useDashboardStore } from "@/store/dashboardStore";
import type {
  InstagramPostType,
  Platform,
  SortOption,
} from "@/types";

/**
 * (5) Filters above the content grid: Platform, Post Type, Sort By.
 * Date range / views / engagement filters can be added the same way later.
 */

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-normal text-foreground outline-none focus:border-blue-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ContentFilters() {
  const filters = useDashboardStore((s) => s.filters);
  const setFilters = useDashboardStore((s) => s.setFilters);

  return (
    <div className="flex flex-wrap gap-3">
      <Select<Platform | "all">
        label="Platform"
        value={filters.platform}
        onChange={(platform) => setFilters({ platform })}
        options={[
          { value: "all", label: "All Platforms" },
          { value: "instagram", label: "Instagram" },
          { value: "youtube", label: "YouTube" },
        ]}
      />
      <Select<InstagramPostType | "all">
        label="Post Type"
        value={filters.postType}
        onChange={(postType) => setFilters({ postType })}
        options={[
          { value: "all", label: "All Types" },
          { value: "reel", label: "Reel" },
          { value: "carousel", label: "Carousel" },
          { value: "image", label: "Image" },
        ]}
      />
      <Select<SortOption>
        label="Sort By"
        value={filters.sortBy}
        onChange={(sortBy) => setFilters({ sortBy })}
        options={[
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
          { value: "most-viewed", label: "Most Viewed" },
          { value: "most-engaged", label: "Most Engaged" },
        ]}
      />
    </div>
  );
}
