"use client";

import { Search, X } from "lucide-react";

interface MarketplaceHeroProps {
  totalProducts: number;
  totalCategories: number;
  featuredCount: number;
  availableCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
}

export function MarketplaceHero({
  totalProducts,
  totalCategories,
  featuredCount,
  availableCount,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: MarketplaceHeroProps) {
  return (
    <section
      aria-labelledby="marketplace-heading"
      className="relative overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-16"
    >
      {/* Subtle Nature-Tech Ambient Wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(120,155,85,0.22)_0%,transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <div className="glass-surface relative overflow-hidden rounded-[var(--radius-xl)] p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 py-1 font-mono text-xs font-medium uppercase tracking-wider text-[var(--accent-primary)]">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]"
                  aria-hidden="true"
                />
                THE BHANU · Universal Digital Marketplace
              </span>

              <h1
                id="marketplace-heading"
                className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:leading-[1.1]"
              >
                Digital products, starters &amp;{" "}
                <span className="bg-gradient-to-r from-[#466C3D] via-[#527B48] to-[#789B55] bg-clip-text text-transparent dark:from-[#789B55] dark:via-[#92B968] dark:to-[#A5CE79]">
                  systems built to ship.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
                Browse website templates, full-stack starters, UI kits, AI workflows, and
                developer resources crafted by THE BHANU. Sample catalogue items show how the
                marketplace will work.
              </p>

              {/* Search Bar */}
              <form
                role="search"
                aria-label="Search marketplace products"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSearchSubmit();
                }}
                className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-[var(--text-muted)]"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search products, categories, or stacks"
                    aria-label="Search digital products"
                    className="min-h-12 w-full rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--bg-elevated)]/85 pr-10 pl-11 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                  />
                  {searchValue ? (
                    <button
                      type="button"
                      onClick={() => onSearchChange("")}
                      aria-label="Clear search query"
                      className="absolute top-1/2 right-3 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                <button
                  type="submit"
                  className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-6 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition-all hover:brightness-105 cursor-pointer"
                >
                  Search Catalogue
                </button>
              </form>
            </div>

            {/* Derived Live Catalogue Snapshot (zero fabricated sales/reviews) */}
            <div className="grid grid-cols-2 gap-3 lg:col-span-5">
              <div className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  Categories
                </p>
                <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                  {totalCategories}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  Catalogue Entries
                </p>
                <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                  {totalProducts}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  Available Samples
                </p>
                <p className="mt-1 text-2xl font-bold text-[var(--accent-primary)]">
                  {availableCount}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  Featured Picks
                </p>
                <p className="mt-1 text-2xl font-bold text-[var(--accent-primary)]">
                  {featuredCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
