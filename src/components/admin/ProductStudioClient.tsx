"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Copy,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProductStatusBadge } from "@/components/marketplace/ProductStatusBadge";
import type {
  ProductCategoryWithCount,
  ProductRecord,
} from "@/lib/marketplace/types";
import { ProductEditorModal } from "./ProductEditorModal";

export function ProductStudioClient({
  initialProducts,
  categories,
}: {
  initialProducts: ProductRecord[];
  categories: ProductCategoryWithCount[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "draft">("all");
  const [editorProduct, setEditorProduct] = useState<ProductRecord | null>(() => {
    const editId = searchParams.get("edit");
    return editId ? initialProducts.find((p) => p.id === editId) ?? null : null;
  });
  const [isCreating, setIsCreating] = useState(
    () => searchParams.get("new") === "1"
  );
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const categoryNameMap = useMemo(
    () => new Map(categories.map((c) => [c.slug, c.name])),
    [categories]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialProducts.filter((p) => {
      if (categoryFilter !== "all" && p.categorySlug !== categoryFilter) {
        return false;
      }
      if (publishFilter === "published" && !p.published) return false;
      if (publishFilter === "draft" && p.published) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q)
      );
    });
  }, [categoryFilter, initialProducts, publishFilter, query]);

  const toggleField = async (
    product: ProductRecord,
    field: "published" | "featured",
    value: boolean
  ) => {
    setBusyId(product.id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setFeedback(data.error ?? "Update failed.");
      } else {
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = async (product: ProductRecord) => {
    setBusyId(product.id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/duplicate`, {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string; slug?: string };
      if (!res.ok) {
        setFeedback(data.error ?? "Failed to duplicate product.");
      } else {
        setFeedback(`Duplicated as draft (${data.slug}).`);
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (product: ProductRecord) => {
    if (
      !window.confirm(
        `Permanently delete "${product.name}" and its uploaded media assets?`
      )
    ) {
      return;
    }
    setBusyId(product.id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setFeedback(data.error ?? "Failed to delete product.");
      } else {
        setFeedback(`Deleted "${product.name}".`);
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <GlassCard className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter products by name, slug, or type..."
              className="min-h-10 w-full rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 pr-3.5 pl-10 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="min-h-10 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3.5 text-xs text-[var(--text-primary)]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={publishFilter}
            onChange={(e) =>
              setPublishFilter(e.target.value as "all" | "published" | "draft")
            }
            aria-label="Filter by publishing status"
            className="min-h-10 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3.5 text-xs text-[var(--text-primary)]"
          >
            <option value="all">All Visibility</option>
            <option value="published">Published Only</option>
            <option value="draft">Draft / Unpublished</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditorProduct(null);
            setIsCreating(true);
          }}
          disabled={categories.length === 0}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-5 text-xs font-semibold text-white shadow-sm hover:brightness-105 disabled:opacity-50 cursor-pointer"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>New Product</span>
        </button>
      </GlassCard>

      {feedback ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-4 py-2.5 font-mono text-xs text-[var(--accent-primary)]">
          {feedback}
        </div>
      ) : null}

      {/* Product Rows */}
      <GlassCard className="overflow-hidden p-0">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--text-muted)]">
            No products match your current filter.
          </div>
        ) : (
          <div className="divide-y divide-[var(--glass-border)]">
            {filtered.map((product) => {
              const busy = busyId === product.id;
              return (
                <div
                  key={product.id}
                  className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center sm:p-5"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-14 w-22 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-[#2F332A]">
                      {product.thumbnail?.url ? (
                        <img
                          src={product.thumbnail.url}
                          alt={product.thumbnail.alt || product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {product.name}
                        </h3>
                        <ProductStatusBadge status={product.status} />
                      </div>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-[var(--text-muted)]">
                        /{product.slug} ·{" "}
                        {categoryNameMap.get(product.categorySlug) ??
                          product.categorySlug}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        toggleField(product, "published", !product.published)
                      }
                      className={`inline-flex min-h-8 items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 text-xs font-medium transition-colors cursor-pointer ${
                        product.published
                          ? "border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]"
                          : "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-muted)]"
                      }`}
                    >
                      {product.published ? (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span>{product.published ? "Published" : "Draft"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        toggleField(product, "featured", !product.featured)
                      }
                      className={`inline-flex min-h-8 items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 text-xs font-medium transition-colors cursor-pointer ${
                        product.featured
                          ? "border-[#A5CE79]/55 bg-[#527B48] text-white"
                          : "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-muted)]"
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Featured</span>
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setIsCreating(false);
                        setEditorProduct(product);
                      }}
                      className="inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/80 px-3 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--glass-border-accent)] cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDuplicate(product)}
                      title="Duplicate as draft"
                      className="inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/80 px-3 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--glass-border-accent)] cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Duplicate</span>
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(product)}
                      title="Delete product"
                      className="inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/80 px-2.5 text-xs text-red-500 hover:border-red-500/40 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {isCreating || editorProduct ? (
        <ProductEditorModal
          product={editorProduct}
          categories={categories}
          onClose={() => {
            setIsCreating(false);
            setEditorProduct(null);
          }}
          onSaved={() => {
            setIsCreating(false);
            setEditorProduct(null);
            setFeedback("Product saved and marketplace revalidated.");
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
