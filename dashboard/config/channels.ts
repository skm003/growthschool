/**
 * DEFAULT (pre-configured) channels the dashboard ships with.
 *
 * These seed the user-managed channel list on first load. After that, the
 * list lives in the browser (localStorage) and users add/edit/delete from the
 * UI with no code changes. Editing this array only affects brand-new users.
 *
 * Categories: "podcast" | "talking-head".
 */

import type { ManagedChannel } from "@/types";

export const DEFAULT_CHANNELS: ManagedChannel[] = [
  // ---- INSTAGRAM · Podcast ----
  {
    id: "ig-vaibhavsisinty",
    platform: "instagram",
    name: "@vaibhavsisinty.ig",
    url: "https://www.instagram.com/vaibhavsisinty.ig/",
    identifier: "vaibhavsisinty.ig",
    category: "podcast",
    enabled: true,
  },
  {
    id: "ig-sisinty-one",
    platform: "instagram",
    name: "@sisinty.one",
    url: "https://www.instagram.com/sisinty.one/",
    identifier: "sisinty.one",
    category: "podcast",
    enabled: true,
  },
  {
    id: "ig-sisinty-vaibhav",
    platform: "instagram",
    name: "@sisinty.vaibhav",
    url: "https://www.instagram.com/sisinty.vaibhav",
    identifier: "sisinty.vaibhav",
    category: "podcast",
    enabled: true,
  },
  {
    id: "ig-v-sisinty",
    platform: "instagram",
    name: "@v.sisinty",
    url: "https://www.instagram.com/v.sisinty",
    identifier: "v.sisinty",
    category: "podcast",
    enabled: true,
  },

  // ---- INSTAGRAM · Talking Head ----
  {
    id: "ig-v_sisintyai",
    platform: "instagram",
    name: "@v_sisintyai",
    url: "https://www.instagram.com/v_sisintyai",
    identifier: "v_sisintyai",
    category: "talking-head",
    enabled: true,
  },
  {
    id: "ig-sisintyvaibhav-ai",
    platform: "instagram",
    name: "@sisintyvaibhav.ai",
    url: "https://www.instagram.com/sisintyvaibhav.ai",
    identifier: "sisintyvaibhav.ai",
    category: "talking-head",
    enabled: true,
  },

  // ---- YOUTUBE · Podcast ----
  {
    id: "yt-vaibhavsisinty-ig",
    platform: "youtube",
    name: "@Vaibhavsisinty-IG",
    url: "https://www.youtube.com/@Vaibhavsisinty-IG",
    identifier: "@Vaibhavsisinty-IG",
    category: "podcast",
    enabled: true,
  },
  {
    id: "yt-sisinty-one",
    platform: "youtube",
    name: "@sisinty-one",
    url: "https://www.youtube.com/@sisinty-one",
    identifier: "@sisinty-one",
    category: "podcast",
    enabled: true,
  },
  {
    id: "yt-sisinty-vaibhav",
    platform: "youtube",
    name: "@sisinty.vaibhav",
    url: "https://youtube.com/@sisinty.vaibhav",
    identifier: "@sisinty.vaibhav",
    category: "podcast",
    enabled: true,
  },
  {
    id: "yt-v-sisinty",
    platform: "youtube",
    name: "@v.sisinty",
    url: "https://youtube.com/@v.sisinty",
    identifier: "@v.sisinty",
    category: "podcast",
    enabled: true,
  },
];
