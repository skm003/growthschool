import { type ReactNode } from "react";

/** Generic empty/placeholder state used by the content panel. */
export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/5 text-muted dark:bg-white/10">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 max-w-xs text-sm text-muted">{description}</p>
      </div>
    </div>
  );
}
