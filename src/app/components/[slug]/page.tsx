import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  Package,
} from "lucide-react";
import { AssetLivePreview } from "@/components/library/AssetLivePreview";
import { CopyCodeBlock } from "@/components/library/CopyCodeBlock";
import { ProductStatusBadge } from "@/components/marketplace/ProductStatusBadge";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { SITE_CONFIG } from "@/lib/constants";
import { getPublicAssetBySlug, getPublicAssetsData } from "@/lib/assets/db";

type ComponentDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { assets } = await getPublicAssetsData();
  return assets.map((asset) => ({ slug: asset.slug }));
}

export async function generateMetadata({
  params,
}: ComponentDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const { asset } = await getPublicAssetBySlug(slug);

  if (!asset) {
    return {
      title: "Component Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: asset.seoTitle || asset.name,
    description: asset.seoDescription || asset.summary,
    alternates: { canonical: `/components/${asset.slug}` },
    openGraph: {
      type: "website",
      url: `${SITE_CONFIG.domain}/components/${asset.slug}`,
      siteName: SITE_CONFIG.brandName,
      title: `${asset.seoTitle || asset.name} | ${SITE_CONFIG.brandName}`,
      description: asset.seoDescription || asset.summary,
    },
    twitter: {
      card: "summary_large_image",
      title: `${asset.seoTitle || asset.name} | ${SITE_CONFIG.brandName}`,
      description: asset.seoDescription || asset.summary,
    },
  };
}

async function ComponentDetailContent({ params }: ComponentDetailProps) {
  const { slug } = await params;
  const { asset, categories, relatedAssets } = await getPublicAssetBySlug(slug);

  if (!asset) {
    notFound();
  }

  const categoryName =
    categories.find((c) => c.slug === asset.categorySlug)?.name ??
    asset.assetType;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_CONFIG.domain },
          { "@type": "ListItem", position: 2, name: "UI Library", item: `${SITE_CONFIG.domain}/components` },
          { "@type": "ListItem", position: 3, name: asset.name, item: `${SITE_CONFIG.domain}/components/${asset.slug}` },
        ],
      },
      {
        "@type": "SoftwareSourceCode",
        name: asset.name,
        description: asset.summary,
        programmingLanguage: asset.codeLanguage || "TypeScript",
        url: `${SITE_CONFIG.domain}/components/${asset.slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-20 sm:px-6 sm:pt-32 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)] sm:text-sm">
          <li>
            <Link href="/" className="hover:text-[var(--accent-primary)]">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link
              href="/components"
              className="hover:text-[var(--accent-primary)]"
            >
              UI Library
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="font-medium text-[var(--text-primary)]">
            {asset.name}
          </li>
        </ol>
      </nav>

      {/* Header & Live Preview */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7">
          <GlassCard className="p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between font-mono text-xs text-[var(--text-muted)]">
              <span>Live Interactive Preview</span>
              <span>{asset.assetType}</span>
            </div>
            <AssetLivePreview previewKey={asset.previewKey} />
          </GlassCard>
        </div>

        <div className="lg:col-span-5">
          <GlassCard className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[var(--radius-pill)] border border-[var(--glass-border-accent)] bg-[var(--accent-soft)] px-3 py-1 font-mono text-xs font-medium text-[var(--accent-primary)]">
                {categoryName}
              </span>
              <ProductStatusBadge status={asset.status} />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              {asset.name}
            </h1>

            <p className="mt-3 text-base leading-relaxed text-[var(--text-secondary)]">
              {asset.summary}
            </p>

            {asset.dependencies.length > 0 ? (
              <div className="mt-6 border-t border-[var(--glass-border)] pt-5">
                <h2 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                  <Package className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                  <span>Dependencies</span>
                </h2>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {asset.dependencies.map((dep) => (
                    <li
                      key={dep}
                      className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] px-3 py-1 font-mono text-xs text-[var(--text-secondary)]"
                    >
                      {dep}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {asset.tags.length > 0 ? (
              <div className="mt-5">
                <ul className="flex flex-wrap gap-1.5">
                  {asset.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--text-muted)]"
                    >
                      #{tag}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3">
              {asset.resourceUrl ? (
                <Button href={asset.resourceUrl} variant="primary" size="md">
                  <span>Open Linked Resource</span>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : null}
              <Button href="/components" variant="glass" size="md">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back to UI Library</span>
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Code Snippet & Usage Instructions */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {asset.codeSnippet ? (
          <div className="lg:col-span-7">
            <h2 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">
              Code Snippet
            </h2>
            <CopyCodeBlock
              code={asset.codeSnippet}
              language={asset.codeLanguage || "tsx"}
            />
          </div>
        ) : null}

        <GlassCard
          className={`p-6 sm:p-8 ${
            asset.codeSnippet ? "lg:col-span-5" : "lg:col-span-12"
          }`}
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Usage Instructions
          </h2>
          <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
            {asset.usageInstructions ||
              "Copy the snippet into your Next.js + Tailwind CSS project and adjust tokens as needed."}
          </div>
        </GlassCard>
      </div>

      {/* Related Resources */}
      {relatedAssets.length > 0 ? (
        <section className="mt-14 border-t border-[var(--glass-border)] pt-10">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            More from the UI Library
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            {relatedAssets.map((rel) => (
              <GlassCard key={rel.id} interactive className="flex flex-col p-5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--accent-primary)]">
                  {rel.assetType}
                </span>
                <h3 className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                  {rel.name}
                </h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {rel.summary}
                </p>
                <Link
                  href={`/components/${rel.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-primary)] hover:underline"
                >
                  <span>Inspect</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </GlassCard>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default function ComponentDetailPage({ params }: ComponentDetailProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[var(--container-max)] px-4 pt-28 pb-20 sm:px-6 lg:px-8">
          <Skeleton rounded="xl" className="h-80 w-full" />
        </div>
      }
    >
      <ComponentDetailContent params={params} />
    </Suspense>
  );
}
