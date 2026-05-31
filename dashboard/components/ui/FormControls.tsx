"use client";

import { cn } from "@/lib/cn";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

/** A 2-option segmented toggle. */
export function SegmentedTwo<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
            value === o.value
              ? "border-blue-500 bg-blue-500/5 text-blue-600"
              : "border-border hover:bg-black/5 dark:hover:bg-white/5"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
