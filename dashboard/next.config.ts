import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder thumbnails for mock data. Replace/extend with the real
    // Instagram CDN (cdninstagram.com) and YouTube (i.ytimg.com) domains later.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      // Instagram media CDNs (scraped thumbnails)
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      // YouTube thumbnails + channel avatars
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "**.ggpht.com" },
      { protocol: "https", hostname: "yt3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
