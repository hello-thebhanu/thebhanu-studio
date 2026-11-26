"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, Upload, X } from "lucide-react";
import type {
  ProductAvailability,
  ProductCategoryWithCount,
  ProductImage,
  ProductRecord,
} from "@/lib/marketplace/types";

interface ProductEditorModalProps {
  product: ProductRecord | null;
  categories: ProductCategoryWithCount[];
  onClose: () => void;
  onSaved: () => void;
}

const STATUS_OPTIONS: ProductAvailability[] = [
  "Available",
  "Coming Soon",
  "Under Development",
  "Unavailable",
];

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductEditorModal({
  product,
  categories,
  onClose,
  onSaved,
}: ProductEditorModalProps) {
  const isEditing = Boolean(product);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [categoryId, setCategoryId] = useState(
    product?.categoryId ?? categories[0]?.id ?? ""
  );
  const [productType, setProductType] = useState(
    product?.productType ?? "Digital Product"
  );
  const [status, setStatus] = useState<ProductAvailability>(
    product?.status ?? "Available"
  );
  const [published, setPublished] = useState(product?.published ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [isDemoRecord, setIsDemoRecord] = useState(
    product?.isDemoRecord ?? false
  );
  const [shortDescription, setShortDescription] = useState(
    product?.shortDescription ?? ""
  );
  const [fullDescription, setFullDescription] = useState(
    product?.fullDescription ?? ""
  );
  const [featuresText, setFeaturesText] = useState(
    (product?.features ?? []).join("\n")
  );
  const [technologiesText, setTechnologiesText] = useState(
    (product?.technologies ?? []).join(", ")
  );
  const [previewUrl, setPreviewUrl] = useState(product?.previewUrl ?? "");
  const [liveDemoUrl, setLiveDemoUrl] = useState(product?.liveDemoUrl ?? "");
  const [documentationUrl, setDocumentationUrl] = useState(
    product?.documentationUrl ?? ""
  );
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    product?.seoDescription ?? ""
  );

  const [thumbnailUrl, setThumbnailUrl] = useState(
    product?.thumbnail?.url ?? ""
  );
  const [thumbnailAlt, setThumbnailAlt] = useState(
    product?.thumbnail?.alt ?? ""
  );
  const [thumbnailStoragePath, setThumbnailStoragePath] = useState<
    string | null
  >(product?.thumbnailStoragePath ?? product?.thumbnail?.storagePath ?? null);

  const [gallery, setGallery] = useState<ProductImage[]>(
    product?.gallery ?? []
  );

  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/admin/media", {
      method: "POST",
      body: formData,
    });
    const data = (await res.json()) as {
      error?: string;
      url?: string;
      storagePath?: string;
    };
    if (!res.ok || !data.url) {
      throw new Error(data.error ?? "Upload failed.");
    }
    return { url: data.url, storagePath: data.storagePath ?? null };
  };

  const removeStorageAsset = async (storagePath: string | null | undefined) => {
    if (!storagePath) return;
    await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storagePath }),
    }).catch(() => null);
  };

  const handleThumbUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingThumb(true);
    try {
      const prevPath = thumbnailStoragePath;
      const uploaded = await uploadImage(file, "thumbnails");
      setThumbnailUrl(uploaded.url);
      setThumbnailStoragePath(uploaded.storagePath);
      if (!thumbnailAlt) setThumbnailAlt(`${name || "Product"} thumbnail`);
      if (prevPath) await removeStorageAsset(prevPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thumbnail upload failed.");
    } finally {
      setUploadingThumb(false);
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError(null);
    setUploadingGallery(true);
    try {
      const uploadedItems: ProductImage[] = [];
      for (const file of files) {
        const uploaded = await uploadImage(file, "gallery");
        uploadedItems.push({
          id: `gal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: uploaded.url,
          storagePath: uploaded.storagePath,
          alt: `${name || "Product"} preview`,
          caption: "",
        });
      }
      setGallery((prev) => [...prev, ...uploadedItems]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gallery upload failed.");
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  const handleRemoveGalleryItem = async (index: number) => {
    const target = gallery[index];
    setGallery((prev) => prev.filter((_, idx) => idx !== index));
    if (target?.storagePath) {
      await removeStorageAsset(target.storagePath);
    }
  };

  const moveGalleryItem = (index: number, dir: -1 | 1) => {
    const nextIdx = index + dir;
    if (nextIdx < 0 || nextIdx >= gallery.length) return;
    setGallery((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIdx, 0, item);
      return copy;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name,
      slug,
      shortDescription,
      fullDescription,
      categoryId,
      productType,
      status,
      published,
      featured,
      isDemoRecord,
      thumbnailUrl: thumbnailUrl || null,
      thumbnailAlt: thumbnailAlt || `${name} preview`,
      thumbnailStoragePath,
      gallery: gallery.map((g) => ({
        url: g.url,
        alt: g.alt,
        caption: g.caption,
        storagePath: g.storagePath ?? null,
      })),
      features: featuresText
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
      technologies: technologiesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      previewUrl: previewUrl || null,
      liveDemoUrl: liveDemoUrl || null,
      documentationUrl: documentationUrl || null,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || shortDescription,
    };

    try {
      const res = await fetch(
        isEditing && product
          ? `/api/admin/products/${product.id}`
          : "/api/admin/products",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Failed to save product.");
        setSaving(false);
        return;
      }

      onSaved();
    } catch {
      setError("Network error while saving product.");
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-editor-title"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="glass-surface-strong relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[var(--radius-xl)] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--glass-border)] pb-4">
          <h2
            id="product-editor-title"
            className="text-xl font-bold text-[var(--text-primary)]"
          >
            {isEditing ? `Edit: ${product?.name}` : "Create New Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          {error ? (
            <div className="rounded-[var(--radius-md)] border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          {/* Core Details */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Product Name *</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  const val = e.target.value;
                  setName(val);
                  if (!slugTouched) setSlug(slugify(val));
                }}
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>URL Slug *</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 font-mono text-sm text-[var(--text-primary)]"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Category *</span>
              <select
                required
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

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Product Type</span>
              <input
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Availability Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductAvailability)}
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3 text-sm text-[var(--text-primary)]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-center gap-5 pt-5">
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

              <label className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDemoRecord}
                  onChange={(e) => setIsDemoRecord(e.target.checked)}
                  className="h-4 w-4 accent-[#527B48]"
                />
                <span>Sample Badge</span>
              </label>
            </div>
          </div>

          {/* Descriptions */}
          <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <span>Short Description *</span>
            <textarea
              required
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 p-3 text-sm text-[var(--text-primary)]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
            <span>Full Description</span>
            <textarea
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 p-3 text-sm text-[var(--text-primary)]"
            />
          </label>

          {/* Thumbnail Upload & Preview */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Thumbnail Image
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Upload PNG, JPEG, WebP, or SVG (max 5 MB) to Supabase Storage or paste a URL.
                </p>
              </div>
              <label className="inline-flex min-h-9 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-xs font-medium text-[var(--accent-primary)] cursor-pointer">
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{uploadingThumb ? "Uploading..." : "Upload Thumbnail"}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleThumbUpload}
                  disabled={uploadingThumb}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:items-center">
              <div className="aspect-[16/10] overflow-hidden rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[#2F332A] sm:col-span-4">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={thumbnailAlt || name || "Thumbnail preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-mono text-xs text-[var(--text-muted)]">
                    No Thumbnail
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:col-span-8">
                <input
                  type="text"
                  placeholder="Thumbnail URL (e.g. /marketplace/... or Supabase URL)"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="min-h-9 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-xs text-[var(--text-primary)]"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Thumbnail alt text"
                    value={thumbnailAlt}
                    onChange={(e) => setThumbnailAlt(e.target.value)}
                    className="min-h-9 flex-1 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-xs text-[var(--text-primary)]"
                  />
                  {thumbnailUrl ? (
                    <button
                      type="button"
                      onClick={async () => {
                        const prev = thumbnailStoragePath;
                        setThumbnailUrl("");
                        setThumbnailStoragePath(null);
                        await removeStorageAsset(prev);
                      }}
                      className="inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-md)] border border-red-400/40 px-3 text-xs text-red-400 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Remove</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Manager */}
          <div className="rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Product Gallery ({gallery.length})
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Upload screenshots or add external/local URLs.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex min-h-9 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 py-1.5 text-xs font-medium text-[var(--accent-primary)] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{uploadingGallery ? "Uploading..." : "Upload Images"}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    className="sr-only"
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setGallery((prev) => [
                      ...prev,
                      {
                        id: `gal-${Date.now()}`,
                        url: "",
                        alt: `${name || "Product"} screenshot`,
                        caption: "",
                      },
                    ])
                  }
                  className="inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Add URL Row</span>
                </button>
              </div>
            </div>

            {gallery.length > 0 ? (
              <div className="mt-4 flex flex-col gap-3">
                {gallery.map((item, idx) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--bg-elevated)]/40 p-3 sm:grid-cols-12 sm:items-center"
                  >
                    <div className="aspect-[16/10] overflow-hidden rounded bg-[#2F332A] sm:col-span-3">
                      {item.url ? (
                        <img
                          src={item.url}
                          alt={item.alt || "Gallery preview"}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-7">
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={item.url}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGallery((prev) =>
                            prev.map((g, i) => (i === idx ? { ...g, url: val } : g))
                          );
                        }}
                        className="min-h-8 rounded border border-[var(--glass-border)] bg-[var(--bg-elevated)]/80 px-2.5 text-xs text-[var(--text-primary)]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Alt text"
                          value={item.alt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGallery((prev) =>
                              prev.map((g, i) => (i === idx ? { ...g, alt: val } : g))
                            );
                          }}
                          className="min-h-8 rounded border border-[var(--glass-border)] bg-[var(--bg-elevated)]/80 px-2.5 text-xs text-[var(--text-primary)]"
                        />
                        <input
                          type="text"
                          placeholder="Caption (optional)"
                          value={item.caption ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGallery((prev) =>
                              prev.map((g, i) =>
                                i === idx ? { ...g, caption: val } : g
                              )
                            );
                          }}
                          className="min-h-8 rounded border border-[var(--glass-border)] bg-[var(--bg-elevated)]/80 px-2.5 text-xs text-[var(--text-primary)]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-1 sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => moveGalleryItem(idx, -1)}
                        aria-label="Move image up"
                        className="rounded p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGalleryItem(idx, 1)}
                        aria-label="Move image down"
                        className="rounded p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(idx)}
                        aria-label="Remove image"
                        className="rounded p-1.5 text-red-400 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Features & Technologies */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Features (one per line)</span>
              <textarea
                rows={4}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                className="rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 p-3 text-sm text-[var(--text-primary)]"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Technologies (comma-separated)</span>
              <textarea
                rows={4}
                value={technologiesText}
                onChange={(e) => setTechnologiesText(e.target.value)}
                placeholder="Next.js, TypeScript, Tailwind CSS, Supabase"
                className="rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 p-3 text-sm text-[var(--text-primary)]"
              />
            </label>
          </div>

          {/* URLs & SEO */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Preview URL</span>
              <input
                type="text"
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
                placeholder="/#top or https://..."
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Live Demo URL</span>
              <input
                type="text"
                value={liveDemoUrl}
                onChange={(e) => setLiveDemoUrl(e.target.value)}
                placeholder="https://..."
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>Documentation URL</span>
              <input
                type="text"
                value={documentationUrl}
                onChange={(e) => setDocumentationUrl(e.target.value)}
                placeholder="https://..."
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>SEO Title</span>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
              <span>SEO Description</span>
              <input
                type="text"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="min-h-10 rounded-[var(--radius-md)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 px-3 text-sm text-[var(--text-primary)]"
              />
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-[var(--glass-border)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] px-5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingThumb || uploadingGallery}
              className="min-h-10 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-6 text-sm font-semibold text-white shadow-sm hover:brightness-105 disabled:opacity-60 cursor-pointer"
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
