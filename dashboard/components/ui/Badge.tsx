import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "instagram" | "youtube" | "blue";

const tones: Record<Tone, string> = {
  neutral: "bg-black/5 text-muted dark:bg-white/10",
  instagram: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  youtube: "bg-red-500/10 text-red-600 dark:text-red-400",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
