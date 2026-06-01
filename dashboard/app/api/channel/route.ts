import { NextRequest, NextResponse } from "next/server";
import { instagramService } from "@/services/instagramService";
import { youtubeApiService } from "@/services/youtubeApiService";
import { youtubeService } from "@/services/youtubeService";
import type { Category, Platform } from "@/types";

export const dynamic = "force-dynamic";
// Scrapes can take a while; allow up to 5 minutes.
export const maxDuration = 300;

interface Body {
  platform: Platform;
  identifier: string;
  channelId: string;
  category: Category;
}

/**
 * POST /api/channel
 * Body: { platform, identifier, channelId, category }
 * Returns: { audience, posts } for that ONE channel (section 3 + 5).
 * The Apify token stays server-side here.
 */
export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { platform, identifier, channelId, category } = body;
  if (!platform || !identifier || !channelId) {
    return NextResponse.json(
      { error: "platform, identifier and channelId are required" },
      { status: 400 }
    );
  }

  try {
    let result;
    if (platform === "instagram") {
      result = await instagramService.fetchByIdentifier(identifier, channelId, category);
    } else {
      if (process.env.YOUTUBE_API_KEY) {
        console.log(`[Channel API] Using official YouTube API for ${identifier}`);
        result = await youtubeApiService.fetchByIdentifier(identifier, channelId, category);
      } else {
        console.log(`[Channel API] YOUTUBE_API_KEY is not set. Falling back to Apify YouTube scraper for ${identifier}`);
        result = await youtubeService.fetchByIdentifier(identifier, channelId, category);
      }
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/channel]", err);
    return NextResponse.json(
      { error: "Failed to fetch channel data" },
      { status: 502 }
    );
  }
}
