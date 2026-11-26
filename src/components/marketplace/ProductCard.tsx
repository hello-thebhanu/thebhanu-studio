"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
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
  const visibleTech = product.technologies.slice(0, 3);
  const extraTechCount = product.technologies.length - visibleTech.length;

  return (
    <GlassCard
      as="article"
      interactive
      className="group flex h-full w-full flex-col p-4 sm:p-5"
    >
      <div className="flex flex-1 flex-col">
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

          {/* Top Overlay Badges */}
          <div className="pointer-events-none absolute top-2.5 right-2.5 left-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-[var(--radius-pill)] border border-white/15 bg-[#262922]/80 px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase text-[#F4F5EF] backdrop-blur-md">
              {categoryName}
            </span>
            {product.featured ? <FeaturedBadge /> : null}
          </div>
        </Link>

        {/* Status & Sample Indicator */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <ProductStatusBadge status={product.status} />
          {product.isDemoRecord ? <DemoBadge /> : null}
        </div>

        {/* Title & Short Description */}
        <h3 className="mt-3 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          <Link
            href={`/products/${product.slug}`}
            className="transition-colors hover:text-[var(--accent-primary)]"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          {product.shortDescription}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-4 border-t border-[var(--glass-border)] pt-4">
        {/* Technology Tags */}
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

        {/* Action */}
        <Link
          href={`/products/${product.slug}`}
          className="inline-flex min-h-10 w-full items-center justify-between rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-primary)] transition-all hover:bg-[#527B48] hover:text-white"
        >
          <span>View Details</span>
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </GlassCard>
  );
}
