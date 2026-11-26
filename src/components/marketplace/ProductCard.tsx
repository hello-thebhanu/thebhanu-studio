"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, Layers, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import {
  Expandable,
  ExpandableCard,
  ExpandableContent,
  ExpandableTrigger,
} from "@/components/ui/expandable";
import type { ProductRecord } from "@/lib/marketplace/types";
import {
  DemoBadge,
  FeaturedBadge,
  ProductStatusBadge,
} from "./ProductStatusBadge";

interface ProductCardProps {
  product: ProductRecord;
  categoryName: string;
}

export function ProductCard({ product, categoryName }: ProductCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const visibleTech = product.technologies.slice(0, 3);
  const extraTechCount = product.technologies.length - visibleTech.length;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.slug,
      title: product.name,
      brand: `THE BHANU · ${categoryName}`,
      price: 1,
      image: product.thumbnail?.url ?? "/marketplace/sylva-studio-overview.svg",
      href: `/products/${product.slug}`,
      source: "Marketplace",
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
          <article className="group flex w-full flex-col p-4 sm:p-5">
            {/* Thumbnail Preview Stage */}
            <Link
              href={`/products/${product.slug}`}
              className="relative block aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[#2F332A]"
            >
              {product.thumbnail && !imgFailed ? (
                <img
                  src={product.thumbnail.url}
                  alt={product.thumbnail.alt}
                  loading="lazy"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#383B34] to-[#272A23] p-4 text-center">
                  <Layers className="h-7 w-7 text-[#A5CE79]/70" aria-hidden="true" />
                  <span className="font-mono text-xs text-[#D5D8CE]">
                    {product.productType}
                  </span>
                </div>
              )}

              <div className="pointer-events-none absolute top-2.5 right-2.5 left-2.5 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-[var(--radius-pill)] border border-white/15 bg-[#262922]/80 px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase text-[#F4F5EF]">
                  {categoryName}
                </span>
                {product.featured ? <FeaturedBadge /> : null}
              </div>
            </Link>

            {/* Clickable Header to Expand */}
            <ExpandableTrigger className="mt-4 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <ProductStatusBadge status={product.status} />
                <div className="flex items-center gap-2">
                  {product.isDemoRecord ? <DemoBadge /> : null}
                  <ChevronDown
                    className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-300 ${
                      isExpanded ? "rotate-180 text-[var(--accent-primary)]" : ""
                    }`}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <h3 className="mt-3 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                {product.name}
              </h3>

              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {product.shortDescription}
              </p>
            </ExpandableTrigger>

            {/* Smoothly Expanded Stack + Actions */}
            <ExpandableContent preset="fade" stagger staggerChildren={0.05}>
              <div className="mt-4 flex flex-col gap-3 border-t border-[var(--glass-border)] pt-4">
                <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
                  {visibleTech.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--text-secondary)]"
                    >
                      {tech}
                    </li>
                  ))}
                  {extraTechCount > 0 ? (
                    <li className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                      +{extraTechCount}
                    </li>
                  ) : null}
                </ul>

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
                    href={`/products/${product.slug}`}
                    className="inline-flex min-h-9 items-center justify-center gap-1 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 text-xs font-medium text-[var(--accent-primary)] transition-colors hover:bg-[#527B48] hover:text-white"
                  >
                    <span>Details</span>
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
