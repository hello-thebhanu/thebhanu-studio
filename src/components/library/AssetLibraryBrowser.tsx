"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, RotateCcw, Search, ShoppingBag, Sparkles, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { ProductStatusBadge } from "@/components/marketplace/ProductStatusBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  Expandable,
  ExpandableCard,
  ExpandableContent,
  ExpandableTrigger,
} from "@/components/ui/expandable";
import type {
  AssetAvailability,
  AssetCategory,
  UiAssetRecord,
} from "@/lib/assets/types";
import { AssetLivePreview } from "./AssetLivePreview";

function ExpandableAssetCard({
  asset,
  eyebrow,
  ctaLabel,
}: {
  asset: UiAssetRecord;
  eyebrow: string;
  ctaLabel: string;
}) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: `ui-${asset.slug}`,
      title: asset.name,
      brand: `THE BHANU · ${eyebrow}`,
      price: 1,
      image: "/marketplace/nature-glass-ui-overview.svg",
      href: `/components/${asset.slug}`,
      source: "UI Library",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Expandable
      expandDirection="vertical"
      expandBehavior="push"
      transitionDuration={0.3}
      className="w-full"
    >
      {({ isExpanded }) => (
        <ExpandableCard className="w-full">
          <article className="flex flex-col p-5">
            <AssetLivePreview previewKey={asset.previewKey} compact />

            <ExpandableTrigger className="mt-4 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-primary)]">
                  {eyebrow}
                </span>
                <div className="flex items-center gap-2">
                  <ProductStatusBadge status={asset.status} />
                  <ChevronDown
                    className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-300 ${
                      isExpanded ? "rotate-180 text-[var(--accent-primary)]" : ""
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                {asset.name}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {asset.summary}
              </p>
            </ExpandableTrigger>

            <ExpandableContent preset="fade" stagger staggerChildren={0.05}>
              <div className="mt-4 flex flex-col gap-3 border-t border-[var(--glass-border)] pt-4">
                {asset.tags.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {asset.tags.slice(0, 3).map((tag) => (
                      <li
                        key={tag}
                        className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--text-muted)]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-pill)] bg-[#527B48] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#44673B] cursor-pointer"
                  >
                    {added ? (
                      <>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Added ($1)</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Add to Cart · $1</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/components/${asset.slug}`}
                    className="inline-flex min-h-9 items-center justify-center gap-1 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 text-xs font-medium text-[var(--accent-primary)] transition-colors hover:bg-[#527B48] hover:text-white"
                  >
                    <span>{ctaLabel}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </ExpandableContent>
          </article>
        </ExpandableCard>
      )}
    </Expandable>
  );
}

export function AssetLibraryBrowser({
  initialAssets,
  initialCategories,
}: {
  initialAssets: UiAssetRecord[];
  initialCategories: AssetCategory[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [availability, setAvailability] = useState<AssetAvailability | "all">(
    "all"
  );
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const assets = useMemo(
    () =>
      initialAssets.filter(
        (a) => a.published !== false && a.status !== "Unavailable"
      ),
    [initialAssets]
  );

  const categoryNameMap = useMemo(
    () => new Map(initialCategories.map((c) => [c.slug, c.name])),
    [initialCategories]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of assets) {
      counts.set(a.categorySlug, (counts.get(a.categorySlug) ?? 0) + 1);
    }
    return counts;
  }, [assets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter((asset) => {
      if (activeCategory !== "all" && asset.categorySlug !== activeCategory) {
        return false;
      }
      if (availability !== "all" && asset.status !== availability) {
        return false;
      }
      if (featuredOnly && !asset.featured) {
        return false;
      }
      if (!q) return true;
      const catName = (
        categoryNameMap.get(asset.categorySlug) ?? ""
      ).toLowerCase();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.summary.toLowerCase().includes(q) ||
        asset.assetType.toLowerCase().includes(q) ||
        catName.includes(q) ||
        asset.tags.some((t) => t.toLowerCase().includes(q)) ||
        asset.dependencies.some((d) => d.toLowerCase().includes(q))
      );
    });
  }, [
    activeCategory,
    assets,
    availability,
    categoryNameMap,
    featuredOnly,
    query,
  ]);

  const featuredAssets = useMemo(
    () => assets.filter((a) => a.featured),
    [assets]
  );

  const hasFilters =
    Boolean(query.trim()) ||
    activeCategory !== "all" ||
    availability !== "all" ||
    featuredOnly;

  return (
    <div className="pb-20">
      {/* Library Hero */}
      <section className="relative overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-14">
        <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
          <GlassCard className="p-6 sm:p-10 lg:p-12">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 py-1 font-mono text-xs font-medium uppercase tracking-wider text-[var(--accent-primary)]">
                  UI Components &amp; Digital Asset Library
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
                  Reusable Nature-Tech UI primitives &amp; kits.
                </h1>
                <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
                  Inspect live previews, copy production-ready React and CSS
                  snippets, and explore modular UI resources from THE BHANU.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/marketplace"
                  className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-4 text-xs font-medium text-[var(--text-primary)] hover:border-[var(--glass-border-accent)]"
                >
                  <span>Browse Full Marketplace</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search components, tags, or dependencies"
                    aria-label="Search UI components and assets"
                    className="min-h-11 w-full rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 pr-10 pl-11 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                      className="absolute top-1/2 right-3 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                <select
                  value={availability}
                  onChange={(e) =>
                    setAvailability(
                      e.target.value as AssetAvailability | "all"
                    )
                  }
                  aria-label="Filter by availability"
                  className="min-h-11 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-4 text-xs font-medium text-[var(--text-primary)]"
                >
                  <option value="all">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Coming Soon">Coming Soon</option>
                  <option value="Under Development">Under Development</option>
                </select>

                <button
                  type="button"
                  onClick={() => setFeaturedOnly((f) => !f)}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-pill)] border px-4 text-xs font-medium transition-colors cursor-pointer ${
                    featuredOnly
                      ? "border-[var(--glass-border-accent)] bg-[#527B48] text-white"
                      : "border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/80 text-[var(--text-secondary)]"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Featured Only</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`rounded-[var(--radius-pill)] border px-3.5 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                    activeCategory === "all"
                      ? "border-[var(--glass-border-accent)] bg-[#527B48] text-white"
                      : "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)] hover:border-[var(--glass-border-accent)]"
                  }`}
                >
                  All ({assets.length})
                </button>
                {initialCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.slug)}
                    className={`rounded-[var(--radius-pill)] border px-3.5 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                      activeCategory === cat.slug
                        ? "border-[var(--glass-border-accent)] bg-[#527B48] text-white"
                        : "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)] hover:border-[var(--glass-border-accent)]"
                    }`}
                  >
                    {cat.name} ({categoryCounts.get(cat.slug) ?? 0})
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Featured Row (default view) */}
      {!hasFilters && featuredAssets.length > 0 ? (
        <section className="py-8">
          <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Featured Primitives"
              title="Core building blocks."
            />
            <div className="mt-6 grid grid-cols-1 items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredAssets.slice(0, 3).map((asset) => (
                <ExpandableAssetCard
                  key={asset.id}
                  asset={asset}
                  eyebrow={categoryNameMap.get(asset.categorySlug) ?? asset.assetType}
                  ctaLabel="Inspect"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Full Asset Catalogue */}
      <section className="py-8">
        <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              All UI Components &amp; Resources ({filtered.length})
            </h2>
            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("all");
                  setAvailability("all");
                  setFeaturedOnly(false);
                }}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Clear all filters</span>
              </button>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <GlassCard className="mt-6 p-10 text-center">
              <p className="text-base font-medium text-[var(--text-primary)]">
                No matching UI components or resources found.
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Try adjusting your search query or category filter.
              </p>
            </GlassCard>
          ) : (
            <div className="mt-6 grid grid-cols-1 items-start gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((asset) => (
                <ExpandableAssetCard
                  key={asset.id}
                  asset={asset}
                  eyebrow={asset.assetType}
                  ctaLabel="View"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
