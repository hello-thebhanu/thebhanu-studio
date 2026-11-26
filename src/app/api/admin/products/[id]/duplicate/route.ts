import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/auth";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  const { data: source, error } = await auth.admin
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !source) {
    return NextResponse.json({ error: "Source product not found." }, { status: 404 });
  }

  const baseSlug = `${source.slug}-copy`;
  let candidateSlug = baseSlug;
  let counter = 2;
  while (true) {
    const { data: taken } = await auth.admin
      .from("products")
      .select("id")
      .eq("slug", candidateSlug)
      .maybeSingle();
    if (!taken) break;
    candidateSlug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  const { data: duplicated, error: insertErr } = await auth.admin
    .from("products")
    .insert({
      slug: candidateSlug,
      name: `${source.name} (Copy)`,
      short_description: source.short_description,
      full_description: source.full_description,
      category_id: source.category_id,
      product_type: source.product_type,
      status: source.status,
      published: false,
      featured: false,
      is_demo_record: source.is_demo_record,
      thumbnail_url: source.thumbnail_url,
      thumbnail_alt: source.thumbnail_alt,
      thumbnail_storage_path: null,
      features: source.features ?? [],
      technologies: source.technologies ?? [],
      preview_url: source.preview_url,
      live_demo_url: source.live_demo_url,
      documentation_url: source.documentation_url,
      seo_title: `${source.seo_title || source.name} (Copy)`,
      seo_description: source.seo_description,
    })
    .select("id, slug")
    .single();

  if (insertErr || !duplicated) {
    return NextResponse.json(
      { error: insertErr?.message ?? "Failed to duplicate product." },
      { status: 500 }
    );
  }

  const { data: sourceImages } = await auth.admin
    .from("product_images")
    .select("url, alt, caption, sort_order")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  if (sourceImages && sourceImages.length > 0) {
    await auth.admin.from("product_images").insert(
      sourceImages.map((img) => ({
        product_id: duplicated.id,
        url: img.url,
        storage_path: null,
        alt: img.alt,
        caption: img.caption,
        sort_order: img.sort_order,
      }))
    );
  }

  revalidatePath("/marketplace");

  return NextResponse.json(
    { ok: true, id: duplicated.id, slug: duplicated.slug },
    { status: 201 }
  );
}
