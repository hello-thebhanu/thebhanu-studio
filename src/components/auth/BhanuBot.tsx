"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type BhanuBotState =
  | "idle"
  | "email-focus"
  | "otp"
  | "error"
  | "success"
  | "wave";

interface BhanuBotProps {
  state?: BhanuBotState;
  /** 0..1 horizontal eye tracking while typing email */
  lookProgress?: number;
  size?: number;
  className?: string;
}

export function BhanuBot({
  state = "idle",
  lookProgress = 0,
  size = 64,
  className = "",
}: BhanuBotProps) {
  const reducedMotion = useReducedMotion();

  const eyeX =
    state === "email-focus" ? -3 + Math.min(1, Math.max(0, lookProgress)) * 6 : 0;
  const eyeY = state === "email-focus" ? -2.5 : state === "otp" ? -1 : 0;

  return (
    <motion.div
      aria-hidden="true"
      className={`relative inline-flex select-none items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={
        reducedMotion
          ? undefined
          : state === "error"
            ? { x: [0, -7, 7, -5, 5, 0], rotate: [0, -5, 5, -3, 3, 0] }
            : state === "success"
              ? { y: [0, -12, 0, -6, 0], scale: [1, 1.08, 1] }
              : {
                  y: [0, -4, 0],
                  rotate: state === "idle" ? [0, -2, 2, 0] : 0,
                }
      }
      transition={
        state === "error"
          ? { duration: 0.42, ease: "easeInOut" }
          : state === "success"
            ? { duration: 0.65, ease: "easeOut" }
            : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {/* Sparkles on success */}
      {state === "success" && !reducedMotion ? (
        <motion.svg
          viewBox="0 0 80 80"
          className="pointer-events-none absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] text-[#A5CE79]"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: [0, 1, 0], scale: [0.7, 1.15, 1.25] }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        >
          <circle cx="14" cy="18" r="2.6" fill="currentColor" />
          <circle cx="68" cy="16" r="2.2" fill="currentColor" />
          <circle cx="72" cy="56" r="2.8" fill="currentColor" />
          <circle cx="10" cy="58" r="2" fill="currentColor" />
        </motion.svg>
      ) : null}

      <svg
        viewBox="0 0 80 80"
        fill="none"
        className="h-full w-full drop-shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
      >
        {/* Leaf antenna */}
        <path
          d="M40 16v-5c0-3.5 3.5-6.5 8-7.5-1.2 4.5-4 7.5-8 7.5"
          stroke="#A5CE79"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 11c0-3.5 3.5-6.5 8-7.5-1.2 4.5-4 7.5-8 7.5Z"
          fill="#A5CE79"
          fillOpacity="0.45"
        />

        {/* Waving hand */}
        <motion.g
          style={{ transformOrigin: "64px 46px" }}
          animate={
            reducedMotion
              ? undefined
              : state === "wave" || state === "success"
                ? { rotate: [0, 22, -14, 20, -10, 0] }
                : { rotate: [0, 8, 0] }
          }
          transition={{
            duration: state === "wave" || state === "success" ? 0.9 : 3,
            repeat: state === "wave" || state === "success" ? 2 : Infinity,
            ease: "easeInOut",
          }}
        >
          <rect
            x="61"
            y="38"
            width="10"
            height="14"
            rx="5"
            fill="#658E52"
            stroke="#A5CE79"
            strokeWidth="1.6"
          />
        </motion.g>

        {/* Head / Body shell */}
        <rect
          x="16"
          y="16"
          width="48"
          height="46"
          rx="18"
          fill="#263020"
          stroke="#A5CE79"
          strokeOpacity="0.65"
          strokeWidth="2"
        />

        {/* Inner visor */}
        <rect
          x="22"
          y="24"
          width="36"
          height="28"
          rx="11"
          fill="#141911"
          stroke="#527B48"
          strokeOpacity="0.6"
          strokeWidth="1.4"
        />

        {/* Eyes */}
        {state === "error" ? (
          <>
            <path
              d="M29 33l5 5m0-5l-5 5"
              stroke="#FCA5A5"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M46 33l5 5m0-5l-5 5"
              stroke="#FCA5A5"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </>
        ) : (
          <motion.g
            animate={{ x: eyeX, y: eyeY }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <motion.ellipse
              cx="32"
              cy="36"
              rx="3.2"
              ry="4"
              fill="#A5CE79"
              animate={
                reducedMotion
                  ? undefined
                  : { scaleY: [1, 1, 0.15, 1, 1] }
              }
              transition={{
                duration: 4.2,
                times: [0, 0.46, 0.5, 0.54, 1],
                repeat: Infinity,
              }}
              style={{ transformOrigin: "32px 36px" }}
            />
            <motion.ellipse
              cx="48"
              cy="36"
              rx="3.2"
              ry="4"
              fill="#A5CE79"
              animate={
                reducedMotion
                  ? undefined
                  : { scaleY: [1, 1, 0.15, 1, 1] }
              }
              transition={{
                duration: 4.2,
                times: [0, 0.46, 0.5, 0.54, 1],
                repeat: Infinity,
              }}
              style={{ transformOrigin: "48px 36px" }}
            />
          </motion.g>
        )}

        {/* Mouth expression */}
        {state === "error" ? (
          <path
            d="M35 46c2.5-2.5 7.5-2.5 10 0"
            stroke="#FCA5A5"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ) : state === "otp" ? (
          <circle cx="40" cy="45" r="2.2" fill="#A5CE79" />
        ) : (
          <path
            d="M34 44c2.5 3 9.5 3 12 0"
            stroke="#A5CE79"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
        )}
      </svg>
    </motion.div>
  );
}
