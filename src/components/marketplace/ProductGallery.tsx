"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ImageOff } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ProductImage } from "@/lib/marketplace/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const reducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});

  const safeIndex = images.length > 0 ? activeIndex % images.length : 0;
  const current = images[safeIndex] ?? null;
  const hasMultiple = images.length > 1;

  const markFailed = (id: string) => {
    setFailedIds((prev) => ({ ...prev, [id]: true }));
  };

  const handlePrev = () => {
    if (!hasMultiple) return;
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    if (!hasMultiple) return;
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main Preview Stage */}
      <div className="glass-surface relative overflow-hidden rounded-[var(--radius-xl)] p-2.5 sm:p-3">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[#2F332A]">
          {current && !failedIds[current.id] ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={current.id}
                src={current.url}
                alt={current.alt}
                onError={() => markFailed(current.id)}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0.35, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reducedMotion ? { opacity: 1 } : { opacity: 0.35 }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }
                }
                className="h-full w-full object-cover"
              />
            </AnimatePresence>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-[#D5D8CE]">
              <ImageOff className="h-8 w-8 text-[#A5CE79]/75" aria-hidden="true" />
              <p className="font-mono text-xs uppercase tracking-wider">
                {productName} — Preview Unavailable
              </p>
            </div>
          )}

          {hasMultiple ? (
            <div className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous screenshot"
                className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#262922]/80 text-[#F4F5EF] backdrop-blur-md transition-colors hover:border-[#A5CE79] hover:bg-[#527B48] cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next screenshot"
                className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#262922]/80 text-[#F4F5EF] backdrop-blur-md transition-colors hover:border-[#A5CE79] hover:bg-[#527B48] cursor-pointer"
              >
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>

        {current?.caption ? (
          <div className="flex items-center justify-between gap-3 px-2 pt-2.5 pb-1">
            <p className="text-xs text-[var(--text-secondary)]">
              {current.caption}
            </p>
            {hasMultiple ? (
              <span className="font-mono text-[11px] text-[var(--text-muted)]">
                {safeIndex + 1} / {images.length}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Thumbnail Strip */}
      {hasMultiple ? (
        <div
          className="grid grid-cols-3 gap-3 sm:grid-cols-4"
          role="tablist"
          aria-label="Product screenshots"
        >
          {images.map((image, idx) => {
            const isSelected = idx === safeIndex;
            return (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`View screenshot ${idx + 1}: ${image.caption ?? productName}`}
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-[16/10] overflow-hidden rounded-[var(--radius-md)] border transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#527B48] ring-2 ring-[#789B55]/50"
                    : "border-[var(--glass-border)] opacity-75 hover:opacity-100"
                }`}
              >
                {!failedIds[image.id] ? (
                  <img
                    src={image.url}
                    alt={image.alt}
                    onError={() => markFailed(image.id)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#2F332A] font-mono text-[10px] text-[#D5D8CE]">
                    #{idx + 1}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
