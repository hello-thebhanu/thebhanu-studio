import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminCatalogueData } from "@/lib/marketplace/db";
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

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const data = await getAdminCatalogueData();
  if (!data.schemaReady) {
    return NextResponse.json(
      { error: data.errorMessage ?? "Database schema not ready." },
      { status: 503 }
    );
  }

  return NextResponse.json({
    products: data.products,
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

    const name = body.name?.trim() ?? "";
    const slug = normalizeSlug(body.slug?.trim() || name);
    const shortDescription = body.shortDescription?.trim() ?? "";
    const categoryId = body.categoryId?.trim() ?? "";

    if (!name || !slug || !shortDescription || !categoryId) {
      return NextResponse.json(
        {
          error:
            "Product name, slug, short description, and category are required.",
        },
        { status: 400 }
      );
    }

    const status: ProductAvailability =
      body.status && VALID_STATUSES.has(body.status)
        ? body.status
        : "Under Development";

    const { data: existingSlug } = await auth.admin
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { error: `A product with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const { data: created, error: insertErr } = await auth.admin
      .from("products")
      .insert({
        name,
        slug,
        short_description: shortDescription,
        full_description: body.fullDescription?.trim() ?? "",
        category_id: categoryId,
        product_type: body.productType?.trim() || "Digital Product",
        status,
        published: Boolean(body.published),
        featured: Boolean(body.featured),
        is_demo_record: Boolean(body.isDemoRecord),
        thumbnail_url: body.thumbnailUrl?.trim() || null,
        thumbnail_alt: body.thumbnailAlt?.trim() || `${name} preview`,
        thumbnail_storage_path: body.thumbnailStoragePath || null,
        features: (body.features ?? []).map((f) => f.trim()).filter(Boolean),
        technologies: (body.technologies ?? []).map((t) => t.trim()).filter(Boolean),
        preview_url: body.previewUrl?.trim() || null,
        live_demo_url: body.liveDemoUrl?.trim() || null,
        documentation_url: body.documentationUrl?.trim() || null,
        seo_title: body.seoTitle?.trim() || name,
        seo_description: body.seoDescription?.trim() || shortDescription,
      })
      .select("id, slug")
      .single();

    if (insertErr || !created) {
      return NextResponse.json(
        { error: insertErr?.message ?? "Failed to create product." },
        { status: 500 }
      );
    }

    const gallery = (body.gallery ?? []).filter((g) => g.url?.trim());
    if (gallery.length > 0) {
      await auth.admin.from("product_images").insert(
        gallery.map((img, idx) => ({
          product_id: created.id,
          url: img.url.trim(),
          storage_path: img.storagePath ?? null,
          alt: img.alt?.trim() || `${name} screenshot ${idx + 1}`,
          caption: img.caption?.trim() || null,
          sort_order: idx,
        }))
      );
    }

    revalidatePath("/marketplace");
    revalidatePath(`/products/${created.slug}`);
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ ok: true, id: created.id, slug: created.slug }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid product payload." },
      { status: 400 }
    );
  }
}
