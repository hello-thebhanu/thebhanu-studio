import type { ProductCategory } from "./types";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: "cat-websites-templates",
    slug: "websites-and-templates",
    name: "Websites & Templates",
    description:
      "Multi-page brand websites, portfolio systems, and production Next.js templates.",
    iconName: "Globe",
    accentTag: "Web Systems",
    displayOrder: 1,
  },
  {
    id: "cat-landing-pages",
    slug: "landing-pages",
    name: "Landing Pages",
    description:
      "High-craft launch pages with interactive 3D canvases, WebGL shaders, and SEO structure.",
    iconName: "LayoutTemplate",
    accentTag: "Conversion",
    displayOrder: 2,
  },
  {
    id: "cat-full-stack",
    slug: "full-stack-applications",
    name: "Full Stack Applications",
    description:
      "End-to-end web applications with database schemas, authentication, and client portals.",
    iconName: "Layers",
    accentTag: "End-to-End",
    displayOrder: 3,
  },
  {
    id: "cat-saas-products",
    slug: "saas-products",
    name: "SaaS Products",
    description:
      "Multi-tenant SaaS starters featuring role-based access, workspaces, and modular billing hooks.",
    iconName: "Sparkles",
    accentTag: "Multi-Tenant",
    displayOrder: 4,
  },
  {
    id: "cat-android-apps",
    slug: "android-applications",
    name: "Android Applications",
    description:
      "Kotlin and Jetpack Compose mobile applications engineered for clarity and offline resilience.",
    iconName: "Smartphone",
    accentTag: "Mobile",
    displayOrder: 5,
  },
  {
    id: "cat-ui-kits",
    slug: "ui-kits-and-components",
    name: "UI Kits & Components",
    description:
      "Reusable accessible React, Tailwind CSS, and nature-tech glassmorphism interface primitives.",
    iconName: "Component",
    accentTag: "Design System",
    displayOrder: 6,
  },
  {
    id: "cat-admin-dashboards",
    slug: "admin-dashboards",
    name: "Admin Dashboards",
    description:
      "Operational consoles, content management workspaces, and analytics-ready control panels.",
    iconName: "BarChart3",
    accentTag: "Operations",
    displayOrder: 7,
  },
  {
    id: "cat-ai-tools",
    slug: "ai-tools-and-solutions",
    name: "AI Tools & Solutions",
    description:
      "Structured LLM workflows, document retrieval assistants, and grounded AI interfaces.",
    iconName: "Bot",
    accentTag: "Applied AI",
    displayOrder: 8,
  },
  {
    id: "cat-automation",
    slug: "automation-systems",
    name: "Automation Systems",
    description:
      "Webhook pipelines, scheduled data jobs, and enquiry routing workflows that reduce manual work.",
    iconName: "Workflow",
    accentTag: "Pipelines",
    displayOrder: 9,
  },
  {
    id: "cat-developer-resources",
    slug: "developer-resources",
    name: "Developer Resources",
    description:
      "Clean starter boilerplates, TypeScript utilities, and architectural documentation kits.",
    iconName: "Code2",
    accentTag: "Tooling",
    displayOrder: 10,
  },
];
