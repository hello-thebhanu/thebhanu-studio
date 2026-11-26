"use client";

import { useCallback, useMemo, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, SearchX, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getAllCategories,
  getAllProducts,
  sortProducts,
} from "@/lib/marketplace/repository";
import type {
  ProductAvailability,
  ProductCategory,
  ProductCategoryWithCount,
  ProductRecord,
  ProductSortOption,
} from "@/lib/marketplace/types";
import { CategoryGrid } from "./CategoryGrid";
import { MarketplaceHero } from "./MarketplaceHero";
import { ProductCard } from "./ProductCard";

const AVAILABILITY_OPTIONS: Array<{
  value: ProductAvailability | "all";
  label: string;
}> = [
  { value: "all", label: "All Statuses" },
  { value: "Available", label: "Available" },
  { value: "Coming Soon", label: "Coming Soon" },
  { value: "Under Development", label: "Under Development" },
  { value: "Unavailable", label: "Unavailable" },
];

const SORT_OPTIONS: Array<{ value: ProductSortOption; label: string }> = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "alphabetical", label: "Alphabetical (A–Z)" },
];

function parseAvailability(raw: string | null): ProductAvailability | "all" {
  if (
    raw === "Available" ||
    raw === "Coming Soon" ||
    raw === "Under Development" ||
    raw === "Unavailable"
  ) {
    return raw;
  }
  return "all";
}

function parseSort(raw: string | null): ProductSortOption {
  if (raw === "oldest" || raw === "alphabetical" || raw === "latest") {
    return raw;
  }
  return "latest";
}

export function MarketplaceBrowser({
  initialProducts,
  initialCategories,
}: {
  initialProducts?: ProductRecord[];
  initialCategories?: ProductCategory[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const catalogueRef = useRef<HTMLElement>(null);

  const allProducts = useMemo(
    () =>
      (initialProducts ?? getAllProducts()).filter(
        (p) => p.published !== false && p.status !== "Unavailable"
      ),
    [initialProducts]
  );

  const categories: ProductCategoryWithCount[] = useMemo(() => {
    const base = initialCategories ?? getAllCategories();
    const counts = new Map<string, number>();
    for (const p of allProducts) {
      counts.set(p.categorySlug, (counts.get(p.categorySlug) ?? 0) + 1);
    }
    return [...base]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((cat) => ({
        ...cat,
        productCount: counts.get(cat.slug) ?? 0,
      }));
  }, [allProducts, initialCategories]);

  const featuredProducts = useMemo(
    () => allProducts.filter((p) => p.featured),
    [allProducts]
  );
  const latestProducts = useMemo(
    () => sortProducts(allProducts, "latest").slice(0, 4),
    [allProducts]
  );

  const categoryNameMap = useMemo(
    () => new Map(categories.map((cat) => [cat.slug, cat.name])),
    [categories],
  );

  const query = searchParams.get("q") ?? "";
  const categoryParam = searchParams.get("category") ?? "all";
  const activeCategory = categoryNameMap.has(categoryParam) ? categoryParam : "all";
  const activeAvailability = parseAvailability(searchParams.get("status"));
  const featuredOnly = searchParams.get("featured") === "true";
  const activeSort = parseSort(searchParams.get("sort"));

  const updateParams = useCallback(
    (updates: {
      q?: string;
      category?: string;
      status?: ProductAvailability | "all";
      featured?: boolean;
      sort?: ProductSortOption;
    }) => {
      const next = new URLSearchParams(searchParams.toString());

      if (updates.q !== undefined) {
        const trimmed = updates.q;
        if (trimmed) next.set("q", trimmed);
        else next.delete("q");
      }
      if (updates.category !== undefined) {
        if (updates.category && updates.category !== "all") {
          next.set("category", updates.category);
        } else {
          next.delete("category");
        }
      }
      if (updates.status !== undefined) {
        if (updates.status !== "all") next.set("status", updates.status);
        else next.delete("status");
      }
      if (updates.featured !== undefined) {
        if (updates.featured) next.set("featured", "true");
        else next.delete("featured");
      }
      if (updates.sort !== undefined) {
        if (updates.sort !== "latest") next.set("sort", updates.sort);
        else next.delete("sort");
      }

      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const clearAllFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const scrollToCatalogue = useCallback(() => {
    catalogueRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = allProducts.filter((product) => {
      if (activeCategory !== "all" && product.categorySlug !== activeCategory) {
        return false;
      }
      if (
        activeAvailability !== "all" &&
        product.status !== activeAvailability
      ) {
        return false;
      }
      if (featuredOnly && !product.featured) {
        return false;
      }
      if (!q) return true;
      const catName = (categoryNameMap.get(product.categorySlug) ?? "").toLowerCase();
      return (
        product.name.toLowerCase().includes(q) ||
        product.shortDescription.toLowerCase().includes(q) ||
        product.fullDescription.toLowerCase().includes(q) ||
        product.productType.toLowerCase().includes(q) ||
        catName.includes(q) ||
        product.technologies.some((t) => t.toLowerCase().includes(q))
      );
    });
    return sortProducts(matched, activeSort);
  }, [
    activeAvailability,
    activeCategory,
    activeSort,
    allProducts,
    categoryNameMap,
    featuredOnly,
    query,
  ]);

  const hasActiveFilters =
    Boolean(query.trim()) ||
    activeCategory !== "all" ||
    activeAvailability !== "all" ||
    featuredOnly ||
    activeSort !== "latest";

  const availableCount = useMemo(
    () => allProducts.filter((p) => p.status === "Available").length,
    [allProducts],
  );

  return (
    <div className="pb-16">
      <MarketplaceHero
        totalProducts={allProducts.length}
        totalCategories={categories.length}
        featuredCount={featuredProducts.length}
        availableCount={availableCount}
        searchValue={query}
        onSearchChange={(val) => updateParams({ q: val })}
        onSearchSubmit={scrollToCatalogue}
      />

      {/* Featured Products (shown by default when not narrowed by search/filter) */}
      {!hasActiveFilters && featuredProducts.length > 0 ? (
        <section
          aria-labelledby="featured-heading"
          className="py-10 sm:py-12"
        >
          <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
            <SectionHeading
              id="featured-heading"
              eyebrow="Featured Highlights"
              title="Flagship digital systems & kits."
              description="Explicitly marked featured entries showcasing THE BHANU's architecture across templates, UI systems, and applications."
            />

            <div className="mt-8 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={
                    categoryNameMap.get(product.categorySlug) ?? "Digital Product"
                  }
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Browse by Category */}
      <section
        id="categories"
        aria-labelledby="categories-heading"
        className="py-10 sm:py-12"
      >
        <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              id="categories-heading"
              eyebrow="Browse by Category"
              title="Ten structured product tracks."
              description="Select any category to filter the catalogue below. Counts update dynamically from product records."
            />
            {activeCategory !== "all" ? (
              <Button
                type="button"
                variant="glass"
                size="sm"
                onClick={() => updateParams({ category: "all" })}
              >
                Show All Categories
              </Button>
            ) : null}
          </div>

          <div className="mt-8">
            <CategoryGrid
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={(slug) => {
                updateParams({ category: slug });
                scrollToCatalogue();
              }}
            />
          </div>
        </div>
      </section>

      {/* Latest Products (shown when no filters narrow the catalogue) */}
      {!hasActiveFilters && latestProducts.length > 0 ? (
        <section
          aria-labelledby="latest-heading"
          className="py-10 sm:py-12"
        >
          <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
            <SectionHeading
              id="latest-heading"
              eyebrow="Latest Releases"
              title="Recently added to the catalogue."
            />

            <div className="mt-8 grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">
              {latestProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={
                    categoryNameMap.get(product.categorySlug) ?? "Digital Product"
                  }
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* All Products & Filter Controls */}
      <section
        ref={catalogueRef}
        id="catalogue"
        aria-labelledby="catalogue-heading"
        className="scroll-mt-24 py-10 sm:py-14"
      >
        <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionHeading
              id="catalogue-heading"
              eyebrow="Complete Catalogue"
              title={
                activeCategory !== "all"
                  ? (categoryNameMap.get(activeCategory) ?? "Filtered Products")
                  : "Explore all digital products."
              }
            />

            <p
              aria-live="polite"
              className="font-mono text-xs text-[var(--text-secondary)]"
            >
              Showing{" "}
              <span className="font-semibold text-[var(--accent-primary)]">
                {filteredProducts.length}
              </span>{" "}
              of {allProducts.length} products
            </p>
          </div>

          {/* Filter & Sort Toolbar */}
          <GlassCard className="mt-7 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  Filters
                </span>

                {/* Category Select */}
                <label className="sr-only" htmlFor="filter-category">
                  Filter by category
                </label>
                <select
                  id="filter-category"
                  value={activeCategory}
                  onChange={(e) => updateParams({ category: e.target.value })}
                  className="min-h-10 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3.5 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                >
                  <option value="all">All Categories ({allProducts.length})</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name} ({cat.productCount})
                    </option>
                  ))}
                </select>

                {/* Availability Select */}
                <label className="sr-only" htmlFor="filter-availability">
                  Filter by availability
                </label>
                <select
                  id="filter-availability"
                  value={activeAvailability}
                  onChange={(e) =>
                    updateParams({
                      status: parseAvailability(e.target.value),
                    })
                  }
                  className="min-h-10 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3.5 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                >
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {/* Featured Only Toggle */}
                <button
                  type="button"
                  onClick={() => updateParams({ featured: !featuredOnly })}
                  aria-pressed={featuredOnly}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-pill)] border px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    featuredOnly
                      ? "border-[#A5CE79]/50 bg-[#527B48] text-white"
                      : "border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--glass-border-accent)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Featured Only</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Sort Select */}
                <label
                  htmlFor="sort-products"
                  className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)]"
                >
                  Sort
                </label>
                <select
                  id="sort-products"
                  value={activeSort}
                  onChange={(e) =>
                    updateParams({ sort: parseSort(e.target.value) })
                  }
                  className="min-h-10 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)] px-3.5 py-1.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Clear all filters</span>
                  </Button>
                ) : null}
              </div>
            </div>
          </GlassCard>

          {/* Results Grid or Empty State */}
          {filteredProducts.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={
                    categoryNameMap.get(product.categorySlug) ?? "Digital Product"
                  }
                />
              ))}
            </div>
          ) : (
            <GlassCard className="mt-8 flex flex-col items-center justify-center p-12 text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]">
                <SearchX className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">
                No matching products found
              </h3>
              <p className="mt-2 max-w-md text-sm text-[var(--text-secondary)]">
                Try adjusting your search keywords, clearing the selected category or
                availability filter, or resetting to browse the full catalogue.
              </p>
              <Button
                type="button"
                variant="primary"
                size="md"
                className="mt-6"
                onClick={clearAllFilters}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Clear all filters</span>
              </Button>
            </GlassCard>
          )}

          {/* Custom Solution Callout */}
          <GlassCard className="mt-12 flex flex-col items-start justify-between gap-6 p-7 sm:flex-row sm:items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent-primary)]">
                Need Something Tailored?
              </span>
              <h3 className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                Build a custom software solution with THE BHANU.
              </h3>
              <p className="mt-1.5 max-w-xl text-sm text-[var(--text-secondary)]">
                Every template and architecture in the marketplace can be adapted into a
                bespoke web platform, mobile application, or automated workflow.
              </p>
            </div>
            <Button href="/#contact" variant="primary" size="lg" className="shrink-0">
              Start a Conversation
            </Button>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
