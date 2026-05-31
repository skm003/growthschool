import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Surface container: white card, subtle border + shadow, rounded corners. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-sm",
        className
      )}
      {...props}
    />
  );
}
