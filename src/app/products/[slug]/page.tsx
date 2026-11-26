import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  ExternalLink,
  Eye,
  Layers,
} from "lucide-react";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { ProductGallery } from "@/components/marketplace/ProductGallery";
import { ProductViewTracker } from "@/components/analytics/ProductViewTracker";
import {
  DemoBadge,
  FeaturedBadge,
  ProductStatusBadge,
} from "@/components/marketplace/ProductStatusBadge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";
import { SITE_CONFIG } from "@/lib/constants";
import {
  getPublicMarketplaceData,
  getPublicProductBySlugFromDb,
} from "@/lib/marketplace/db";
import { getAllProducts } from "@/lib/marketplace/repository";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { products } = await getPublicMarketplaceData();
  const list = products.length > 0 ? products : getAllProducts();
  return list.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getPublicProductBySlugFromDb(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested digital product could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = `/products/${product.slug}`;
  const ogImages = product.thumbnail
    ? [
        {
          url: product.thumbnail.url,
          alt: product.thumbnail.alt,
        },
      ]
    : undefined;

  return {
    title: product.seoTitle,
    description: product.seoDescription,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      url: `${SITE_CONFIG.domain}${canonicalPath}`,
      siteName: SITE_CONFIG.brandName,
      title: `${product.seoTitle} | ${SITE_CONFIG.brandName}`,
      description: product.seoDescription,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.seoTitle} | ${SITE_CONFIG.brandName}`,
      description: product.seoDescription,
      images: ogImages ? ogImages.map((img) => img.url) : undefined,
    },
  };
}

function formatIsoDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

function isExternalHref(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

function ProductDetailLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-8">
      <Skeleton rounded="sm" className="h-4 w-64" />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <Skeleton rounded="xl" className="aspect-[16/10] w-full" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton rounded="md" className="aspect-[16/10] w-full" />
            <Skeleton rounded="md" className="aspect-[16/10] w-full" />
            <Skeleton rounded="md" className="aspect-[16/10] w-full" />
          </div>
        </div>
        <div className="glass-surface rounded-[var(--radius-xl)] p-6 sm:p-8 lg:col-span-5">
          <div className="flex gap-2">
            <Skeleton rounded="pill" className="h-6 w-32" />
            <Skeleton rounded="pill" className="h-6 w-20" />
          </div>
          <Skeleton rounded="md" className="mt-5 h-8 w-4/5" />
          <Skeleton rounded="sm" className="mt-3 h-4 w-36" />
          <Skeleton rounded="sm" className="mt-5 h-4 w-full" />
          <Skeleton rounded="sm" className="mt-2 h-4 w-5/6" />
          <Skeleton rounded="pill" className="mt-6 h-11 w-full" />
          <Skeleton rounded="pill" className="mt-3 h-11 w-full" />
          <div className="mt-7 flex flex-wrap gap-2 border-t border-[var(--glass-border)] pt-5">
            <Skeleton rounded="pill" className="h-6 w-20" />
            <Skeleton rounded="pill" className="h-6 w-24" />
            <Skeleton rounded="pill" className="h-6 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<ProductDetailLoadingSkeleton />}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}

async function ProductDetailContent({ params }: ProductPageProps) {
  const { slug } = await params;
  const { product, categories, relatedProducts } =
    await getPublicProductBySlugFromDb(slug);

  if (!product) {
    notFound();
  }

  const category = categories.find((c) => c.slug === product.categorySlug);
  const categoryName = category?.name ?? "Digital Product";
  const galleryImages =
    product.gallery.length > 0
      ? product.gallery
      : product.thumbnail
        ? [product.thumbnail]
        : [];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_CONFIG.domain,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Marketplace",
            item: `${SITE_CONFIG.domain}/marketplace`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: categoryName,
            item: `${SITE_CONFIG.domain}/marketplace?category=${product.categorySlug}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: product.name,
            item: `${SITE_CONFIG.domain}/products/${product.slug}`,
          },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: product.name,
        description: product.shortDescription,
        applicationCategory: categoryName,
        operatingSystem: "Web / Cross-platform",
        url: `${SITE_CONFIG.domain}/products/${product.slug}`,
        creator: {
          "@type": "Organization",
          name: SITE_CONFIG.brandName,
          url: SITE_CONFIG.domain,
        },
      },
    ],
  };

  return (
    <>
      <ProductViewTracker
        slug={product.slug}
        name={product.name}
        categorySlug={product.categorySlug}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)] sm:text-sm">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-[var(--accent-primary)]"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link
                href="/marketplace"
                className="transition-colors hover:text-[var(--accent-primary)]"
              >
                Marketplace
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li>
              <Link
                href={`/marketplace?category=${product.categorySlug}`}
                className="transition-colors hover:text-[var(--accent-primary)]"
              >
                {categoryName}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="h-3.5 w-3.5" />
            </li>
            <li
              aria-current="page"
              className="font-medium text-[var(--text-primary)]"
            >
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Main 2-Column Product Overview */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left: Multi-Image Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery images={galleryImages} productName={product.name} />
          </div>

          {/* Right: Core Metadata, Status & Conditional Actions */}
          <div className="lg:col-span-5">
            <GlassCard className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/marketplace?category=${product.categorySlug}`}
                  className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3 py-1 font-mono text-xs font-medium text-[var(--accent-primary)] transition-colors hover:bg-[#527B48] hover:text-white"
                >
                  {categoryName}
                </Link>
                <ProductStatusBadge status={product.status} />
                {product.featured ? <FeaturedBadge /> : null}
                {product.isDemoRecord ? <DemoBadge /> : null}
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                {product.name}
              </h1>

              <p className="mt-2 font-mono text-xs text-[var(--text-muted)]">
                Type: {product.productType}
              </p>

              <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
                {product.shortDescription}
              </p>

              {/* Conditional Action Buttons (only rendered when URL is valid) */}
              <div className="mt-6 flex flex-col gap-3">
                {product.liveDemoUrl ? (
                  <Button
                    href={product.liveDemoUrl}
                    variant="primary"
                    size="lg"
                    target={isExternalHref(product.liveDemoUrl) ? "_blank" : undefined}
                    rel={
                      isExternalHref(product.liveDemoUrl)
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : null}

                {product.previewUrl ? (
                  <Button
                    href={product.previewUrl}
                    variant={product.liveDemoUrl ? "glass" : "primary"}
                    size="lg"
                    target={isExternalHref(product.previewUrl) ? "_blank" : undefined}
                    rel={
                      isExternalHref(product.previewUrl)
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                    <span>Preview Architecture</span>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ) : null}

                {product.documentationUrl ? (
                  <Button
                    href={product.documentationUrl}
                    variant="glass"
                    size="md"
                    target={
                      isExternalHref(product.documentationUrl) ? "_blank" : undefined
                    }
                    rel={
                      isExternalHref(product.documentationUrl)
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    <span>Documentation</span>
                  </Button>
                ) : null}

                <Button href="/#contact" variant="glass" size="md">
                  <span>Request Custom Adaptation</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              {/* Technologies Stack */}
              <div className="mt-7 border-t border-[var(--glass-border)] pt-5">
                <h2 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                  <Layers className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                  <span>Technologies Used</span>
                </h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {product.technologies.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-3 py-1 font-mono text-xs text-[var(--text-secondary)]"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timestamps */}
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--glass-border)] pt-5 text-xs">
                <div>
                  <dt className="flex items-center gap-1.5 font-mono text-[var(--text-muted)]">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Added</span>
                  </dt>
                  <dd className="mt-1 font-medium text-[var(--text-primary)]">
                    {formatIsoDate(product.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 font-mono text-[var(--text-muted)]">
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Updated</span>
                  </dt>
                  <dd className="mt-1 font-medium text-[var(--text-primary)]">
                    {formatIsoDate(product.updatedAt)}
                  </dd>
                </div>
              </dl>
            </GlassCard>
          </div>
        </div>

        {/* Detailed Overview & Key Features */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <GlassCard className="p-6 sm:p-8 lg:col-span-7">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              Detailed Overview
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
              {product.fullDescription}
            </p>
            {product.isDemoRecord ? (
              <p className="mt-5 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] p-4 text-xs leading-relaxed text-[var(--text-muted)]">
                This is a sample catalogue entry showing the product specification layout.
                Live pricing and downloads will be added soon.
              </p>
            ) : null}
          </GlassCard>

          <GlassCard className="p-6 sm:p-8 lg:col-span-5">
            <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              Key Features
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-secondary)]"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] text-[var(--accent-primary)]">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 ? (
          <section
            aria-labelledby="related-products-heading"
            className="mt-16 border-t border-[var(--glass-border)] pt-12"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <SectionHeading
                id="related-products-heading"
                eyebrow="Related Solutions"
                title="Continue exploring the catalogue."
              />
              <Button href="/marketplace" variant="glass" size="sm">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back to Marketplace</span>
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((related) => (
                <ProductCard
                  key={related.id}
                  product={related}
                  categoryName={
                    categories.find((c) => c.slug === related.categorySlug)?.name ??
                    "Digital Product"
                  }
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
