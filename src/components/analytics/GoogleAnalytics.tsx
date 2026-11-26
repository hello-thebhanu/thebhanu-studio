"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

export function GoogleAnalytics({
  measurementId,
}: {
  measurementId?: string;
}) {
  const pathname = usePathname();
  const id = measurementId?.trim();

  useEffect(() => {
    if (!id || typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }
    window.gtag("config", id, { page_path: pathname });
  }, [id, pathname]);

  if (!id || !/^G-[A-Z0-9]+$/i.test(id)) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="thebhanu-ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
