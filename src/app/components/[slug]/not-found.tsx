import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function ComponentNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-32 pb-24 sm:px-6">
      <GlassCard className="p-8 text-center sm:p-12">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]">
          <Layers className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-4 font-mono text-xs uppercase tracking-wider text-[var(--accent-primary)]">
          404 · Component Not Found
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
          This UI asset could not be found.
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          The component or resource may have been unpublished or moved.
        </p>
        <Link
          href="/components"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-6 text-sm font-semibold text-white shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Browse UI Library</span>
        </Link>
      </GlassCard>
    </div>
  );
}
