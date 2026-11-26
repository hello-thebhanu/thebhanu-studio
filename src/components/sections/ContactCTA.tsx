import { ArrowUpRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SylvaReveal } from "@/components/ui/SylvaReveal";
import { SITE_CONFIG } from "@/lib/constants";

export function ContactCTA() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="pt-[var(--section-y)] pb-24 sm:pb-32"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <SylvaReveal>
          <GlassCard className="relative overflow-hidden p-8 sm:p-12 lg:p-14">
            {/* Subtle Moss-Green Corner Ambient Light */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(120,155,85,0.28)_0%,transparent_70%)] blur-2xl"
            />

            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3.5 py-1 font-mono text-xs font-medium uppercase tracking-wider text-[var(--accent-primary)]">
                  Start a Conversation
                </span>
                <h2
                  id="contact-heading"
                  className="mt-4 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl"
                >
                  Have a digital product or custom platform in mind?
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--text-secondary)]">
                  Tell us what you&apos;re building and we&apos;ll reply by email.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">
                <Button href="/custom-studio" variant="primary" size="lg">
                  <span>Open Custom Studio</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  href={`mailto:${SITE_CONFIG.contactEmail}?subject=Project%20Inquiry%20%E2%80%94%20THE%20BHANU`}
                  variant="glass"
                  size="md"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>{SITE_CONFIG.contactEmail}</span>
                </Button>
                <Button href="#top" variant="glass" size="md">
                  <span>Back to Top</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </GlassCard>
        </SylvaReveal>
      </div>
    </section>
  );
}
