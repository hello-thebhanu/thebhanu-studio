import { Suspense } from "react";
import type { Metadata } from "next";
import { AssetLibraryBrowser } from "@/components/library/AssetLibraryBrowser";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { SITE_CONFIG } from "@/lib/constants";
import { getPublicAssetsData } from "@/lib/assets/db";

export const metadata: Metadata = {
  title: "UI Components & Digital Asset Library",
  description:
    "Explore reusable Nature-Tech React UI components, skeletons, status badges, code snippets, and design resources crafted by THE BHANU.",
  alternates: {
    canonical: "/components",
  },
  openGraph: {
    type: "website",
    url: `${SITE_CONFIG.domain}/components`,
    siteName: SITE_CONFIG.brandName,
    title: `UI Components & Asset Library | ${SITE_CONFIG.brandName}`,
    description:
      "Live UI component previews, copy-ready React/Tailwind code snippets, and design system resources.",
  },
};

function ComponentsLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <Skeleton rounded="xl" className="h-64 w-full" />
      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

async function LiveAssetLibrary() {
  const { assets, categories } = await getPublicAssetsData();
  return (
    <AssetLibraryBrowser
      initialAssets={assets}
      initialCategories={categories}
    />
  );
}

export default function ComponentsLibraryPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_CONFIG.brandName} UI Components & Digital Asset Library`,
    url: `${SITE_CONFIG.domain}/components`,
    description:
      "Reusable UI components, glassmorphism primitives, shimmer skeletons, and digital design resources.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense fallback={<ComponentsLoadingSkeleton />}>
        <LiveAssetLibrary />
      </Suspense>
    </>
  );
}
