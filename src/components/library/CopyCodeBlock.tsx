"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { trackEvent } from "@/lib/analytics/gtag";

export function CopyCodeBlock({
  code,
  language = "tsx",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      trackEvent("copy_component_code", { language });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--glass-border-strong)] bg-[#252821] text-[#F4F5EF] shadow-[var(--shadow-glass)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#1E211B] px-4 py-2.5">
        <div className="flex items-center gap-2 font-mono text-xs text-[#C8D0BE]">
          <Terminal className="h-3.5 w-3.5 text-[#A5CE79]" aria-hidden="true" />
          <span className="uppercase">{language}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code snippet"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-xs font-medium text-[#F4F5EF] transition-colors hover:border-[#A5CE79]/50 hover:bg-[#527B48]/40 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#A5CE79]" aria-hidden="true" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[#E7ECE0] sm:p-5 sm:text-[13px]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
