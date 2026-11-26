import type { HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: "sm" | "md" | "lg" | "xl" | "pill" | "full";
}

const ROUNDED_MAP: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  sm: "rounded-[var(--radius-sm)]",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
  xl: "rounded-[var(--radius-xl)]",
  pill: "rounded-[var(--radius-pill)]",
  full: "rounded-full",
};

/**
 * Reusable GPU-composited Nature-Tech shimmer skeleton primitive.
 * Uses translate3d sweeps for 60fps smoothness with reduced-motion support.
 */
export function Skeleton({
  className = "",
  rounded = "md",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer ${ROUNDED_MAP[rounded]} ${className}`}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="glass-surface flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)]"
    >
      <Skeleton rounded="sm" className="aspect-[16/10] w-full rounded-none border-0 border-b border-[var(--glass-border)]" />
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="flex items-center justify-between gap-2">
            <Skeleton rounded="pill" className="h-5 w-28" />
            <Skeleton rounded="pill" className="h-5 w-20" />
          </div>
          <Skeleton rounded="sm" className="mt-4 h-5 w-4/5" />
          <Skeleton rounded="sm" className="mt-2.5 h-3.5 w-full" />
          <Skeleton rounded="sm" className="mt-1.5 h-3.5 w-5/6" />
        </div>
        <div className="mt-5 border-t border-[var(--glass-border)] pt-4">
          <div className="flex gap-1.5">
            <Skeleton rounded="pill" className="h-5 w-16" />
            <Skeleton rounded="pill" className="h-5 w-20" />
            <Skeleton rounded="pill" className="h-5 w-14" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Skeleton rounded="sm" className="h-3.5 w-24" />
            <Skeleton rounded="pill" className="h-7 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-10 flex items-center bg-[#383b34] transition-opacity duration-500 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Ambient moss radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 65% 58%, rgba(120, 155, 85, 0.22) 0%, rgba(82, 123, 72, 0.08) 42%, transparent 72%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-[var(--container-max)] px-6 pt-20 sm:px-10">
        <div className="max-w-xl">
          <Skeleton rounded="pill" className="h-6 w-40 opacity-60" />
          <Skeleton rounded="md" className="mt-5 h-12 w-full max-w-md opacity-70" />
          <Skeleton rounded="md" className="mt-3 h-12 w-4/5 max-w-sm opacity-65" />
          <Skeleton rounded="sm" className="mt-5 h-4 w-full max-w-md opacity-50" />
          <Skeleton rounded="sm" className="mt-2 h-4 w-3/4 max-w-xs opacity-45" />
          <Skeleton rounded="pill" className="mt-8 h-12 w-44 opacity-75" />
        </div>
      </div>
    </div>
  );
}
