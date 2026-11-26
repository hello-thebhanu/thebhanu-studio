"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  errorTrigger?: number;
}

const LENGTH = 6;

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
  errorTrigger = 0,
}: OtpInputProps) {
  const reducedMotion = useReducedMotion();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const digits = Array.from({ length: LENGTH }, (_, idx) => value[idx] ?? "");

  // Focus first box on mount
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      inputRefs.current[0]?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  // On wrong code: clear boxes and refocus first input
  useEffect(() => {
    if (errorTrigger === 0) return;
    onChange("");
    const id = window.setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 120);
    return () => window.clearTimeout(id);
  }, [errorTrigger, onChange]);

  const updateAt = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      const next = digits.map((d, i) => (i === index ? "" : d)).join("");
      onChange(next);
      return;
    }

    // Handle multi-digit paste or autofill into a single input
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, LENGTH);
      onChange(pasted);
      const targetIdx = Math.min(pasted.length, LENGTH - 1);
      inputRefs.current[targetIdx]?.focus();
      if (pasted.length === LENGTH) {
        onComplete?.(pasted);
      }
      return;
    }

    const nextArr = [...digits];
    nextArr[index] = cleaned;
    const nextCode = nextArr.join("");
    onChange(nextCode);

    if (index < LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (nextCode.length === LENGTH && !nextArr.includes("")) {
      onComplete?.(nextCode);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        const next = digits.map((d, i) => (i === index ? "" : d)).join("");
        onChange(next);
      } else if (index > 0) {
        const next = digits.map((d, i) => (i === index - 1 ? "" : d)).join("");
        onChange(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!text) return;
    onChange(text);
    const focusIdx = Math.min(text.length, LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (text.length === LENGTH) {
      onComplete?.(text);
    }
  };

  return (
    <motion.div
      key={errorTrigger}
      animate={
        hasError && !reducedMotion
          ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
          : { x: 0 }
      }
      transition={{ duration: 0.42, ease: "easeInOut" }}
      role="group"
      aria-label="6-digit verification code"
      className="grid grid-cols-6 gap-2 sm:gap-2.5"
    >
      {digits.map((digit, idx) => {
        const isFocused = focusedIndex === idx;
        const hasDigit = Boolean(digit);
        return (
          <motion.div
            key={idx}
            animate={
              hasDigit && !reducedMotion
                ? { scale: [1, 1.07, 1] }
                : { scale: 1 }
            }
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative"
          >
            <input
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={idx === 0 ? "one-time-code" : "off"}
              maxLength={6}
              disabled={disabled}
              value={digit}
              aria-label={`Digit ${idx + 1} of ${LENGTH}`}
              onFocus={() => setFocusedIndex(idx)}
              onBlur={() => setFocusedIndex((prev) => (prev === idx ? null : prev))}
              onChange={(e) => updateAt(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`h-13 w-full rounded-xl border text-center font-mono text-xl font-bold text-[#F4F5EF] outline-none transition-all duration-200 sm:h-14 sm:text-2xl ${
                hasError
                  ? "border-red-400/80 bg-red-500/10 shadow-[0_0_18px_rgba(239,68,68,0.28)]"
                  : isFocused
                    ? "border-[#A5CE79] bg-[#242c1e] shadow-[0_0_20px_rgba(165,206,121,0.26)]"
                    : hasDigit
                      ? "border-[#6D9B6E]/70 bg-[#22291c]"
                      : "border-white/15 bg-[#1b2017]/90 hover:border-white/25"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
