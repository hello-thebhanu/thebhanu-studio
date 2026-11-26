import type { AssetCategory, UiAssetRecord } from "./types";

export const STARTER_ASSET_CATEGORIES: AssetCategory[] = [
  {
    id: "acat-glass",
    slug: "glass-surfaces",
    name: "Glass Surfaces",
    description:
      "GPU-composited Nature-Tech translucent containers tuned for light and dark themes.",
    displayOrder: 1,
  },
  {
    id: "acat-controls",
    slug: "buttons-and-controls",
    name: "Buttons & Controls",
    description:
      "Accessible pill buttons, focus rings, and interactive action triggers.",
    displayOrder: 2,
  },
  {
    id: "acat-loaders",
    slug: "loaders-and-skeletons",
    name: "Loaders & Skeletons",
    description:
      "60fps transform-based shimmer loaders for media, cards, and dashboard shells.",
    displayOrder: 3,
  },
  {
    id: "acat-badges",
    slug: "badges-and-status",
    name: "Badges & Status",
    description:
      "WCAG AA contrast-verified status pills, tags, and metadata indicators.",
    displayOrder: 4,
  },
  {
    id: "acat-motion",
    slug: "motion-and-navigation",
    name: "Motion & Navigation",
    description:
      "Scroll-safe reveal primitives and high-legibility floating navigation bars.",
    displayOrder: 5,
  },
];

export const STARTER_UI_ASSETS: UiAssetRecord[] = [
  {
    id: "asset-nature-glass-card",
    slug: "nature-glass-card",
    name: "Nature-Glass Surface Card",
    summary:
      "GPU-composited frosted glass card with adaptive Light Ivory and Dark Olive Charcoal contrast.",
    usageInstructions:
      "1. Copy the component into src/components/ui/GlassCard.tsx.\n2. Ensure your global CSS defines --glass-bg, --glass-border, and .glass-surface with translateZ(0) compositing.\n3. Pass interactive={true} for hover lift and accent border highlights.",
    categorySlug: "glass-surfaces",
    assetType: "UI Component",
    previewKey: "glass-card",
    codeLanguage: "tsx",
    codeSnippet: `import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export function GlassCard({
  children,
  className = "",
  interactive = false,
}: GlassCardProps) {
  return (
    <div
      className={\`glass-surface relative overflow-hidden rounded-[1.75rem] p-6 \${
        interactive
          ? "transition-transform duration-300 hover:-translate-y-1.5 hover:border-[#A5CE79]/45"
          : ""
      } \${className}\`}
    >
      {children}
    </div>
  );
}`,
    resourceUrl: "/products/nature-glass-react-ui-kit",
    dependencies: ["tailwindcss"],
    tags: ["Glassmorphism", "Card", "GPU Composited", "Dual Theme"],
    status: "Available",
    published: true,
    featured: true,
    isDemoRecord: false,
    seoTitle: "Nature-Glass Surface Card Component",
    seoDescription:
      "Copy-ready React and Tailwind glassmorphism card component engineered for 60fps scrolling and dual themes.",
    createdAt: "2026-11-25T10:00:00.000Z",
    updatedAt: "2026-11-25T10:00:00.000Z",
  },
  {
    id: "asset-moss-pill-button",
    slug: "moss-pill-button",
    name: "Moss Gradient Pill Button",
    summary:
      "Primary and frosted-glass CTA buttons with keyboard focus rings and subtle moss gradient elevation.",
    usageInstructions:
      "1. Drop into src/components/ui/ActionPill.tsx.\n2. Use variant='primary' for main actions and variant='glass' for secondary triggers.\n3. Always keep min-h-11 for accessible touch targets.",
    categorySlug: "buttons-and-controls",
    assetType: "UI Component",
    previewKey: "moss-button",
    codeLanguage: "tsx",
    codeSnippet: `import type { ButtonHTMLAttributes } from "react";

interface ActionPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "glass";
}

export function ActionPill({
  variant = "primary",
  className = "",
  children,
  ...props
}: ActionPillProps) {
  const styles =
    variant === "primary"
      ? "border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] text-white shadow-md hover:brightness-105"
      : "border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] text-[var(--text-primary)] hover:border-[var(--glass-border-accent)]";

  return (
    <button
      className={\`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-6 text-sm font-semibold transition-all cursor-pointer \${styles} \${className}\`}
      {...props}
    >
      {children}
    </button>
  );
}`,
    resourceUrl: null,
    dependencies: ["tailwindcss"],
    tags: ["Button", "CTA", "Accessibility", "Pill"],
    status: "Available",
    published: true,
    featured: true,
    isDemoRecord: false,
    seoTitle: "Moss Gradient Pill Button Component",
    seoDescription:
      "Accessible React and Tailwind primary and glass pill button components from THE BHANU UI Library.",
    createdAt: "2026-11-25T09:30:00.000Z",
    updatedAt: "2026-11-25T09:30:00.000Z",
  },
  {
    id: "asset-shimmer-skeleton",
    slug: "nature-shimmer-skeleton",
    name: "60fps Shimmer Skeleton Primitive",
    summary:
      "Transform-animated skeleton loader using translate3d sweeps with automatic reduced-motion fallback.",
    usageInstructions:
      "1. Add the @keyframes bhanu-shimmer and .skeleton-shimmer CSS rules to globals.css.\n2. Render <Skeleton /> inside Suspense fallbacks or loading states.\n3. Avoid animating background-position to keep rendering on the GPU compositor.",
    categorySlug: "loaders-and-skeletons",
    assetType: "UI Component",
    previewKey: "shimmer-skeleton",
    codeLanguage: "tsx",
    codeSnippet: `export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={\`skeleton-shimmer rounded-xl \${className}\`}
    />
  );
}`,
    resourceUrl: null,
    dependencies: ["tailwindcss"],
    tags: ["Skeleton", "Shimmer", "60fps", "Suspense"],
    status: "Available",
    published: true,
    featured: true,
    isDemoRecord: false,
    seoTitle: "60fps Shimmer Skeleton Primitive",
    seoDescription:
      "GPU-composited shimmer skeleton loader component with reduced-motion support.",
    createdAt: "2026-11-25T09:00:00.000Z",
    updatedAt: "2026-11-25T09:00:00.000Z",
  },
  {
    id: "asset-status-badges",
    slug: "wcag-status-badges",
    name: "WCAG AA Status & Availability Badges",
    summary:
      "High-contrast availability pills for Available, Coming Soon, and Under Development states in both themes.",
    usageInstructions:
      "1. Import ProductStatusBadge and pass one of the four lifecycle statuses.\n2. Contrast ratios are tuned above 4.5:1 against Warm Ivory and Olive Charcoal surfaces.",
    categorySlug: "badges-and-status",
    assetType: "UI Component",
    previewKey: "status-badges",
    codeLanguage: "tsx",
    codeSnippet: `type Status = "Available" | "Coming Soon" | "Under Development";

const STYLES: Record<Status, string> = {
  Available: "border-[#527B48]/45 bg-[#527B48]/15 text-[#3B5F32] dark:text-[#C5E89E]",
  "Coming Soon": "border-[#789B55]/45 bg-[#789B55]/15 text-[#3A5424] dark:text-[#D5E6B8]",
  "Under Development": "border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)]",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={\`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium \${STYLES[status]}\`}>
      {status}
    </span>
  );
}`,
    resourceUrl: null,
    dependencies: ["tailwindcss", "lucide-react"],
    tags: ["Badge", "WCAG AA", "Status", "Typography"],
    status: "Available",
    published: true,
    featured: false,
    isDemoRecord: false,
    seoTitle: "WCAG AA Status & Availability Badges",
    seoDescription:
      "Accessible React status badges tuned for Light and Dark Mode contrast.",
    createdAt: "2026-11-24T16:00:00.000Z",
    updatedAt: "2026-11-24T16:00:00.000Z",
  },
  {
    id: "asset-floating-nav-pill",
    slug: "floating-navbar-pill",
    name: "Floating High-Legibility Navbar Pill",
    summary:
      "Sticky rounded navigation shell with 16px saturated backdrop blur and active route highlighting.",
    usageInstructions:
      "1. Apply .navbar-glass to your outer nav container.\n2. Use Next.js usePathname() to highlight active routes cleanly without overlap.",
    categorySlug: "motion-and-navigation",
    assetType: "UI Kit",
    previewKey: "floating-nav",
    codeLanguage: "css",
    codeSnippet: `.navbar-glass {
  background: rgba(244, 245, 239, 0.9);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px) saturate(1.25);
  -webkit-backdrop-filter: blur(16px) saturate(1.25);
  contain: layout style paint;
  transform: translateZ(0);
}`,
    resourceUrl: null,
    dependencies: ["tailwindcss"],
    tags: ["Navbar", "Backdrop Blur", "Navigation", "CSS"],
    status: "Available",
    published: true,
    featured: false,
    isDemoRecord: false,
    seoTitle: "Floating High-Legibility Navbar Pill",
    seoDescription:
      "High-contrast floating glass navbar styling for dark and light Next.js applications.",
    createdAt: "2026-11-24T12:00:00.000Z",
    updatedAt: "2026-11-24T12:00:00.000Z",
  },
  {
    id: "asset-scroll-reveal",
    slug: "gpu-scroll-reveal-wrapper",
    name: "GPU-Composited Scroll Reveal",
    summary:
      "Framer Motion scroll-into-view wrapper animating strictly opacity and transform to avoid layout paints.",
    usageInstructions:
      "1. Wrap section headings or cards in <SylvaReveal delay={0.08}>.\n2. Respects prefers-reduced-motion automatically.",
    categorySlug: "motion-and-navigation",
    assetType: "Motion Primitive",
    previewKey: "reveal-frame",
    codeLanguage: "tsx",
    codeSnippet: `"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}`,
    resourceUrl: null,
    dependencies: ["framer-motion"],
    tags: ["Motion", "Framer Motion", "60fps", "Scroll"],
    status: "Available",
    published: true,
    featured: false,
    isDemoRecord: false,
    seoTitle: "GPU-Composited Scroll Reveal Wrapper",
    seoDescription:
      "60fps Framer Motion scroll reveal primitive using strictly composited transform and opacity.",
    createdAt: "2026-11-23T14:00:00.000Z",
    updatedAt: "2026-11-23T14:00:00.000Z",
  },
];
