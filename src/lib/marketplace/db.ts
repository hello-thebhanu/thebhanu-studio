import { createClient } from "@supabase/supabase-js";
import { PRODUCT_CATEGORIES } from "./categories";
import { PRODUCTS_CATALOGUE } from "./products";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  CategoryIconName,
  ProductAvailability,
  ProductCategory,
  ProductCategoryWithCount,
  ProductImage,
  ProductRecord,
} from "./types";

const VALID_ICONS = new Set<CategoryIconName>([
  "Globe",
  "LayoutTemplate",
  "Layers",
  "Sparkles",
  "Smartphone",
  "Component",
  "BarChart3",
  "Bot",
  "Workflow",
  "Code2",
]);

function normalizeIcon(raw: string | null | undefined): CategoryIconName {
  if (raw && VALID_ICONS.has(raw as CategoryIconName)) {
    return raw as CategoryIconName;
  }
  return "Layers";
}

interface DbCategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  display_order: number | null;
}

interface DbProductImageRow {
  id: string;
  product_id: string;
  url: string;
  storage_path: string | null;
  alt: string | null;
  caption: string | null;
  sort_order: number | null;
}

interface DbProductRow {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  full_description: string | null;
  category_id: string;
  product_type: string | null;
  status: ProductAvailability;
  published: boolean;
  featured: boolean;
  is_demo_record: boolean;
  thumbnail_url: string | null;
  thumbnail_alt: string | null;
  thumbnail_storage_path: string | null;
  features: string[] | null;
  technologies: string[] | null;
  preview_url: string | null;
  live_demo_url: string | null;
  documentation_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

function mapCategory(row: DbCategoryRow): ProductCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    iconName: normalizeIcon(row.icon_name),
    accentTag: row.name.split(" ")[0] ?? "Product",
    displayOrder: row.display_order ?? 0,
  };
}

function mapProduct(
  row: DbProductRow,
  categorySlugById: Map<string, string>,
  imagesByProductId: Map<string, ProductImage[]>
): ProductRecord {
  const gallery = imagesByProductId.get(row.id) ?? [];
  const thumbnail: ProductImage | null = row.thumbnail_url
    ? {
        id: `thumb-${row.id}`,
        url: row.thumbnail_url,
        alt: row.thumbnail_alt || `${row.name} preview`,
        storagePath: row.thumbnail_storage_path,
      }
    : gallery[0] ?? null;

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    fullDescription: row.full_description ?? "",
    categorySlug: categorySlugById.get(row.category_id) ?? "websites-and-templates",
    categoryId: row.category_id,
    productType: row.product_type ?? "Digital Product",
    thumbnail,
    thumbnailStoragePath: row.thumbnail_storage_path,
    gallery,
    technologies: row.technologies ?? [],
    features: row.features ?? [],
    status: row.status,
    published: row.published,
    featured: row.featured,
    isDemoRecord: row.is_demo_record,
    previewUrl: row.preview_url,
    liveDemoUrl: row.live_demo_url,
    documentationUrl: row.documentation_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    seoTitle: row.seo_title || row.name,
    seoDescription: row.seo_description || row.short_description,
  };
}

function createPublicSupabaseClient() {
  const { url, publishableKey, isConfigured } = getSupabaseEnv();
  if (!isConfigured) return null;
  return createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getPublicMarketplaceData(): Promise<{
  categories: ProductCategory[];
  products: ProductRecord[];
  source: "supabase" | "fallback";
}> {
  const supabase = createPublicSupabaseClient();
  if (!supabase) {
    return {
      categories: PRODUCT_CATEGORIES,
      products: PRODUCTS_CATALOGUE,
      source: "fallback",
    };
  }

  try {
    const [catRes, prodRes, imgRes] = await Promise.all([
      supabase
        .from("categories")
        .select("id, slug, name, description, icon_name, display_order")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("products")
        .select("*")
        .eq("published", true)
        .neq("status", "Unavailable")
        .order("created_at", { ascending: false }),
      supabase
        .from("product_images")
        .select("id, product_id, url, storage_path, alt, caption, sort_order")
        .order("sort_order", { ascending: true }),
    ]);

    if (catRes.error || prodRes.error) {
      return {
        categories: PRODUCT_CATEGORIES,
        products: PRODUCTS_CATALOGUE,
        source: "fallback",
      };
    }

    const dbCategories = (catRes.data ?? []) as DbCategoryRow[];
    if (dbCategories.length === 0) {
      return {
        categories: PRODUCT_CATEGORIES,
        products: PRODUCTS_CATALOGUE,
        source: "fallback",
      };
    }

    const categories = dbCategories.map(mapCategory);
    const categorySlugById = new Map(categories.map((c) => [c.id, c.slug]));

    const imagesByProductId = new Map<string, ProductImage[]>();
    for (const img of (imgRes.data ?? []) as DbProductImageRow[]) {
      const list = imagesByProductId.get(img.product_id) ?? [];
      list.push({
        id: img.id,
        url: img.url,
        alt: img.alt ?? "",
        caption: img.caption ?? undefined,
        storagePath: img.storage_path,
      });
      imagesByProductId.set(img.product_id, list);
    }

    const products = ((prodRes.data ?? []) as DbProductRow[]).map((row) =>
      mapProduct(row, categorySlugById, imagesByProductId)
    );

    return { categories, products, source: "supabase" };
  } catch {
    return {
      categories: PRODUCT_CATEGORIES,
      products: PRODUCTS_CATALOGUE,
      source: "fallback",
    };
  }
}

export async function getPublicProductBySlugFromDb(slug: string): Promise<{
  product: ProductRecord | null;
  categories: ProductCategory[];
  relatedProducts: ProductRecord[];
}> {
  const { categories, products } = await getPublicMarketplaceData();
  const product = products.find((p) => p.slug === slug) ?? null;
  if (!product) {
    return { product: null, categories, relatedProducts: [] };
  }

  const sameCategory = products.filter(
    (p) => p.id !== product.id && p.categorySlug === product.categorySlug
  );
  const featuredOthers = products.filter(
    (p) => p.id !== product.id && p.categorySlug !== product.categorySlug && p.featured
  );
  const rest = products.filter(
    (p) => p.id !== product.id && p.categorySlug !== product.categorySlug && !p.featured
  );
  const relatedProducts = [...sameCategory, ...featuredOthers, ...rest].slice(0, 3);

  return { product, categories, relatedProducts };
}

export async function getAdminCatalogueData(): Promise<{
  categories: ProductCategoryWithCount[];
  products: ProductRecord[];
  schemaReady: boolean;
  errorMessage?: string;
}> {
  try {
    const admin = createSupabaseAdminClient();
    const [catRes, prodRes, imgRes] = await Promise.all([
      admin
        .from("categories")
        .select("id, slug, name, description, icon_name, display_order")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true }),
      admin
        .from("products")
        .select("*")
        .order("updated_at", { ascending: false }),
      admin
        .from("product_images")
        .select("id, product_id, url, storage_path, alt, caption, sort_order")
        .order("sort_order", { ascending: true }),
    ]);

    if (catRes.error) {
      return {
        categories: [],
        products: [],
        schemaReady: false,
        errorMessage: catRes.error.message,
      };
    }

    if (prodRes.error) {
      return {
        categories: [],
        products: [],
        schemaReady: false,
        errorMessage: prodRes.error.message,
      };
    }

    const categories = ((catRes.data ?? []) as DbCategoryRow[]).map(mapCategory);
    const categorySlugById = new Map(categories.map((c) => [c.id, c.slug]));

    const imagesByProductId = new Map<string, ProductImage[]>();
    for (const img of (imgRes.data ?? []) as DbProductImageRow[]) {
      const list = imagesByProductId.get(img.product_id) ?? [];
      list.push({
        id: img.id,
        url: img.url,
        alt: img.alt ?? "",
        caption: img.caption ?? undefined,
        storagePath: img.storage_path,
      });
      imagesByProductId.set(img.product_id, list);
    }

    const products = ((prodRes.data ?? []) as DbProductRow[]).map((row) =>
      mapProduct(row, categorySlugById, imagesByProductId)
    );

    const countBySlug = new Map<string, number>();
    for (const p of products) {
      countBySlug.set(p.categorySlug, (countBySlug.get(p.categorySlug) ?? 0) + 1);
    }

    const categoriesWithCounts: ProductCategoryWithCount[] = categories.map((cat) => ({
      ...cat,
      productCount: countBySlug.get(cat.slug) ?? 0,
    }));

    return {
      categories: categoriesWithCounts,
      products,
      schemaReady: true,
    };
  } catch (err) {
    return {
      categories: [],
      products: [],
      schemaReady: false,
      errorMessage: err instanceof Error ? err.message : "Database check failed.",
    };
  }
}
