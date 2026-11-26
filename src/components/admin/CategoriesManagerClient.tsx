"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import type {
  CategoryIconName,
  ProductCategoryWithCount,
} from "@/lib/marketplace/types";

const ICON_OPTIONS: CategoryIconName[] = [
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
];

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoriesManagerClient({
  initialCategories,
}: {
  initialCategories: ProductCategoryWithCount[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<ProductCategoryWithCount | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState<CategoryIconName>("Layers");
  const [displayOrder, setDisplayOrder] = useState(
    initialCategories.length + 1
  );
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setIconName("Layers");
    setDisplayOrder(initialCategories.length + 1);
    setError(null);
  };

  const startEdit = (cat: ProductCategoryWithCount) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setIconName(cat.iconName);
    setDisplayOrder(cat.displayOrder);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch(
        editing
          ? `/api/admin/categories/${editing.id}`
          : "/api/admin/categories",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            description,
            iconName,
            displayOrder: Number(displayOrder) || 0,
          }),
        }
      );

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to save category.");
      } else {
        setFeedback(
          editing
            ? `Updated category "${name}".`
            : `Created category "${name}".`
        );
        startCreate();
        router.refresh();
      }
    } catch {
      setError("Network error while saving category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: ProductCategoryWithCount) => {
    if (cat.productCount > 0) {
      setError(
        `Cannot delete "${cat.name}" because ${cat.productCount} product(s) are assigned to it.`
      );
      return;
    }
    if (!window.confirm(`Delete empty category "${cat.name}"?`)) return;

    setBusyId(cat.id);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to delete category.");
      } else {
        setFeedback(`Deleted category "${cat.name}".`);
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Create / Edit Category Form */}
      <GlassCard className="p-6 lg:col-span-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {editing ? `Edit: ${editing.name}` : "Create Category"}
          </h2>
          {editing ? (
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Cancel</span>
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <span>Category Name *</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                if (!editing) setSlug(slugify(val));
              }}
              className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <span>Slug *</span>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 font-mono text-sm text-[var(--text-primary)]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <span>Description</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 p-3 text-sm text-[var(--text-primary)]"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Icon</span>
              <select
                value={iconName}
                onChange={(e) =>
                  setIconName(e.target.value as CategoryIconName)
                }
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)]"
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Order</span>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
              />
            </label>
          </div>

          {error ? (
            <p className="rounded-[var(--radius-md)] border border-red-500/35 bg-red-500/10 p-2.5 text-xs text-red-400">
              {error}
            </p>
          ) : null}

          {feedback ? (
            <p className="rounded-[var(--radius-md)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] p-2.5 font-mono text-xs text-[var(--accent-primary)]">
              {feedback}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-5 text-sm font-semibold text-white shadow-sm hover:brightness-105 disabled:opacity-60 cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>
              {saving
                ? "Saving..."
                : editing
                  ? "Update Category"
                  : "Create Category"}
            </span>
          </button>
        </form>
      </GlassCard>

      {/* Category List */}
      <GlassCard className="p-6 lg:col-span-7">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          All Categories ({initialCategories.length})
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Categories containing products are protected from accidental deletion.
        </p>

        <ul className="mt-5 divide-y divide-[var(--glass-border)]">
          {initialCategories.map((cat) => {
            const hasProducts = cat.productCount > 0;
            return (
              <li
                key={cat.id}
                className="flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[var(--text-primary)]">
                      {cat.name}
                    </span>
                    <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                      {cat.productCount} product{cat.productCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                    /{cat.slug} · {cat.iconName} · #{cat.displayOrder}
                  </p>
                  {cat.description ? (
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {cat.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(cat)}
                    className="inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/80 px-3 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--glass-border-accent)] cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    disabled={busyId === cat.id || hasProducts}
                    onClick={() => handleDelete(cat)}
                    title={
                      hasProducts
                        ? "Reassign or delete products in this category first"
                        : "Delete category"
                    }
                    className="inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-2.5 text-xs text-red-500 hover:border-red-500/40 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </GlassCard>
    </div>
  );
}
