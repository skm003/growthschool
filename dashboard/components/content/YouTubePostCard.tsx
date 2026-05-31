import { Eye, Heart, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Thumbnail } from "@/components/ui/Thumbnail";
import { formatCompact, formatDate, formatDuration } from "@/lib/format";
import type { YouTubePost } from "@/types";

/** (5) YouTube content card with real view counts. */
export function YouTubePostCard({ post }: { post: YouTubePost }) {
  return (
    <Card className="group overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-video w-full overflow-hidden bg-black/5">
        <Thumbnail
          url={post.thumbnailUrl}
          alt={post.title || "YouTube video"}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {post.durationSeconds > 0 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(post.durationSeconds)}
          </span>
        )}
      </div>

      <div className="space-y-3 p-3">
        <p className="line-clamp-2 text-sm font-medium">
          {post.title || "Untitled"}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
          <Stat icon={<Eye size={13} />} value={`${formatCompact(post.views)} views`} />
          <Stat icon={<Heart size={13} />} value={formatCompact(post.likes)} />
          <Stat icon={<MessageCircle size={13} />} value={formatCompact(post.comments)} />
        </div>

        <div className="border-t border-border pt-2 text-xs text-muted">
          {formatDate(post.publishedDate)}
        </div>
      </div>
    </Card>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      {value}
    </span>
  );
}
