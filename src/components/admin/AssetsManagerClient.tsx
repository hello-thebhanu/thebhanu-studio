"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { ProductStatusBadge } from "@/components/marketplace/ProductStatusBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import type {
  AssetAvailability,
  AssetCategoryWithCount,
  AssetPreviewKey,
  AssetType,
  UiAssetRecord,
} from "@/lib/assets/types";

const ASSET_TYPES: AssetType[] = [
  "UI Component",
  "UI Kit",
  "Design Token",
  "Motion Primitive",
];

const PREVIEW_KEYS: AssetPreviewKey[] = [
  "glass-card",
  "moss-button",
  "shimmer-skeleton",
  "status-badges",
  "floating-nav",
  "reveal-frame",
];

const STATUS_OPTIONS: AssetAvailability[] = [
  "Available",
  "Coming Soon",
  "Under Development",
  "Unavailable",
];

function slugify(val: string) {
  return val
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AssetsManagerClient({
  schemaReady,
  errorMessage,
  initialAssets,
  categories,
}: {
  schemaReady: boolean;
  errorMessage?: string;
  initialAssets: UiAssetRecord[];
  categories: AssetCategoryWithCount[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<UiAssetRecord | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [usageInstructions, setUsageInstructions] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [assetType, setAssetType] = useState<AssetType>("UI Component");
  const [previewKey, setPreviewKey] = useState<AssetPreviewKey>("glass-card");
  const [codeLanguage, setCodeLanguage] = useState("tsx");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [dependenciesText, setDependenciesText] = useState("tailwindcss");
  const [tagsText, setTagsText] = useState("");
  const [status, setStatus] = useState<AssetAvailability>("Available");
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setSummary("");
    setUsageInstructions("");
    setCategoryId(categories[0]?.id ?? "");
    setAssetType("UI Component");
    setPreviewKey("glass-card");
    setCodeLanguage("tsx");
    setCodeSnippet("");
    setResourceUrl("");
    setDependenciesText("tailwindcss");
    setTagsText("");
    setStatus("Available");
    setPublished(true);
    setFeatured(false);
    setError(null);
    setShowForm(true);
  };

  const openEdit = (asset: UiAssetRecord) => {
    setEditing(asset);
    setName(asset.name);
    setSlug(asset.slug);
    setSummary(asset.summary);
    setUsageInstructions(asset.usageInstructions);
    setCategoryId(asset.categoryId ?? categories[0]?.id ?? "");
    setAssetType(asset.assetType);
    setPreviewKey(asset.previewKey);
    setCodeLanguage(asset.codeLanguage || "tsx");
    setCodeSnippet(asset.codeSnippet);
    setResourceUrl(asset.resourceUrl ?? "");
    setDependenciesText(asset.dependencies.join(", "));
    setTagsText(asset.tags.join(", "));
    setStatus(asset.status);
    setPublished(asset.published ?? true);
    setFeatured(asset.featured);
    setError(null);
    setShowForm(true);
  };

  const handleSeed = async () => {
    setBusy(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/assets/seed", { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        seededAssets?: number;
        totalCategories?: number;
      };
      if (!res.ok) {
        setError(data.error ?? "Failed to seed starter assets.");
      } else {
        setFeedback(
          `Synced ${data.totalCategories ?? 0} asset categories and added ${data.seededAssets ?? 0} UI asset(s).`
        );
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFeedback(null);

    const payload = {
      name,
      slug,
      summary,
      usageInstructions,
      categoryId,
      assetType,
      previewKey,
      codeLanguage,
      codeSnippet,
      resourceUrl: resourceUrl || null,
      dependencies: dependenciesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      tags: tagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status,
      published,
      featured,
    };

    try {
      const res = await fetch(
        editing ? `/api/admin/assets/${editing.id}` : "/api/admin/assets",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to save UI asset.");
      } else {
        setShowForm(false);
        setFeedback(editing ? `Updated "${name}".` : `Created "${name}".`);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const toggleFlag = async (
    asset: UiAssetRecord,
    field: "published" | "featured",
    value: boolean
  ) => {
    setBusy(true);
    try {
      await fetch(`/api/admin/assets/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (asset: UiAssetRecord) => {
    if (!window.confirm(`Delete "${asset.name}" from UI Assets?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/assets/${asset.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedback(`Deleted "${asset.name}".`);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  if (!schemaReady) {
    return (
      <GlassCard className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-500">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Phase 5 SQL Migration Required
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Run{" "}
              <code className="rounded bg-[var(--glass-bg-subtle)] px-1.5 py-0.5 font-mono text-xs">
                supabase/migrations/0002_phase5_ui_asset_library.sql
              </code>{" "}
              in your Supabase SQL Editor to create `asset_categories` and
              `ui_assets`, then refresh this page.
            </p>
            {errorMessage ? (
              <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
                Details: {errorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <GlassCard className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            UI Components &amp; Asset Library ({initialAssets.length})
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
            Manage reusable components, live preview presets, code snippets, and
            public visibility at{" "}
            <Link href="/components" className="text-[var(--accent-primary)] underline">
              /components
            </Link>
            .
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={handleSeed}
            className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-4 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--glass-border-accent)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <Database className="h-4 w-4" aria-hidden="true" />
            <span>Sync Starter Library</span>
          </button>

          <button
            type="button"
            disabled={busy || categories.length === 0}
            onClick={openCreate}
            className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-5 text-xs font-semibold text-white shadow-sm hover:brightness-105 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>New UI Asset</span>
          </button>
        </div>
      </GlassCard>

      {error ? (
        <div className="rounded-[var(--radius-md)] border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      ) : null}

      {feedback ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] p-3 font-mono text-xs text-[var(--accent-primary)]">
          {feedback}
        </div>
      ) : null}

      {showForm ? (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-3">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {editing ? `Edit: ${editing.name}` : "Create UI Asset"}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <span>Name *</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editing) setSlug(slugify(e.target.value));
                  }}
                  className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <span>Slug *</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 font-mono text-sm text-[var(--text-primary)]"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <span>Category *</span>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
                  <span>Asset Type</span>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as AssetType)}
                    className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)]"
                  >
                    {ASSET_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
                  <span>Live Preview Preset</span>
                  <select
                    value={previewKey}
                    onChange={(e) =>
                      setPreviewKey(e.target.value as AssetPreviewKey)
                    }
                    className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)]"
                  >
                    {PREVIEW_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
              <span>Summary *</span>
              <input
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <span>Code Snippet ({codeLanguage})</span>
                <textarea
                  rows={6}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  className="rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 p-3 font-mono text-xs text-[var(--text-primary)]"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <span>Usage Instructions</span>
                <textarea
                  rows={6}
                  value={usageInstructions}
                  onChange={(e) => setUsageInstructions(e.target.value)}
                  className="rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 p-3 text-xs text-[var(--text-primary)]"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <span>Language</span>
                <input
                  type="text"
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 font-mono text-xs text-[var(--text-primary)]"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <span>Dependencies (comma)</span>
                <input
                  type="text"
                  value={dependenciesText}
                  onChange={(e) => setDependenciesText(e.target.value)}
                  className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-xs text-[var(--text-primary)]"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <span>Tags (comma)</span>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-xs text-[var(--text-primary)]"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-secondary)]">
                <span>Status</span>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as AssetAvailability)
                  }
                  className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)]"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--glass-border)] pt-4">
              <div className="flex items-center gap-5">
                <label className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="h-4 w-4 accent-[#527B48]"
                  />
                  <span>Published</span>
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 accent-[#527B48]"
                  />
                  <span>Featured</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="min-h-10 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-6 text-sm font-semibold text-white cursor-pointer"
              >
                {busy ? "Saving..." : editing ? "Save Asset" : "Create Asset"}
              </button>
            </div>
          </form>
        </GlassCard>
      ) : null}

      {/* Asset List */}
      <GlassCard className="overflow-hidden p-0">
        {initialAssets.length === 0 ? (
          <div className="p-10 text-center text-sm text-[var(--text-muted)]">
            No UI assets in database yet. Click &ldquo;Sync Starter
            Library&rdquo; above to populate the starter components.
          </div>
        ) : (
          <div className="divide-y divide-[var(--glass-border)]">
            {initialAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      {asset.name}
                    </h3>
                    <ProductStatusBadge status={asset.status} />
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                    /components/{asset.slug} · {asset.assetType} · preset:{" "}
                    {asset.previewKey}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      toggleFlag(asset, "published", !asset.published)
                    }
                    className={`inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-pill)] border px-3 text-xs font-medium cursor-pointer ${
                      asset.published
                        ? "border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]"
                        : "border-[var(--glass-border)] text-[var(--text-muted)]"
                    }`}
                  >
                    {asset.published ? (
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    <span>{asset.published ? "Published" : "Draft"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      toggleFlag(asset, "featured", !asset.featured)
                    }
                    className={`inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-pill)] border px-3 text-xs font-medium cursor-pointer ${
                      asset.featured
                        ? "border-[#A5CE79]/55 bg-[#527B48] text-white"
                        : "border-[var(--glass-border)] text-[var(--text-muted)]"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Featured</span>
                  </button>

                  <Link
                    href={`/components/${asset.slug}`}
                    className="inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => openEdit(asset)}
                    className="inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/80 px-3 text-xs font-medium text-[var(--text-primary)] cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(asset)}
                    className="inline-flex min-h-8 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-2.5 text-xs text-red-500 hover:bg-red-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
