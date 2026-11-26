import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  STARTER_ASSET_CATEGORIES,
  STARTER_UI_ASSETS,
} from "./starter-assets";
import type {
  AssetAvailability,
  AssetCategory,
  AssetCategoryWithCount,
  AssetPreviewKey,
  AssetType,
  UiAssetRecord,
} from "./types";

interface DbAssetCategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number | null;
}

interface DbUiAssetRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  usage_instructions: string | null;
  category_id: string;
  asset_type: string | null;
  preview_key: string | null;
  code_snippet: string | null;
  code_language: string | null;
  resource_url: string | null;
  dependencies: string[] | null;
  tags: string[] | null;
  status: AssetAvailability;
  published: boolean;
  featured: boolean;
  is_demo_record: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

function mapCategory(row: DbAssetCategoryRow): AssetCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    displayOrder: row.display_order ?? 0,
  };
}

function mapAsset(
  row: DbUiAssetRow,
  categorySlugById: Map<string, string>
): UiAssetRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    usageInstructions: row.usage_instructions ?? "",
    categorySlug: categorySlugById.get(row.category_id) ?? "glass-surfaces",
    categoryId: row.category_id,
    assetType: (row.asset_type as AssetType) || "UI Component",
    previewKey: (row.preview_key as AssetPreviewKey) || "glass-card",
    codeSnippet: row.code_snippet ?? "",
    codeLanguage: row.code_language ?? "tsx",
    resourceUrl: row.resource_url,
    dependencies: row.dependencies ?? [],
    tags: row.tags ?? [],
    status: row.status,
    published: row.published,
    featured: row.featured,
    isDemoRecord: row.is_demo_record,
    seoTitle: row.seo_title || row.name,
    seoDescription: row.seo_description || row.summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function createPublicSupabaseClient() {
  const { url, publishableKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured) return null;
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getPublicAssetsData(): Promise<{
  categories: AssetCategory[];
  assets: UiAssetRecord[];
  source: "supabase" | "fallback";
}> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return {
      categories: STARTER_ASSET_CATEGORIES,
      assets: STARTER_UI_ASSETS,
      source: "fallback",
    };
  }

  try {
    const [catRes, assetRes] = await Promise.all([
      supabase
        .from("asset_categories")
        .select("id, slug, name, description, display_order")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("ui_assets")
        .select("*")
        .eq("published", true)
        .neq("status", "Unavailable")
        .order("created_at", { ascending: false }),
    ]);

    if (catRes.error || assetRes.error) {
      return {
        categories: STARTER_ASSET_CATEGORIES,
        assets: STARTER_UI_ASSETS,
        source: "fallback",
      };
    }

    const dbCategories = (catRes.data ?? []) as DbAssetCategoryRow[];
    if (dbCategories.length === 0) {
      return {
        categories: STARTER_ASSET_CATEGORIES,
        assets: STARTER_UI_ASSETS,
        source: "fallback",
      };
    }

    const categories = dbCategories.map(mapCategory);
    const categorySlugById = new Map(categories.map((c) => [c.id, c.slug]));
    const assets = ((assetRes.data ?? []) as DbUiAssetRow[]).map((row) =>
      mapAsset(row, categorySlugById)
    );

    return { categories, assets, source: "supabase" };
  } catch {
    return {
      categories: STARTER_ASSET_CATEGORIES,
      assets: STARTER_UI_ASSETS,
      source: "fallback",
    };
  }
}

export async function getPublicAssetBySlug(slug: string): Promise<{
  asset: UiAssetRecord | null;
  categories: AssetCategory[];
  relatedAssets: UiAssetRecord[];
}> {
  const { categories, assets } = await getPublicAssetsData();
  const asset = assets.find((a) => a.slug === slug) ?? null;
  if (!asset) {
    return { asset: null, categories, relatedAssets: [] };
  }

  const sameCat = assets.filter(
    (a) => a.id !== asset.id && a.categorySlug === asset.categorySlug
  );
  const others = assets.filter(
    (a) => a.id !== asset.id && a.categorySlug !== asset.categorySlug
  );
  return {
    asset,
    categories,
    relatedAssets: [...sameCat, ...others].slice(0, 3),
  };
}

export async function getAdminAssetsData(): Promise<{
  categories: AssetCategoryWithCount[];
  assets: UiAssetRecord[];
  schemaReady: boolean;
  errorMessage?: string;
}> {
  try {
    const admin = createSupabaseAdminClient();
    const [catRes, assetRes] = await Promise.all([
      admin
        .from("asset_categories")
        .select("id, slug, name, description, display_order")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true }),
      admin
        .from("ui_assets")
        .select("*")
        .order("updated_at", { ascending: false }),
    ]);

    if (catRes.error) {
      return {
        categories: [],
        assets: [],
        schemaReady: false,
        errorMessage: catRes.error.message,
      };
    }

    if (assetRes.error) {
      return {
        categories: [],
        assets: [],
        schemaReady: false,
        errorMessage: assetRes.error.message,
      };
    }

    const categories = ((catRes.data ?? []) as DbAssetCategoryRow[]).map(
      mapCategory
    );
    const categorySlugById = new Map(categories.map((c) => [c.id, c.slug]));
    const assets = ((assetRes.data ?? []) as DbUiAssetRow[]).map((row) =>
      mapAsset(row, categorySlugById)
    );

    const counts = new Map<string, number>();
    for (const a of assets) {
      counts.set(a.categorySlug, (counts.get(a.categorySlug) ?? 0) + 1);
    }

    return {
      categories: categories.map((cat) => ({
        ...cat,
        assetCount: counts.get(cat.slug) ?? 0,
      })),
      assets,
      schemaReady: true,
    };
  } catch (err) {
    return {
      categories: [],
      assets: [],
      schemaReady: false,
      errorMessage:
        err instanceof Error ? err.message : "Asset library check failed.",
    };
  }
}
