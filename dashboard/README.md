# Growth School — Analytics Dashboard

A modern, responsive SaaS-style dashboard for managing and analyzing **Instagram**
and **YouTube** channels. Built UI-first with mock data and a clean service layer
so real APIs can be connected later without touching components.

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Recharts** — analytics charts
- **Zustand** — UI state (selected channel, filters, search)
- **next-themes** — dark mode
- **lucide-react** — icons

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Project structure

```
app/
  layout.tsx              Root layout: ThemeProvider + Navbar (1)
  page.tsx                Home -> "All" view
  [contentType]/page.tsx  /talking-head, /podcast, /behaviour routes (2)
components/
  layout/                 Navbar (1), ContentTypeDropdown (2), ThemeToggle
  analytics/              KpiCard, AnalyticsSection, AnalyticsChart (3)
  channels/               ChannelListPanel, ChannelRow, AddChannelModal (4)
  content/                ContentPanel, ContentGrid, post cards, filters,
                          search, empty states (5)
  dashboard/              DashboardView orchestrator
  ui/                     Reusable primitives: Card, Button, Modal, Badge
  providers/              ThemeProvider
services/                 InstagramService, YouTubeService, AnalyticsService
store/                    Zustand store
data/                     Mock JSON (channels, posts, analytics)
types/                    Shared TypeScript types
lib/                      format helpers, cn()
```

## Wireframe mapping

| # | Section            | Where                                       |
|---|--------------------|---------------------------------------------|
| 1 | Top navbar         | `components/layout/Navbar.tsx`              |
| 2 | Content Type menu  | `components/layout/ContentTypeDropdown.tsx` |
| 3 | Overall analytics  | `components/analytics/AnalyticsSection.tsx` |
| 4 | Channel list (30%) | `components/channels/ChannelListPanel.tsx`  |
| 5 | Content panel (70%)| `components/content/ContentPanel.tsx`       |

## Connecting real APIs later

All data flows through the **service layer** — components never import mock JSON
directly. To go live, change only the bodies of these files:

- `services/instagramService.ts` — `// TODO: Connect Instagram Graph API`
- `services/youtubeService.ts` — `// TODO: Connect YouTube Data API`
- `services/analyticsService.ts` — `// TODO: Fetch real analytics`

Recommended approach:

1. Add secrets to `.env.local` (see `.env.local.example`). **Never** use the
   `NEXT_PUBLIC_` prefix for API keys.
2. Create route handlers under `app/api/instagram/*` and `app/api/youtube/*`
   that read those secrets server-side and call the real APIs.
3. Point the service functions at those routes (`fetch('/api/...')`). Function
   signatures stay the same, so no component changes are needed.
4. Add the real media CDNs to `next.config.ts` `images.remotePatterns`.

## User flow

1. Open the dashboard — combined analytics render in section (3).
2. Pick a **Content Type** (2) — routes and filters the view.
3. Select a **channel** (4) — its content loads in (5).
4. Filter, search, and sort to analyze performance.
