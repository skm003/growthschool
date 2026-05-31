/** Route a remote CDN image through our same-origin proxy (avoids hotlink blocks). */
export function proxiedImage(url: string | undefined): string | null {
  if (!url) return null;
  return `/api/image?url=${encodeURIComponent(url)}`;
}
