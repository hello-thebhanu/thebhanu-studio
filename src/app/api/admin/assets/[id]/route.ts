import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

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

    const { data: existing } = await auth.admin
      .from("ui_assets")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "UI asset not found." }, { status: 404 });
    }

    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.summary !== undefined) patch.summary = body.summary.trim();
    if (body.usageInstructions !== undefined) {
      patch.usage_instructions = body.usageInstructions.trim();
    }
    if (body.categoryId !== undefined) patch.category_id = body.categoryId.trim();
    if (body.assetType !== undefined) patch.asset_type = body.assetType.trim();
    if (body.previewKey !== undefined) patch.preview_key = body.previewKey.trim();
    if (body.codeSnippet !== undefined) patch.code_snippet = body.codeSnippet;
    if (body.codeLanguage !== undefined) {
      patch.code_language = body.codeLanguage.trim();
    }
    if (body.resourceUrl !== undefined) {
      patch.resource_url = body.resourceUrl?.trim() || null;
    }
    if (body.dependencies !== undefined) {
      patch.dependencies = body.dependencies.map((d) => d.trim()).filter(Boolean);
    }
    if (body.tags !== undefined) {
      patch.tags = body.tags.map((t) => t.trim()).filter(Boolean);
    }
    if (body.status !== undefined && VALID_STATUSES.has(body.status)) {
      patch.status = body.status;
    }
    if (body.published !== undefined) patch.published = Boolean(body.published);
    if (body.featured !== undefined) patch.featured = Boolean(body.featured);
    if (body.seoTitle !== undefined) patch.seo_title = body.seoTitle.trim();
    if (body.seoDescription !== undefined) {
      patch.seo_description = body.seoDescription.trim();
    }
    if (body.slug !== undefined) {
      const nextSlug = normalizeSlug(body.slug);
      if (!nextSlug) {
        return NextResponse.json({ error: "Slug cannot be empty." }, { status: 400 });
      }
      if (nextSlug !== existing.slug) {
        const { data: taken } = await auth.admin
          .from("ui_assets")
          .select("id")
          .eq("slug", nextSlug)
          .neq("id", id)
          .maybeSingle();
        if (taken) {
          return NextResponse.json(
            { error: `Slug "${nextSlug}" is already in use.` },
            { status: 409 }
          );
        }
      }
      patch.slug = nextSlug;
    }

    const { error } = await auth.admin
      .from("ui_assets")
      .update(patch)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/components");
    revalidatePath(`/components/${existing.slug}`);
    if (typeof patch.slug === "string" && patch.slug !== existing.slug) {
      revalidatePath(`/components/${patch.slug}`);
    }
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to update UI asset." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const { data: existing } = await auth.admin
    .from("ui_assets")
    .select("id, slug")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "UI asset not found." }, { status: 404 });
  }

  const { error } = await auth.admin.from("ui_assets").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/components");
  revalidatePath(`/components/${existing.slug}`);
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ ok: true });
}
