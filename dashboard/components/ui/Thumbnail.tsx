"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { proxiedImage } from "@/lib/img";
import { cn } from "@/lib/cn";

/**
 * Thumbnail that loads CDN images through the same-origin proxy and falls back
 * to a neutral placeholder if the image is missing or fails to load.
 */
export function Thumbnail({
  url,
  alt,
  className,
}: {
  url?: string;
  alt: string;
  className?: string;
}) {
  const src = proxiedImage(url);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-black/5 text-muted dark:bg-white/5",
          className
        )}
      >
        <ImageOff size={22} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- proxied, dynamic CDN host
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
