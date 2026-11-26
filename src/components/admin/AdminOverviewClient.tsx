"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Database,
  EyeOff,
  FolderTree,
  Package,
  Plus,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProductStatusBadge } from "@/components/marketplace/ProductStatusBadge";
import type {
  ProductCategoryWithCount,
  ProductRecord,
} from "@/lib/marketplace/types";

interface AdminOverviewClientProps {
  schemaReady: boolean;
  errorMessage?: string;
  categories: ProductCategoryWithCount[];
  products: ProductRecord[];
}

export function AdminOverviewClient({
  schemaReady,
  errorMessage,
  categories,
  products,
}: AdminOverviewClientProps) {
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  const publishedCount = products.filter((p) => p.published !== false && p.status !== "Unavailable").length;
  const draftCount = products.length - publishedCount;
  const featuredCount = products.filter((p) => p.featured).length;
  const recentlyUpdated = products.slice(0, 6);

  const handleSeedInitial = async () => {
    setSeeding(true);
    setSeedMessage(null);
    setSeedError(null);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        seededProducts?: number;
        totalCategories?: number;
      };
      if (!res.ok) {
        setSeedError(data.error ?? "Failed to seed initial catalogue.");
      } else {
        setSeedMessage(
          `Synced ${data.totalCategories ?? 0} categories and added ${data.seededProducts ?? 0} sample product(s).`
        );
        router.refresh();
      }
    } catch {
      setSeedError("Network error while seeding database.");
    } finally {
      setSeeding(false);
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
              Database Schema Migration Required
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              Supabase is connected, but the Phase 4 tables (`profiles`, `categories`,
              `products`, `product_images`) were not found yet. Run the migration file{" "}
              <code className="rounded bg-[var(--glass-bg-subtle)] px-1.5 py-0.5 font-mono text-xs">
                supabase/migrations/0001_phase4_admin_marketplace.sql
              </code>{" "}
              in your Supabase SQL Editor, then refresh this page.
            </p>
            {errorMessage ? (
              <p className="mt-3 font-mono text-xs text-[var(--text-muted)]">
                Details: {errorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Live Database Metrics (zero fabricated stats) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="font-mono text-xs uppercase tracking-wider">Total Products</span>
            <Package className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
            {products.length}
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="font-mono text-xs uppercase tracking-wider">Published Live</span>
            <CheckCircle2 className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--accent-primary)]">
            {publishedCount}
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="font-mono text-xs uppercase tracking-wider">Unpublished / Hidden</span>
            <EyeOff className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
            {draftCount}
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="font-mono text-xs uppercase tracking-wider">Featured</span>
            <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
            {featuredCount}
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="font-mono text-xs uppercase tracking-wider">Categories</span>
            <FolderTree className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
            {categories.length}
          </p>
        </GlassCard>
      </div>

      {/* Quick Actions & Optional Initial Catalogue Sync */}
      <GlassCard className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            Quick Management Actions
          </h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Create products, organize categories, upload media to Supabase Storage, or sync
            initial sample entries.
          </p>
          {seedMessage ? (
            <p className="mt-2 font-mono text-xs text-[var(--accent-primary)]">
              {seedMessage}
            </p>
          ) : null}
          {seedError ? (
            <p className="mt-2 font-mono text-xs text-red-500">{seedError}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/products?new=1"
            className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-105"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>New Product</span>
          </Link>

          <Link
            href="/admin/categories"
            className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--glass-border-accent)]"
          >
            <FolderTree className="h-4 w-4" aria-hidden="true" />
            <span>Manage Categories</span>
          </Link>

          <button
            type="button"
            onClick={handleSeedInitial}
            disabled={seeding}
            className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--glass-border-accent)] hover:text-[var(--text-primary)] disabled:opacity-60 cursor-pointer"
          >
            <Database className="h-4 w-4" aria-hidden="true" />
            <span>{seeding ? "Syncing..." : "Sync Sample Catalogue"}</span>
          </button>
        </div>
      </GlassCard>

      {/* Recently Updated Products + Category Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <GlassCard className="p-6 lg:col-span-7">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Recently Updated Products
            </h2>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 font-mono text-xs text-[var(--accent-primary)] hover:underline"
            >
              <span>View all</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {recentlyUpdated.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--text-muted)]">
              No products in the database yet. Use &ldquo;New Product&rdquo; or &ldquo;Sync
              Sample Catalogue&rdquo; above.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--glass-border)]">
              {recentlyUpdated.map((product) => (
                <li
                  key={product.id}
                  className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {product.name}
                    </p>
                    <p className="font-mono text-xs text-[var(--text-muted)]">
                      /{product.slug} · {product.productType}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-[var(--radius-pill)] border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                        product.published
                          ? "border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]"
                          : "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-muted)]"
                      }`}
                    >
                      {product.published ? "Published" : "Draft"}
                    </span>
                    <ProductStatusBadge status={product.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard className="p-6 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Category Overview
            </h2>
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-1 font-mono text-xs text-[var(--accent-primary)] hover:underline"
            >
              <span>Edit</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {categories.length === 0 ? (
            <p className="mt-6 text-sm text-[var(--text-muted)]">
              No categories found yet.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-[var(--glass-border)]">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span className="font-medium text-[var(--text-primary)]">
                    {cat.name}
                  </span>
                  <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2.5 py-0.5 font-mono text-xs text-[var(--text-muted)]">
                    {cat.productCount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
