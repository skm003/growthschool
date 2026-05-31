"use client";

import { useEffect, useState } from "react";
import { Camera, MonitorPlay } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Quick navigation buttons (below the navbar, top-right).
 * They are NOT filters — they smooth-scroll to the Instagram / YouTube
 * full-analysis sections and highlight the button whose section is in view.
 */

const SECTIONS = [
  {
    id: "platform-instagram",
    label: "Instagram",
    icon: Camera,
    activeClass: "border-pink-500 bg-pink-500/10 text-pink-600",
  },
  {
    id: "platform-youtube",
    label: "YouTube",
    icon: MonitorPlay,
    activeClass: "border-red-500 bg-red-500/10 text-red-600",
  },
] as const;

export function SectionNav({ ready }: { ready: boolean }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Highlight the section nearest the top of the viewport.
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ready]);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav aria-label="Section navigation" className="flex items-center gap-2">
      {SECTIONS.map(({ id, label, icon: Icon, activeClass }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? activeClass
                : "border-border bg-card text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            )}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
