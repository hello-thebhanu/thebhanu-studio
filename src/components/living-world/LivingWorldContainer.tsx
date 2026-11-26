"use client";

import { useRef, type ReactNode } from "react";
import { LivingWorldBackdrop } from "@/components/living-world/LivingWorldBackdrop";

export function LivingWorldContainer({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative overflow-x-clip bg-[var(--bg-primary)]"
    >
      {/* Continuous Sylva Column Guides matching hero proportions (405 / 748 / 1091 of 1600) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] mx-auto max-w-[1600px]"
      >
        <span
          className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-[var(--grid-line)] to-transparent"
          style={{ left: "25.3125%" }}
        />
        <span
          className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-[var(--grid-line)] to-transparent"
          style={{ left: "46.75%" }}
        />
        <span
          className="hidden md:block absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-[var(--grid-line)] to-transparent"
          style={{ left: "68.1875%" }}
        />
      </div>

      {/* Continuous Scroll-Animated Three.js Roots, Butterfly & Pollen (stops before Footer) */}
      <LivingWorldBackdrop containerRef={containerRef} />

      {/* Smooth 220px Backdrop Fade into Footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-[220px] bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/75 to-transparent"
      />

      {/* Content Sections above the Living-World Canvas */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
