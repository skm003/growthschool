import { Eye, Heart, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Thumbnail } from "@/components/ui/Thumbnail";
import { formatCompact, formatDate } from "@/lib/format";
import type { InstagramPost } from "@/types";

/** (5) Instagram content card. Reels/videos show real play counts (views). */
export function InstagramPostCard({ post }: { post: InstagramPost }) {
  const hasViews = post.postType === "reel" && post.views > 0;
  return (
    <Card className="group overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-black/5">
        <Thumbnail
          url={post.thumbnailUrl}
          alt={`${post.postType} post`}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <Badge tone="instagram" className="absolute left-2 top-2 capitalize">
          {post.postType}
        </Badge>
      </div>

      <div className="space-y-3 p-3">
        <p className="line-clamp-2 text-sm font-medium">
          {post.caption || "Untitled"}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
          {hasViews && <Stat icon={<Eye size={13} />} value={post.views} />}
          <Stat icon={<Heart size={13} />} value={post.likes} />
          <Stat icon={<MessageCircle size={13} />} value={post.comments} />
        </div>

        <div className="border-t border-border pt-2 text-xs text-muted">
          {formatDate(post.publishedDate)}
        </div>
      </div>
    </Card>
  );
}

function Stat({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      {icon}
      {formatCompact(value)}
    </span>
  );
}
