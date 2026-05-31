"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import type { ContentType } from "@/types";
import { cn } from "@/lib/cn";

/**
 * (2) Content Type Dropdown
 * Selecting an option navigates to the matching route. Actual content loading
 * is filtered downstream; routing is wired now for future deep-linking.
 */

const OPTIONS: { value: ContentType; label: string; href: string }[] = [
  { value: "all", label: "All", href: "/" },
  { value: "talking-head", label: "Talking Head", href: "/talking-head" },
  { value: "podcast", label: "Podcast", href: "/podcast" },
];

export function ContentTypeDropdown({ value }: { value: ContentType }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0];

  return (
    <div ref={ref} className="relative">
      <span className="mb-1 block text-xs font-medium text-muted">
        Content Type
      </span>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-48 items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      >
        {current.label}
        <ChevronDown
          size={16}
          className={cn("text-muted transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg"
        >
          {OPTIONS.map((o) => (
            <li key={o.value}>
              <button
                role="option"
                aria-selected={o.value === value}
                onClick={() => {
                  setOpen(false);
                  router.push(o.href);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                {o.label}
                {o.value === value && (
                  <Check size={15} className="text-blue-600" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
