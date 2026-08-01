import type { MetadataRoute } from "next";
import { getPublishedTitles } from "@/lib/supabase/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://primecine.cm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/movies`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/series`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/register`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const titles = await getPublishedTitles();
    const titleRoutes: MetadataRoute.Sitemap = titles.map((t) => ({
      url: `${siteUrl}/watch/${t.slug}`,
      lastModified: t.releaseDate || undefined,
      changeFrequency: "weekly",
      priority: t.isOriginal ? 0.9 : 0.7,
    }));
    return [...staticRoutes, ...titleRoutes];
  } catch {
    return staticRoutes;
  }
}
