"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SylvaRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  radius?: string;
}

export function SylvaReveal({
  children,
  delay = 0,
  className = "",
  radius,
}: SylvaRevealProps) {
  void radius;
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
        scale: 0.985,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.16, 1, 0.3, 1] as const,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
