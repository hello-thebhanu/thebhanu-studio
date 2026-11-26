import { HeroSection } from "@/components/hero/HeroSection";
import { LivingWorldContainer } from "@/components/living-world/LivingWorldContainer";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { ProductsPreview } from "@/components/sections/ProductsPreview";
import { ServicesPreview } from "@/components/sections/ServicesPreview";
import { StudioIntro } from "@/components/sections/StudioIntro";
import { SERVICES_PREVIEW, SITE_CONFIG } from "@/lib/constants";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_CONFIG.domain}/#organization`,
      name: SITE_CONFIG.brandName,
      url: SITE_CONFIG.domain,
      slogan: SITE_CONFIG.tagline,
      email: SITE_CONFIG.contactEmail,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_CONFIG.domain}/#website`,
      url: SITE_CONFIG.domain,
      name: SITE_CONFIG.brandName,
      description: SITE_CONFIG.heroSupportingText,
      publisher: {
        "@id": `${SITE_CONFIG.domain}/#organization`,
      },
    },
    {
      "@type": "Service",
      "@id": `${SITE_CONFIG.domain}/#services`,
      provider: { "@id": `${SITE_CONFIG.domain}/#organization` },
      serviceType: "Software Development & Digital Products",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "THE BHANU Engineering Capabilities",
        itemListElement: SERVICES_PREVIEW.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.description,
          },
        })),
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HeroSection />
      <LivingWorldContainer>
        <ServicesPreview />
        <ProductsPreview />
        <StudioIntro />
        <ContactCTA />
      </LivingWorldContainer>
    </>
  );
}
