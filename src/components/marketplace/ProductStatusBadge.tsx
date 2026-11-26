import { Ban, CheckCircle2, Clock, Sparkles, Wrench } from "lucide-react";
import type { ProductAvailability } from "@/lib/marketplace/types";

const STATUS_CONFIG: Record<
  ProductAvailability,
  { Icon: typeof CheckCircle2; classes: string }
> = {
  Available: {
    Icon: CheckCircle2,
    classes:
      "border-[#527B48]/45 bg-[#527B48]/15 text-[#3B5F32] dark:border-[#A5CE79]/45 dark:bg-[#527B48]/30 dark:text-[#C5E89E]",
  },
  "Coming Soon": {
    Icon: Clock,
    classes:
      "border-[#789B55]/45 bg-[#789B55]/15 text-[#3A5424] dark:border-[#789B55]/45 dark:bg-[#789B55]/22 dark:text-[#D5E6B8]",
  },
  "Under Development": {
    Icon: Wrench,
    classes:
      "border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)]",
  },
  Unavailable: {
    Icon: Ban,
    classes:
      "border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] text-[var(--text-muted)]",
  },
};

export function ProductStatusBadge({ status }: { status: ProductAvailability }) {
  const { Icon, classes } = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-0.5 font-mono text-[11px] font-medium ${classes}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[#A5CE79]/55 bg-[#527B48] px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-white shadow-sm">
      <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>Featured</span>
    </span>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
      Sample
    </span>
  );
}
