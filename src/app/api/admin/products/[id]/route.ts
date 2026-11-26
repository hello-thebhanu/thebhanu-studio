import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { ProductAvailability } from "@/lib/marketplace/types";
import { requireAdminApi } from "@/lib/supabase/auth";

const VALID_STATUSES = new Set<ProductAvailability>([
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
      shortDescription?: string;
      fullDescription?: string;
      categoryId?: string;
      productType?: string;
      status?: ProductAvailability;
      published?: boolean;
      featured?: boolean;
      isDemoRecord?: boolean;
      thumbnailUrl?: string | null;
      thumbnailAlt?: string | null;
      thumbnailStoragePath?: string | null;
      gallery?: Array<{
        url: string;
        alt?: string;
        caption?: string;
        storagePath?: string | null;
      }>;
      features?: string[];
      technologies?: string[];
      previewUrl?: string | null;
      liveDemoUrl?: string | null;
      documentationUrl?: string | null;
      seoTitle?: string;
      seoDescription?: string;
    };

    const { data: existing, error: fetchErr } = await auth.admin
      .from("products")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.slug !== undefined) {
      const nextSlug = normalizeSlug(body.slug);
      if (!nextSlug) {
        return NextResponse.json({ error: "Slug cannot be empty." }, { status: 400 });
      }
      if (nextSlug !== existing.slug) {
        const { data: collision } = await auth.admin
          .from("products")
          .select("id")
          .eq("slug", nextSlug)
          .neq("id", id)
          .maybeSingle();
        if (collision) {
          return NextResponse.json(
            { error: `Slug "${nextSlug}" is already in use.` },
            { status: 409 }
          );
        }
      }
      patch.slug = nextSlug;
    }
    if (body.shortDescription !== undefined) {
      patch.short_description = body.shortDescription.trim();
    }
    if (body.fullDescription !== undefined) {
      patch.full_description = body.fullDescription.trim();
    }
    if (body.categoryId !== undefined) patch.category_id = body.categoryId.trim();
    if (body.productType !== undefined) patch.product_type = body.productType.trim();
    if (body.status !== undefined && VALID_STATUSES.has(body.status)) {
      patch.status = body.status;
    }
    if (body.published !== undefined) patch.published = Boolean(body.published);
    if (body.featured !== undefined) patch.featured = Boolean(body.featured);
    if (body.isDemoRecord !== undefined) patch.is_demo_record = Boolean(body.isDemoRecord);
    if (body.thumbnailUrl !== undefined) {
      patch.thumbnail_url = body.thumbnailUrl?.trim() || null;
    }
    if (body.thumbnailAlt !== undefined) {
      patch.thumbnail_alt = body.thumbnailAlt?.trim() || null;
    }
    if (body.thumbnailStoragePath !== undefined) {
      patch.thumbnail_storage_path = body.thumbnailStoragePath || null;
    }
    if (body.features !== undefined) {
      patch.features = body.features.map((f) => f.trim()).filter(Boolean);
    }
    if (body.technologies !== undefined) {
      patch.technologies = body.technologies.map((t) => t.trim()).filter(Boolean);
    }
    if (body.previewUrl !== undefined) patch.preview_url = body.previewUrl?.trim() || null;
    if (body.liveDemoUrl !== undefined) {
      patch.live_demo_url = body.liveDemoUrl?.trim() || null;
    }
    if (body.documentationUrl !== undefined) {
      patch.documentation_url = body.documentationUrl?.trim() || null;
    }
    if (body.seoTitle !== undefined) patch.seo_title = body.seoTitle.trim();
    if (body.seoDescription !== undefined) {
      patch.seo_description = body.seoDescription.trim();
    }

    if (Object.keys(patch).length > 0) {
      const { error: updateErr } = await auth.admin
        .from("products")
        .update(patch)
        .eq("id", id);

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
    }

    if (body.gallery !== undefined) {
      await auth.admin.from("product_images").delete().eq("product_id", id);
      const validGallery = body.gallery.filter((g) => g.url?.trim());
      if (validGallery.length > 0) {
        await auth.admin.from("product_images").insert(
          validGallery.map((img, idx) => ({
            product_id: id,
            url: img.url.trim(),
            storage_path: img.storagePath ?? null,
            alt: img.alt?.trim() || `Product screenshot ${idx + 1}`,
            caption: img.caption?.trim() || null,
            sort_order: idx,
          }))
        );
      }
    }

    revalidatePath("/marketplace");
    revalidatePath(`/products/${existing.slug}`);
    if (typeof patch.slug === "string" && patch.slug !== existing.slug) {
      revalidatePath(`/products/${patch.slug}`);
    }
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to update product." },
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
    .from("products")
    .select("id, slug, thumbnail_storage_path")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const { data: imgs } = await auth.admin
    .from("product_images")
    .select("storage_path")
    .eq("product_id", id);

  const storagePaths = [
    existing.thumbnail_storage_path,
    ...(imgs ?? []).map((i) => i.storage_path),
  ].filter((p): p is string => Boolean(p));

  const { error: delErr } = await auth.admin
    .from("products")
    .delete()
    .eq("id", id);

  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }

  if (storagePaths.length > 0) {
    await auth.admin.storage.from("product-media").remove(storagePaths);
  }

  revalidatePath("/marketplace");
  revalidatePath(`/products/${existing.slug}`);
  revalidatePath("/sitemap.xml");

  return NextResponse.json({ ok: true });
}
