import type { Metadata } from "next";
import { Suspense } from "react";
import { MarketplaceBrowser } from "@/components/marketplace/MarketplaceBrowser";
import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { SITE_CONFIG } from "@/lib/constants";
import { getPublicMarketplaceData } from "@/lib/marketplace/db";
import { getAllCategories, getAllProducts } from "@/lib/marketplace/repository";

export const metadata: Metadata = {
  title: "Marketplace — Digital Products, Templates & AI Tools",
  description:
    "Explore website templates, landing pages, full-stack starters, SaaS foundations, Android apps, UI kits, and automation workflows by THE BHANU.",
  alternates: {
    canonical: "/marketplace",
  },
  openGraph: {
    type: "website",
    url: `${SITE_CONFIG.domain}/marketplace`,
    siteName: SITE_CONFIG.brandName,
    title: `Marketplace | ${SITE_CONFIG.brandName}`,
    description:
      "Discover digital products, reusable UI systems, and software starters engineered by THE BHANU.",
  },
  twitter: {
    card: "summary_large_image",
    title: `Marketplace | ${SITE_CONFIG.brandName}`,
    description:
      "Discover digital products, reusable UI systems, and software starters engineered by THE BHANU.",
  },
};

function MarketplaceLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <div className="glass-surface rounded-[var(--radius-xl)] p-7 sm:p-10">
        <Skeleton rounded="pill" className="h-6 w-44" />
        <Skeleton rounded="md" className="mt-5 h-10 w-3/4 max-w-xl" />
        <Skeleton rounded="sm" className="mt-3 h-4 w-full max-w-lg" />
        <Skeleton rounded="pill" className="mt-6 h-12 w-full max-w-xl" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((idx) => (
            <Skeleton key={idx} rounded="md" className="h-16 w-full" />
          ))}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

async function LiveMarketplaceBrowser() {
  const { products, categories } = await getPublicMarketplaceData();
  return (
    <MarketplaceBrowser
      initialProducts={products}
      initialCategories={categories}
    />
  );
}

export default function MarketplacePage() {
  const products = getAllProducts();
  const categories = getAllCategories();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_CONFIG.brandName} Digital Product Marketplace`,
    url: `${SITE_CONFIG.domain}/marketplace`,
    description:
      "Universal digital product catalogue spanning website templates, full-stack starters, UI kits, AI tools, and workflow automation.",
    numberOfItems: products.length,
    about: categories.map((cat) => cat.name),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense fallback={<MarketplaceLoadingSkeleton />}>
        <LiveMarketplaceBrowser />
      </Suspense>
    </>
  );
}
