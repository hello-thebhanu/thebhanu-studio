import { Suspense } from "react";
import type { Metadata } from "next";
import { CustomStudioBuilder } from "@/components/custom-studio/CustomStudioBuilder";
import { Skeleton } from "@/components/ui/Skeleton";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Custom Studio — Project Requirement Builder",
  description:
    "Scope your custom website, full-stack application, Android app, AI solution, or workflow automation with THE BHANU.",
  alternates: { canonical: "/custom-studio" },
  openGraph: {
    type: "website",
    url: `${SITE_CONFIG.domain}/custom-studio`,
    siteName: SITE_CONFIG.brandName,
    title: `Custom Studio | ${SITE_CONFIG.brandName}`,
    description:
      "Interactive multi-step project configurator to scope custom software builds.",
  },
  twitter: {
    card: "summary_large_image",
    title: `Custom Studio | ${SITE_CONFIG.brandName}`,
    description:
      "Scope your custom website, full-stack app, Android app, AI solution, or automation build.",
  },
};

export default function CustomStudioPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Custom Studio | ${SITE_CONFIG.brandName}`,
    url: `${SITE_CONFIG.domain}/custom-studio`,
    description:
      "Interactive multi-step project configurator to scope custom software builds.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense
        fallback={
          <div className="mx-auto max-w-4xl px-4 pt-28 pb-20 sm:px-6">
            <Skeleton rounded="xl" className="h-96 w-full" />
          </div>
        }
      >
        <CustomStudioBuilder />
      </Suspense>
    </>
  );
}
