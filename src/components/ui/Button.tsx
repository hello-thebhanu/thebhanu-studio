import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "glass" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[#527B48] to-[#658E52] text-white font-semibold shadow-[var(--shadow-glow)] hover:brightness-105 active:scale-[0.99] border border-[#A5CE79]/40",
  glass:
    "glass-surface text-[var(--text-primary)] font-medium hover:border-[var(--glass-border-accent)] hover:bg-[var(--glass-bg-strong)] active:scale-[0.99]",
  ghost:
    "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)] font-medium",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm rounded-[var(--radius-pill)]",
  md: "min-h-11 px-5 py-2.5 text-sm sm:text-base rounded-[var(--radius-pill)]",
  lg: "min-h-12 px-7 py-3 text-base rounded-[var(--radius-pill)]",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

  if ("href" in props && typeof props.href === "string") {
    const { href, ...anchorProps } = props;
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link href={href} className={classes} {...anchorProps}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={classes} {...anchorProps}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...(props as ButtonAsButton)}>
      {children}
    </button>
  );
}
