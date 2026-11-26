"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const LEAF_PARTICLES = [
  { id: 1, left: "12%", top: "20%", size: 14, delay: 0, dur: 11 },
  { id: 2, left: "82%", top: "18%", size: 12, delay: 1.4, dur: 13 },
  { id: 3, left: "24%", top: "76%", size: 16, delay: 0.8, dur: 12 },
  { id: 4, left: "74%", top: "72%", size: 11, delay: 2.1, dur: 10 },
  { id: 5, left: "48%", top: "14%", size: 10, delay: 1.7, dur: 14 },
  { id: 6, left: "88%", top: "52%", size: 13, delay: 0.5, dur: 11.5 },
];

export function AnimatedBackground() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#171b14]"
    >
      {/* Subtle deep green studio gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 65% at 50% 25%, rgba(82, 123, 72, 0.22) 0%, rgba(28, 33, 24, 0.65) 55%, #141811 100%)",
        }}
      />

      {/* Drifting Green Orbs (lightweight transform/opacity only, no WebGL) */}
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : { x: [0, 32, -18, 0], y: [0, -24, 18, 0], scale: [1, 1.08, 0.96, 1] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-28 -left-24 h-96 w-96 rounded-full bg-[#527B48]/25 blur-3xl"
      />
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : { x: [0, -28, 22, 0], y: [0, 26, -20, 0], scale: [1, 0.94, 1.06, 1] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-24 -bottom-24 h-[26rem] w-[26rem] rounded-full bg-[#789B55]/20 blur-3xl"
      />
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : { x: [0, 16, -20, 0], y: [0, 18, -14, 0] }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A5CE79]/10 blur-3xl"
      />

      {/* Subtle floating leaf / spore silhouettes */}
      {LEAF_PARTICLES.map((p) => (
        <motion.svg
          key={p.id}
          viewBox="0 0 24 24"
          fill="none"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, -18, 0],
                  x: [0, 8, -6, 0],
                  rotate: [0, 14, -10, 0],
                  opacity: [0.22, 0.48, 0.22],
                }
          }
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute text-[#A5CE79]/35"
        >
          <path
            d="M12 21c0-6.5 3.6-11.5 9-14-1.2 6.8-4.5 11.4-9 14Zm0 0C12 14.5 8.4 9.5 3 7c1.2 6.8 4.5 11.4 9 14Z"
            fill="currentColor"
          />
        </motion.svg>
      ))}
    </div>
  );
}
