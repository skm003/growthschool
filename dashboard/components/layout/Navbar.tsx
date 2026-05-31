import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

/**
 * (1) Top Navigation Bar
 * Fixed, full-width. Company logo centered and clickable (acts as Home).
 * Theme toggle sits on the right without affecting the centered logo.
 */
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-[1600px] items-center justify-center px-4">
        <Link
          href="/"
          aria-label="Home"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            GS
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Growth School
          </span>
        </Link>

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
