import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/supabase/auth";

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
      description?: string;
      iconName?: string;
      displayOrder?: number;
    };

    const { data: existing } = await auth.admin
      .from("categories")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.description !== undefined) patch.description = body.description.trim();
    if (body.iconName !== undefined) patch.icon_name = body.iconName.trim();
    if (typeof body.displayOrder === "number") patch.display_order = body.displayOrder;

    if (body.slug !== undefined) {
      const nextSlug = normalizeSlug(body.slug);
      if (!nextSlug) {
        return NextResponse.json(
          { error: "Category slug cannot be empty." },
          { status: 400 }
        );
      }
      if (nextSlug !== existing.slug) {
        const { data: collision } = await auth.admin
          .from("categories")
          .select("id")
          .eq("slug", nextSlug)
          .neq("id", id)
          .maybeSingle();
        if (collision) {
          return NextResponse.json(
            { error: `Category slug "${nextSlug}" is already in use.` },
            { status: 409 }
          );
        }
      }
      patch.slug = nextSlug;
    }

    const { error } = await auth.admin
      .from("categories")
      .update(patch)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/marketplace");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to update category." },
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

  const { count, error: countErr } = await auth.admin
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500 });
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete category: ${count} product(s) are still assigned to it. Reassign or remove those products first.`,
      },
      { status: 409 }
    );
  }

  const { error } = await auth.admin
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/marketplace");
  return NextResponse.json({ ok: true });
}
