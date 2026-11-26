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

function toSlug(val: string): string {
  return val
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryManagerClient({
  initialCategories,
}: {
  initialCategories: ProductCategoryWithCount[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [iconName, setIconName] = useState<CategoryIconName>("Layers");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setIconName("Layers");
    setDisplayOrder(initialCategories.length + 1);
  };

  const startEdit = (cat: ProductCategoryWithCount) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setIconName(cat.iconName);
    setDisplayOrder(cat.displayOrder);
    setFeedback(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const url = editingId
        ? `/api/admin/categories/${editingId}`
        : "/api/admin/categories";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || toSlug(name),
          description,
          iconName,
          displayOrder: Number(displayOrder) || 0,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFeedback({
          type: "error",
          text: data.error ?? "Failed to save category.",
        });
      } else {
        setFeedback({
          type: "success",
          text: editingId ? "Category updated." : "Category created.",
        });
        resetForm();
        router.refresh();
      }
    } catch {
      setFeedback({ type: "error", text: "Network error saving category." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: ProductCategoryWithCount) => {
    if (cat.productCount > 0) {
      setFeedback({
        type: "error",
        text: `Cannot delete "${cat.name}" while ${cat.productCount} product(s) belong to it.`,
      });
      return;
    }

    if (!window.confirm(`Delete category "${cat.name}"?`)) return;

    setFeedback(null);
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setFeedback({
        type: "error",
        text: data.error ?? "Failed to delete category.",
      });
    } else {
      if (editingId === cat.id) resetForm();
      setFeedback({ type: "success", text: `Deleted "${cat.name}".` });
      router.refresh();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Create / Edit Category Form */}
      <GlassCard className="p-6 lg:col-span-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {editingId ? "Edit Category" : "Create Category"}
          </h2>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Cancel</span>
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                const v = e.target.value;
                setName(v);
                if (!editingId) setSlug(toSlug(v));
              }}
              placeholder="e.g. Developer Resources"
              className="mt-1.5 min-h-10 w-full rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">
              Slug
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(toSlug(e.target.value))}
              placeholder="developer-resources"
              className="mt-1.5 min-h-10 w-full rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 px-3 font-mono text-xs text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary shown on the marketplace..."
              className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 p-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                Icon
              </label>
              <select
                value={iconName}
                onChange={(e) => setIconName(e.target.value as CategoryIconName)}
                className="mt-1.5 min-h-10 w-full rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              >
                {ICON_OPTIONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="mt-1.5 min-h-10 w-full rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
              />
            </div>
          </div>

          {feedback ? (
            <div
              role="alert"
              className={`rounded-[var(--radius-md)] border px-3.5 py-2.5 text-xs font-medium ${
                feedback.type === "error"
                  ? "border-red-500/35 bg-red-500/10 text-red-600 dark:text-red-300"
                  : "border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]"
              }`}
            >
              {feedback.text}
            </div>
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
                : editingId
                  ? "Save Category Changes"
                  : "Create Category"}
            </span>
          </button>
        </form>
      </GlassCard>

      {/* Existing Categories List */}
      <GlassCard className="p-6 lg:col-span-7">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Catalogue Categories ({initialCategories.length})
        </h2>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Categories containing assigned products cannot be deleted until their
          products are reassigned.
        </p>

        <div className="mt-5 flex flex-col gap-3">
          {initialCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {cat.name}
                  </h3>
                  <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--accent-primary)]">
                    {cat.productCount} {cat.productCount === 1 ? "product" : "products"}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                  /{cat.slug} · Order {cat.displayOrder}
                </p>
                {cat.description ? (
                  <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                    {cat.description}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(cat)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/80 px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--glass-border-accent)] cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  disabled={cat.productCount > 0}
                  title={
                    cat.productCount > 0
                      ? "Reassign products before deleting this category"
                      : "Delete category"
                  }
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/80 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-red-500/40 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-45 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
