import { InstagramPostCard } from "./InstagramPostCard";
import { YouTubePostCard } from "./YouTubePostCard";
import type { Post } from "@/types";

/** (5) Responsive grid of content cards. */
export function ContentGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) =>
        post.platform === "instagram" ? (
          <InstagramPostCard key={post.id} post={post} />
        ) : (
          <YouTubePostCard key={post.id} post={post} />
        )
      )}
    </div>
  );
}
