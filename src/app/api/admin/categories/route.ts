import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminCatalogueData } from "@/lib/marketplace/db";
import { requireAdminApi } from "@/lib/supabase/auth";

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

  return NextResponse.json({ categories: data.categories });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as {
      name?: string;
      slug?: string;
      description?: string;
      iconName?: string;
      displayOrder?: number;
    };

    const name = body.name?.trim() ?? "";
    const slug = normalizeSlug(body.slug?.trim() || name);

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Category name and slug are required." },
        { status: 400 }
      );
    }

    const { data: existing } = await auth.admin
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `A category with slug "${slug}" already exists.` },
        { status: 409 }
      );
    }

    const { data: created, error } = await auth.admin
      .from("categories")
      .insert({
        name,
        slug,
        description: body.description?.trim() ?? "",
        icon_name: body.iconName?.trim() || "Layers",
        display_order:
          typeof body.displayOrder === "number" ? body.displayOrder : 99,
      })
      .select("id, slug")
      .single();

    if (error || !created) {
      return NextResponse.json(
        { error: error?.message ?? "Failed to create category." },
        { status: 500 }
      );
    }

    revalidatePath("/marketplace");

    return NextResponse.json(
      { ok: true, id: created.id, slug: created.slug },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid category payload." },
      { status: 400 }
    );
  }
}
