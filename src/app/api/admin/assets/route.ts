import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminAssetsData } from "@/lib/assets/db";
import type { AssetAvailability } from "@/lib/assets/types";
import { requireAdminApi } from "@/lib/supabase/auth";

const VALID_STATUSES = new Set<AssetAvailability>([
  "Available",
  "Coming Soon",
  "Under Development",
  "Unavailable",
]);

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const data = await getAdminAssetsData();
  if (!data.schemaReady) {
    return NextResponse.json(
      { error: data.errorMessage ?? "Asset library schema not ready." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    assets: data.assets,
    categories: data.categories,
  });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as {
      name?: string;
      slug?: string;
      summary?: string;
      usageInstructions?: string;
      categoryId?: string;
      assetType?: string;
      previewKey?: string;
      codeSnippet?: string;
      codeLanguage?: string;
      resourceUrl?: string | null;
      dependencies?: string[];
      tags?: string[];
      status?: AssetAvailability;
      published?: boolean;
      featured?: boolean;
      seoTitle?: string;
      seoDescription?: string;
    };

    const name = body.name?.trim() ?? "";
    const slug = normalizeSlug(body.slug?.trim() || name);
    const summary = body.summary?.trim() ?? "";
    const categoryId = body.categoryId?.trim() ?? "";

    if (!name || !slug || !summary || !categoryId) {
      return NextResponse.json(
        { error: "Name, slug, summary, and category are required." },
        { status: 400 }
      );
    }

    const { data: existingSlug } = await auth.admin
      .from("ui_assets")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { error: `An asset with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const status =
      body.status && VALID_STATUSES.has(body.status)
        ? body.status
        : "Available";

    const { data: created, error } = await auth.admin
      .from("ui_assets")
      .insert({
        name,
        slug,
        summary,
        usage_instructions: body.usageInstructions?.trim() ?? "",
        category_id: categoryId,
        asset_type: body.assetType?.trim() || "UI Component",
        preview_key: body.previewKey?.trim() || "glass-card",
        code_snippet: body.codeSnippet ?? "",
        code_language: body.codeLanguage?.trim() || "tsx",
        resource_url: body.resourceUrl?.trim() || null,
        dependencies: (body.dependencies ?? []).map((d) => d.trim()).filter(Boolean),
        tags: (body.tags ?? []).map((t) => t.trim()).filter(Boolean),
        status,
        published: Boolean(body.published),
        featured: Boolean(body.featured),
        is_demo_record: false,
        seo_title: body.seoTitle?.trim() || name,
        seo_description: body.seoDescription?.trim() || summary,
      })
      .select("id, slug")
      .single();

    if (error || !created) {
      return NextResponse.json(
        { error: error?.message ?? "Failed to create UI asset." },
        { status: 500 }
      );
    }

    revalidatePath("/components");
    revalidatePath(`/components/${created.slug}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json(
      { ok: true, id: created.id, slug: created.slug },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid UI asset payload." },
      { status: 400 }
    );
  }
}
