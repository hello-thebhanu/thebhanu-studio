import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  STARTER_ASSET_CATEGORIES,
  STARTER_UI_ASSETS,
} from "@/lib/assets/starter-assets";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    for (const cat of STARTER_ASSET_CATEGORIES) {
      const { error } = await auth.admin.from("asset_categories").upsert(
        {
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          display_order: cat.displayOrder,
        },
        { onConflict: "slug" }
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data: dbCats, error: catErr } = await auth.admin
      .from("asset_categories")
      .select("id, slug");

    if (catErr || !dbCats) {
      return NextResponse.json(
        { error: catErr?.message ?? "Failed to read asset categories." },
        { status: 500 }
      );
    }

    const catIdBySlug = new Map(
      dbCats.map((c) => [c.slug as string, c.id as string])
    );

    let seededAssets = 0;
    for (const asset of STARTER_UI_ASSETS) {
      const { data: existing } = await auth.admin
        .from("ui_assets")
        .select("id")
        .eq("slug", asset.slug)
        .maybeSingle();

      if (existing) continue;

      const categoryId = catIdBySlug.get(asset.categorySlug);
      if (!categoryId) continue;

      const { error } = await auth.admin.from("ui_assets").insert({
        slug: asset.slug,
        name: asset.name,
        summary: asset.summary,
        usage_instructions: asset.usageInstructions,
        category_id: categoryId,
        asset_type: asset.assetType,
        preview_key: asset.previewKey,
        code_snippet: asset.codeSnippet,
        code_language: asset.codeLanguage,
        resource_url: asset.resourceUrl,
        dependencies: asset.dependencies,
        tags: asset.tags,
        status: asset.status,
        published: Boolean(asset.published),
        featured: asset.featured,
        is_demo_record: asset.isDemoRecord,
        seo_title: asset.seoTitle,
        seo_description: asset.seoDescription,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      seededAssets += 1;
    }

    revalidatePath("/components");
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      ok: true,
      seededAssets,
      totalCategories: dbCats.length,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to seed starter UI assets." },
      { status: 500 }
    );
  }
}
