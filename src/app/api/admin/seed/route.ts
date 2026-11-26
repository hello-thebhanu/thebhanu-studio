import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { PRODUCT_CATEGORIES } from "@/lib/marketplace/categories";
import { PRODUCTS_CATALOGUE } from "@/lib/marketplace/products";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    // 1. Upsert categories idempotently by slug
    for (const cat of PRODUCT_CATEGORIES) {
      const { error } = await auth.admin.from("categories").upsert(
        {
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          icon_name: cat.iconName,
          display_order: cat.displayOrder,
        },
        { onConflict: "slug" }
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data: dbCategories, error: catFetchErr } = await auth.admin
      .from("categories")
      .select("id, slug");

    if (catFetchErr || !dbCategories) {
      return NextResponse.json(
        { error: catFetchErr?.message ?? "Failed to read categories." },
        { status: 500 }
      );
    }

    const categoryIdBySlug = new Map(
      dbCategories.map((c) => [c.slug as string, c.id as string])
    );

    // 2. Insert missing sample products (never overwrite admin-edited products)
    let insertedCount = 0;
    for (const prod of PRODUCTS_CATALOGUE) {
      const { data: existing } = await auth.admin
        .from("products")
        .select("id")
        .eq("slug", prod.slug)
        .maybeSingle();

      if (existing) continue;

      const categoryId = categoryIdBySlug.get(prod.categorySlug);
      if (!categoryId) continue;

      const { data: created, error: prodErr } = await auth.admin
        .from("products")
        .insert({
          slug: prod.slug,
          name: prod.name,
          short_description: prod.shortDescription,
          full_description: prod.fullDescription,
          category_id: categoryId,
          product_type: prod.productType,
          status: prod.status,
          published: prod.status !== "Unavailable",
          featured: prod.featured,
          is_demo_record: prod.isDemoRecord,
          thumbnail_url: prod.thumbnail?.url ?? null,
          thumbnail_alt: prod.thumbnail?.alt ?? `${prod.name} preview`,
          features: prod.features,
          technologies: prod.technologies,
          preview_url: prod.previewUrl,
          live_demo_url: prod.liveDemoUrl,
          documentation_url: prod.documentationUrl,
          seo_title: prod.seoTitle,
          seo_description: prod.seoDescription,
        })
        .select("id")
        .single();

      if (prodErr || !created) {
        return NextResponse.json(
          { error: prodErr?.message ?? "Failed to seed product." },
          { status: 500 }
        );
      }

      if (prod.gallery.length > 0) {
        await auth.admin.from("product_images").insert(
          prod.gallery.map((img, idx) => ({
            product_id: created.id,
            url: img.url,
            storage_path: null,
            alt: img.alt,
            caption: img.caption ?? null,
            sort_order: idx,
          }))
        );
      }

      insertedCount += 1;
    }

    revalidatePath("/marketplace");
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      ok: true,
      seededProducts: insertedCount,
      totalCategories: dbCategories.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to seed initial catalogue." },
      { status: 500 }
    );
  }
}
