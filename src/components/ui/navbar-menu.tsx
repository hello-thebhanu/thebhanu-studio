"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

const SPRING_TRANSITION = {
  type: "spring",
  mass: 0.5,
  damping: 16,
  stiffness: 180,
  restDelta: 0.001,
  restSpeed: 0.001,
} as const;

export interface IconNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface IconNavbarMenuProps {
  items: IconNavItem[];
  /** Currently expanded/selected item href (null when idle at initial load). */
  activeHref: string | null;
  /** Route-level highlight href (e.g. /marketplace) when navigating between pages. */
  routeActiveHref?: string | null;
  onSelect: (item: IconNavItem, event: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export function IconNavbarMenu({
  items,
  activeHref,
  routeActiveHref = null,
  onSelect,
  className,
}: IconNavbarMenuProps) {
  const reducedMotion = useReducedMotion();

  return (
    <nav
      aria-label="Primary navigation"
      className={cn(
        "flex items-center justify-center gap-1 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-1 backdrop-blur-md",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isExpanded = activeHref === item.href;
        const isCurrent = isExpanded || routeActiveHref === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => onSelect(item, e)}
            aria-label={item.label}
            aria-current={isCurrent ? "page" : undefined}
            title={item.label}
            className={cn(
              "group relative inline-flex h-9 items-center justify-center rounded-full px-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D9B6E] sm:px-3",
              isExpanded
                ? "border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)] shadow-sm"
                : isCurrent
                  ? "border border-[var(--glass-border-accent)]/60 bg-[var(--accent-soft)]/50 text-[var(--accent-primary)]"
                  : "border border-transparent text-[var(--text-secondary)] hover:bg-[var(--accent-soft)]/60 hover:text-[var(--text-primary)]",
            )}
          >
            <motion.span
              whileTap={reducedMotion ? undefined : { scale: 0.92 }}
              className="inline-flex items-center justify-center"
            >
              <Icon
                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105"
                strokeWidth={1.9}
                aria-hidden="true"
              />
            </motion.span>

            <motion.span
              initial={false}
              animate={
                reducedMotion
                  ? {
                      width: isExpanded ? "auto" : 0,
                      opacity: isExpanded ? 1 : 0,
                      marginLeft: isExpanded ? 6 : 0,
                    }
                  : {
                      width: isExpanded ? "auto" : 0,
                      opacity: isExpanded ? 1 : 0,
                      marginLeft: isExpanded ? 6 : 0,
                    }
              }
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      width: SPRING_TRANSITION,
                      opacity: { duration: 0.18, ease: "easeOut" },
                      marginLeft: { duration: 0.18, ease: "easeOut" },
                    }
              }
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="inline-block pr-0.5 text-xs font-semibold tracking-wide">
                {item.label}
              </span>
            </motion.span>
          </Link>
        );
      })}
    </nav>
  );
}

export default IconNavbarMenu;
