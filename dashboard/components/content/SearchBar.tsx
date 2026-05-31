"use client";

import { Search } from "lucide-react";
import { useDashboardStore } from "@/store/dashboardStore";

/** Search content by channel name, video title, caption, or keywords. */
export function SearchBar() {
  const search = useDashboardStore((s) => s.filters.search);
  const setFilters = useDashboardStore((s) => s.setFilters);

  return (
    <div className="relative flex-1 min-w-48">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        value={search}
        onChange={(e) => setFilters({ search: e.target.value })}
        placeholder="Search title, caption, keywords..."
        className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
      />
    </div>
  );
}
