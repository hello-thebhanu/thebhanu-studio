import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { getPublicAssetsData } from "@/lib/assets/db";
import { getPublicMarketplaceData } from "@/lib/marketplace/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products }, { assets }] = await Promise.all([
    getPublicMarketplaceData(),
    getPublicAssetsData(),
  ]);

  const productEntries: MetadataRoute.Sitemap = products
    .filter((product) => product.published !== false && product.status !== "Unavailable")
    .map((product) => ({
      url: `${SITE_CONFIG.domain}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly",
      priority: product.featured ? 0.85 : 0.75,
    }));

  const assetEntries: MetadataRoute.Sitemap = assets
    .filter((asset) => asset.published !== false && asset.status !== "Unavailable")
    .map((asset) => ({
      url: `${SITE_CONFIG.domain}/components/${asset.slug}`,
      lastModified: new Date(asset.updatedAt),
      changeFrequency: "weekly",
      priority: asset.featured ? 0.8 : 0.7,
    }));

  return [
    {
      url: SITE_CONFIG.domain,
      lastModified: new Date("2026-11-25T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_CONFIG.domain}/marketplace`,
      lastModified: new Date("2026-11-25T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_CONFIG.domain}/components`,
      lastModified: new Date("2026-11-25T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${SITE_CONFIG.domain}/custom-studio`,
      lastModified: new Date("2026-11-25T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...productEntries,
    ...assetEntries,
  ];
}
