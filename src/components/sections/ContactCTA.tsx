"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Mail } from "lucide-react";
import {
  buildLoginRedirectUrl,
  showAuthToast,
} from "@/components/auth/AuthToast";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SylvaReveal } from "@/components/ui/SylvaReveal";
import { useAuthSession } from "@/hooks/useAuthSession";
import { SITE_CONFIG } from "@/lib/constants";

export function ContactCTA() {
  const router = useRouter();
  const { user, loading } = useAuthSession();

  const handleGuestBlock = (
    e: React.MouseEvent<HTMLAnchorElement>,
    nextPath: string,
  ) => {
    if (!loading && !user) {
      e.preventDefault();
      showAuthToast("Please sign in to continue");
      router.push(buildLoginRedirectUrl(nextPath));
    }
  };
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
              className="pointer-events-none absolute -top-24 -right-24 hidden h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(120,155,85,0.28)_0%,transparent_70%)] sm:block sm:blur-2xl"
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
                <Link
                  href="/custom-studio"
                  onClick={(e) => handleGuestBlock(e, "/custom-studio")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[#A5CE79]/40 bg-gradient-to-r from-[#527B48] to-[#658E52] px-7 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(82,123,72,0.35)] transition-opacity hover:opacity-95"
                >
                  <span>Open Custom Studio</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a
                  href={`mailto:${SITE_CONFIG.contactEmail}?subject=Project%20Inquiry%20%E2%80%94%20THE%20BHANU`}
                  onClick={(e) => handleGuestBlock(e, "/custom-studio")}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border-strong)] bg-[var(--glass-bg-subtle)] px-5 text-sm font-medium text-[var(--text-primary)] backdrop-blur-md transition-colors hover:border-[var(--glass-border-accent)]"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>{SITE_CONFIG.contactEmail}</span>
                </a>
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
