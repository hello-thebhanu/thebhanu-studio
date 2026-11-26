import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#383b34" },
    { media: "(prefers-color-scheme: light)", color: "#F4F5EF" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.domain),
  title: {
    default: `${SITE_CONFIG.brandName} — Digital Product Studio | ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.brandName}`,
  },
  description:
    "THE BHANU is an independent digital product studio engineering Next.js web experiences, full-stack applications, Android apps, AI solutions, and custom software.",
  keywords: [
    "THE BHANU",
    "Digital Product Studio",
    "Web Development",
    "Next.js Studio",
    "3D Web Experiences",
    "Full-Stack Applications",
    "AI Solutions",
    "Custom Software Studio",
  ],
  authors: [{ name: SITE_CONFIG.brandName, url: SITE_CONFIG.domain }],
  creator: SITE_CONFIG.brandName,
  publisher: SITE_CONFIG.brandName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_CONFIG.domain,
    siteName: SITE_CONFIG.brandName,
    title: `${SITE_CONFIG.brandName} — Ideas. Designed. Engineered.`,
    description:
      "Independent digital product studio crafting interactive 3D web experiences, full-stack software, and custom digital products.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.brandName} — Ideas. Designed. Engineered.`,
    description:
      "Independent digital product studio crafting interactive 3D web experiences, full-stack software, and custom digital products.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem('thebhanu-theme');
    var mode = (stored === 'dark' || stored === 'light' || stored === 'system') ? stored : 'system';
    var resolved = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="relative flex min-h-full flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-[#527B48] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to main content
        </a>

        {/* Subtle Global Ambient Lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
          style={{ background: "var(--bg-ambient-radial)" }}
        />

        <ThemeProvider>
          <Suspense fallback={null}>
            <GoogleAnalytics
              measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
            />
          </Suspense>
          <Suspense fallback={<div className="h-20" aria-hidden="true" />}>
            <Navbar />
          </Suspense>
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
