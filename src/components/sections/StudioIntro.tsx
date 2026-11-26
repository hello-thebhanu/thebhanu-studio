import { Compass } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SylvaReveal } from "@/components/ui/SylvaReveal";
import { STUDIO_PRINCIPLES } from "@/lib/constants";

export function StudioIntro() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="py-[var(--section-y)]"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* Studio Introduction */}
          <div className="lg:col-span-5">
            <SylvaReveal radius="1rem">
              <div className="section-text-scrim">
                <SectionHeading
                  id="about-heading"
                  eyebrow="Studio Philosophy"
                  title="Built for longevity, clarity, and real software craft."
                  description="THE BHANU bridges visual precision with full-stack engineering. Rather than shipping generic templates, every system is structured to grow cleanly from first release into an extensible product ecosystem."
                />
              </div>
            </SylvaReveal>

            {/* Anchor for Projects */}
            <SylvaReveal delay={0.12}>
              <GlassCard className="mt-8 border-dashed p-5">
                <div id="projects" className="scroll-mt-28 flex items-start gap-3.5">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]">
                    <Compass className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-primary)]">
                      Project Showcases
                    </span>
                    <h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                      Case studies coming soon
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                      Detailed project breakdowns will appear here soon.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </SylvaReveal>
          </div>

          {/* Engineering Principles */}
          <div className="grid grid-cols-1 gap-4 lg:col-span-7">
            {STUDIO_PRINCIPLES.map((principle, index) => (
              <SylvaReveal key={principle.label} delay={index * 0.08}>
                <GlassCard interactive className="p-6">
                  <span className="font-mono text-xs font-medium tracking-wider uppercase text-[var(--accent-primary)]">
                    {principle.label}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {principle.description}
                  </p>
                </GlassCard>
              </SylvaReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
