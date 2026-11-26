"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/gtag";

export function ProductViewTracker({
  slug,
  name,
  categorySlug,
}: {
  slug: string;
  name: string;
  categorySlug: string;
}) {
  useEffect(() => {
    trackEvent("view_product", {
      product_slug: slug,
      product_name: name,
      category_slug: categorySlug,
    });
  }, [categorySlug, name, slug]);

  return null;
}
