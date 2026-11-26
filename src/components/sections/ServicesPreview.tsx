"use client";

import {
  Globe,
  GraduationCap,
  Layers,
  Smartphone,
  Sparkles,
  Workflow,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SylvaReveal } from "@/components/ui/SylvaReveal";
import { SERVICES_PREVIEW, type ServiceItem } from "@/lib/constants";

const ICON_MAP: Record<ServiceItem["iconName"], typeof Globe> = {
  Globe,
  Layers,
  Smartphone,
  Sparkles,
  Workflow,
  GraduationCap,
};

export function ServicesPreview() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="pt-10 pb-[var(--section-y)] sm:pt-14"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <SylvaReveal radius="1rem">
          <div className="section-text-scrim max-w-3xl">
            <SectionHeading
              id="services-heading"
              eyebrow="Engineering Capabilities"
              title="Software disciplines designed to ship together."
              description="From responsive 3D web experiences to full-stack platforms and practical automation, every engagement follows a structured, maintainable architecture."
            />
          </div>
        </SylvaReveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES_PREVIEW.map((service, index) => {
            const Icon = ICON_MAP[service.iconName];
            return (
              <SylvaReveal
                key={service.id}
                delay={Math.min(index * 0.08, 0.36)}
                className="h-full"
              >
                <GlassCard
                  as="article"
                  interactive
                  className="flex h-full flex-col justify-between p-6 sm:p-7"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                      {service.title}
                    </h3>

                    <p className="mt-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {service.description}
                    </p>
                  </div>

                  <ul className="mt-6 flex flex-wrap gap-2 border-t border-[var(--glass-border)] pt-4">
                    {service.scope.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-2.5 py-1 font-mono text-[11px] text-[var(--text-secondary)]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </SylvaReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
