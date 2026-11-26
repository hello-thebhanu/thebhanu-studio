import { SylvaHero } from "@/shaders/landing-pages/SylvaHero";

export function HeroSection() {
  return (
    <section
      id="top"
      aria-label="THE BHANU Studio Introduction"
      className="relative h-[213.82vw] w-full overflow-hidden bg-[#383b34] min-[901px]:h-[100svh] min-[901px]:min-h-[max(55vw,620px)] min-[901px]:max-h-[1120px]"
    >
      <SylvaHero
        variant="living-green"
        headingFont="lexend"
        bodyFont="lexend"
        headingWeight="300"
        bodyWeight="300"
        primaryColor="#ffffff"
        headingSize={63}
        bodySize={16.5}
        headingLetterSpacing={-0.006}
        className="h-full w-full"
      />

      {/* Seamless Bottom Mist Feathering into Living-World Continuation */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-36 bg-gradient-to-b from-transparent via-[var(--bg-primary)]/60 to-[var(--bg-primary)] sm:h-44"
      />
    </section>
  );
}
