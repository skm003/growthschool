import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/image?url=<encoded media url>
 *
 * Proxies Instagram/YouTube CDN images. Their CDNs block hotlinking from a
 * browser on another origin, so we fetch server-side (no such block) and
 * stream the bytes back same-origin. Also avoids exposing the raw signed URLs.
 *
 * Only whitelisted media hosts are allowed (prevents SSRF / open proxy).
 */

const ALLOWED_HOST_SUFFIXES = [
  "cdninstagram.com",
  "fbcdn.net",
  "ytimg.com",
  "ggpht.com",
  "googleusercontent.com",
];

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  const ok =
    target.protocol === "https:" &&
    ALLOWED_HOST_SUFFIXES.some(
      (s) => target.hostname === s || target.hostname.endsWith(`.${s}`)
    );
  if (!ok) {
    return NextResponse.json({ error: "host not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        // Browser-like UA helps with CDNs that reject default fetch agents.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `upstream ${upstream.status}` },
        { status: 502 }
      );
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
        // Cache in the browser for a day (signed URLs are short-lived anyway).
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err) {
    console.error("[/api/image]", err);
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
