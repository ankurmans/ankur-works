import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SITE_PUBLISHED !== "1") return [];
  return [{ url: "https://outlever.ankur.works/", lastModified: new Date("2026-10-01"), changeFrequency: "monthly", priority: 1 }];
}
