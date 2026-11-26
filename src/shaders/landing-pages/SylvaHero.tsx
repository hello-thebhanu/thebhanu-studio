"use client";

import { LandingPageFrame, type LandingPageProps } from "./LandingPageFrame";
import { SYLVA_TYPOGRAPHY } from "./pageRecipes";
import {
  splitTypographyProps,
  usePageTypography,
  type PageTypographyProps,
} from "./pageTypography";

export const SYLVA_HERO_VARIANTS = ["living-green"] as const;
export type SylvaHeroVariant = (typeof SYLVA_HERO_VARIANTS)[number];

export type SylvaHeroProps = LandingPageProps &
  PageTypographyProps & {
    variant?: SylvaHeroVariant;
  };

const SYLVA_HERO_BASE_URL = "/landing-pages/inner-green-3d.html";

export function SylvaHero({ variant = "living-green", ...props }: SylvaHeroProps) {
  void variant;
  const [type, frame] = splitTypographyProps(props);
  const customization = usePageTypography(SYLVA_TYPOGRAPHY, type);

  return (
    <LandingPageFrame
      {...frame}
      customization={customization}
      title="THE BHANU — Ideas into Digital Products."
      sourceUrl={SYLVA_HERO_BASE_URL}
    />
  );
}
