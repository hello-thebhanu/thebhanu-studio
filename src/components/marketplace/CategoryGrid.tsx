"use client";

import {
  BarChart3,
  Bot,
  Code2,
  Component,
  Globe,
  Layers,
  LayoutTemplate,
  Smartphone,
  Sparkles,
  Workflow,
} from "lucide-react";
import type {
  CategoryIconName,
  ProductCategoryWithCount,
} from "@/lib/marketplace/types";

const CATEGORY_ICONS: Record<CategoryIconName, typeof Globe> = {
  Globe,
  LayoutTemplate,
  Layers,
  Sparkles,
  Smartphone,
  Component,
  BarChart3,
  Bot,
  Workflow,
  Code2,
};

interface CategoryGridProps {
  categories: ProductCategoryWithCount[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function CategoryGrid({
  categories,
  activeCategory,
  onSelectCategory,
}: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {categories.map((category) => {
        const Icon = CATEGORY_ICONS[category.iconName];
        const isActive = activeCategory === category.slug;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() =>
              onSelectCategory(isActive ? "all" : category.slug)
            }
            aria-pressed={isActive}
            className={`glass-surface group flex h-full flex-col justify-between rounded-[var(--radius-lg)] p-5 text-left transition-all duration-200 cursor-pointer ${
              isActive
                ? "border-[#527B48] bg-[var(--accent-soft)] ring-1 ring-[#789B55]/50 shadow-[var(--shadow-glow)]"
                : "hover:-translate-y-1 hover:border-[var(--glass-border-accent)]"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                    isActive
                      ? "border-[#A5CE79]/50 bg-[#527B48] text-white"
                      : "border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>

                <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                  {category.productCount}{" "}
                  {category.productCount === 1 ? "item" : "items"}
                </span>
              </div>

              <h3 className="mt-4 text-base font-semibold tracking-tight text-[var(--text-primary)]">
                {category.name}
              </h3>

              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                {category.description}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--glass-border)] pt-3 font-mono text-[11px] text-[var(--accent-primary)]">
              <span>{category.accentTag}</span>
              <span>{isActive ? "Selected" : "Browse →"}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
