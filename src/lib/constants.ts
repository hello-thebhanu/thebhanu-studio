export type ThemeMode = "dark" | "light" | "system";

export const SITE_CONFIG = {
  brandName: "THE BHANU",
  domain: "https://thebhanu.in",
  tagline: "Ideas into Digital Products.",
  heroHeadline: "Ideas. Designed. Engineered.",
  heroSupportingText:
    "THE BHANU is an independent digital product studio and software engineering house crafting high-craft web platforms, ready-made software products, AI workflows, and bespoke applications.",
  contactEmail: "thebhanuofficial@gmail.com",
} as const;

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/#top" },
  { label: "Services", href: "/#services" },
  { label: "Products", href: "/marketplace" },
  { label: "UI Library", href: "/components" },
  { label: "Projects", href: "/#projects" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  scope: string[];
  iconName:
    | "Globe"
    | "Layers"
    | "Smartphone"
    | "Sparkles"
    | "Workflow"
    | "GraduationCap";
}

export const SERVICES_PREVIEW: ServiceItem[] = [
  {
    id: "website-development",
    title: "Website Development",
    description:
      "Fast, accessible, SEO-engineered marketing sites and interactive 3D web experiences built on modern Next.js architecture.",
    scope: ["Next.js App Router", "Technical SEO", "3D & Motion"],
    iconName: "Globe",
  },
  {
    id: "full-stack-applications",
    title: "Full-Stack Applications",
    description:
      "End-to-end SaaS platforms, client portals, and internal dashboards engineered with clean schemas, auth, and scalable APIs.",
    scope: ["TypeScript", "PostgreSQL", "Role-Based Access"],
    iconName: "Layers",
  },
  {
    id: "android-app-development",
    title: "Android App Development",
    description:
      "Responsive, reliable mobile applications crafted with native-grade performance, offline resilience, and clean UI patterns.",
    scope: ["Kotlin / Compose", "API Sync", "Play Readiness"],
    iconName: "Smartphone",
  },
  {
    id: "ai-solutions",
    title: "AI Solutions",
    description:
      "Practical AI-assisted product features, structured workflows, and custom assistants grounded in real operational data.",
    scope: ["LLM Integration", "Retrieval", "Guardrails"],
    iconName: "Sparkles",
  },
  {
    id: "workflow-automation",
    title: "Workflow Automation",
    description:
      "Automated pipelines connecting forms, notifications, reporting, and business tools to eliminate repetitive manual steps.",
    scope: ["Webhooks", "Scheduled Jobs", "Data Pipelines"],
    iconName: "Workflow",
  },
  {
    id: "academic-project-development",
    title: "Academic Project Development",
    description:
      "Structured software prototypes, engineering implementations, and documentation support tailored for capstone and research builds.",
    scope: ["Clean Architecture", "Documentation", "Walkthroughs"],
    iconName: "GraduationCap",
  },
];

export interface MarketplaceTrackPreview {
  id: string;
  category: string;
  summary: string;
  plannedPhase: string;
}

export const MARKETPLACE_TRACKS_PREVIEW: MarketplaceTrackPreview[] = [
  {
    id: "web-templates",
    category: "Website & SaaS Templates",
    summary:
      "Production-structured Next.js starters, landing systems, and admin dashboard foundations.",
    plannedPhase: "Templates",
  },
  {
    id: "ui-assets",
    category: "UI Kits & Glass Components",
    summary:
      "Accessible React + Tailwind component primitives and design system building blocks.",
    plannedPhase: "UI Kits",
  },
  {
    id: "ai-automation",
    category: "AI & Automation Starters",
    summary:
      "Modular workflow templates, chatbot scaffolds, and full-stack backend starters.",
    plannedPhase: "AI & Automation",
  },
  {
    id: "custom-solutions",
    category: "Custom Solution Studio",
    summary:
      "Interactive multi-step project configurator to scope bespoke builds from scratch or templates.",
    plannedPhase: "Custom Builds",
  },
];

export const STUDIO_PRINCIPLES = [
  {
    label: "01 / Architecture First",
    title: "Engineered, Not Assembled",
    description:
      "Every interface, schema, and 3D scene is designed as a cohesive system with strict TypeScript contracts and maintainable boundaries.",
  },
  {
    label: "02 / Performance Discipline",
    title: "Graceful Progressive 3D",
    description:
      "WebGL enhances the visual experience when supported and steps aside cleanly for static CSS fallbacks, reduced motion, and mobile devices.",
  },
  {
    label: "03 / Honest Craft",
    title: "Zero Inflated Claims",
    description:
      "As an independent early-stage studio, every product status—Live, Preview Available, Under Development, or Coming Soon—is transparently labelled.",
  },
] as const;
