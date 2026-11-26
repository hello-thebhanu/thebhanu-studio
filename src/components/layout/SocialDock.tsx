"use client";

import type { ComponentType, SVGProps } from "react";
import { useRouter } from "next/navigation";
import { Mail, PenLine } from "lucide-react";
import {
  buildLoginRedirectUrl,
  showAuthToast,
} from "@/components/auth/AuthToast";
import { Dock, DockIcon } from "@/components/ui/dock";
import { useAuthSession } from "@/hooks/useAuthSession";
import { dockLinks } from "@/lib/dock-links";

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z" />
    </svg>
  );
}

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.76 14.07c-.24.68-1.4 1.3-1.94 1.38-.49.07-1.12.1-1.8-.11-.42-.13-.95-.31-1.63-.61-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.97 0-1.41.74-2.1 1-2.39.26-.29.57-.36.76-.36.19 0 .38.01.55.02.18.01.42-.07.65.49.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.26 1.64 2.04 1.13 1 2.08 1.31 2.38 1.46.3.15.47.13.65-.08.17-.21.74-.86.94-1.16.19-.29.39-.24.66-.14.27.1 1.71.81 2 .95.29.15.49.22.56.34.07.12.07.7-.17 1.38Z" />
    </svg>
  );
}

interface DockItemConfig {
  label: string;
  href: string;
  external: boolean;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const DOCK_ITEMS: DockItemConfig[] = [
  {
    label: "Blog",
    href: dockLinks.blog,
    external: true,
    Icon: PenLine,
  },
  {
    label: "GitHub",
    href: dockLinks.github,
    external: true,
    Icon: GitHubIcon,
  },
  {
    label: "LinkedIn",
    href: dockLinks.linkedin,
    external: true,
    Icon: LinkedInIcon,
  },
  {
    label: "WhatsApp",
    href: dockLinks.whatsapp,
    external: true,
    Icon: WhatsAppIcon,
  },
  {
    label: "Email",
    href: `mailto:${dockLinks.email}`,
    external: false,
    Icon: Mail,
  },
];

export function SocialDock() {
  const router = useRouter();
  const { user, loading } = useAuthSession();

  return (
    <section
      aria-label="THE BHANU social and contact dock"
      className="relative z-10 w-full px-4 pt-8 pb-14 sm:px-6 sm:pt-12 sm:pb-16"
    >
      <div className="mx-auto flex max-w-[var(--container-max)] flex-col items-center justify-center gap-6">
        <p className="select-none bg-gradient-to-b from-[var(--text-primary)] to-[var(--text-muted)] bg-clip-text text-center text-2xl font-bold tracking-[0.42em] text-transparent sm:text-3xl md:text-4xl">
          B H A N U
        </p>

        <Dock iconSize={38} iconMagnification={54} iconDistance={120} direction="middle">
          {DOCK_ITEMS.map(({ label, href, external, Icon }) => {
            const isGatedContact = label === "WhatsApp" || label === "Email";
            return (
              <DockIcon key={label}>
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  onClick={(e) => {
                    if (isGatedContact && !loading && !user) {
                      e.preventDefault();
                      showAuthToast("Please sign in to continue");
                      router.push(buildLoginRedirectUrl("/custom-studio"));
                    }
                  }}
                  className="group relative flex h-full w-full items-center justify-center rounded-full text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-[#6D9B6E]"
                >
                <Icon className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
                <span
                  role="tooltip"
                  className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg border border-[var(--glass-border-strong)] bg-[var(--bg-secondary)] px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--text-primary)] opacity-0 shadow-md transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                >
                  {label}
                </span>
                </a>
              </DockIcon>
            );
          })}
        </Dock>
      </div>
    </section>
  );
}
