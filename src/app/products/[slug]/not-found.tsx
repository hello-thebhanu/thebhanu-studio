import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-[var(--container-max)] px-4 pt-32 pb-24 sm:px-6 lg:px-8">
      <GlassCard className="mx-auto flex max-w-xl flex-col items-center p-8 text-center sm:p-12">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]">
          <SearchX className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="mt-5 font-mono text-xs uppercase tracking-wider text-[var(--accent-primary)]">
          404 · Product Not Found
        </span>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          This digital product does not exist or is no longer listed.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          Check the product URL or browse the full THE BHANU Marketplace to explore
          available templates, apps, UI kits, and AI tools.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button href="/marketplace" variant="primary" size="md">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Browse Marketplace</span>
          </Button>
          <Button href="/" variant="glass" size="md">
            <span>Return Home</span>
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
