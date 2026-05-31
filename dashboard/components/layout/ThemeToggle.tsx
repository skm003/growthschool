"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Theme toggle. Icons are switched purely via CSS (`.dark` is set on <html>
 * before hydration by next-themes), so no mount-guard effect is needed and
 * there is no hydration mismatch.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle dark mode"
      className="rounded-lg p-2 text-muted transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
    >
      <Sun size={18} className="hidden dark:block" />
      <Moon size={18} className="block dark:hidden" />
    </button>
  );
}
