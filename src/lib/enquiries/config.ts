import type { ProjectTypeOption } from "./types";

export const PROJECT_TYPES: Array<{
  id: ProjectTypeOption;
  title: ProjectTypeOption;
  subtitle: string;
  suggestedFeatures: string[];
}> = [
  {
    id: "Website Development",
    title: "Website Development",
    subtitle: "High-speed Next.js brand sites, landing pages, SEO & 3D web experiences.",
    suggestedFeatures: [
      "Responsive Dark & Light Theme",
      "Technical SEO & Structured Data",
      "Interactive 3D / Motion Hero",
      "CMS / Admin Content Controls",
      "Contact & Lead Capture Form",
      "Analytics & Performance Tuning",
    ],
  },
  {
    id: "Full-Stack Application",
    title: "Full-Stack Application",
    subtitle: "SaaS platforms, client portals, dashboards, auth & PostgreSQL backends.",
    suggestedFeatures: [
      "User Authentication & Roles",
      "PostgreSQL Database & RLS",
      "Admin Operations Dashboard",
      "File & Media Storage",
      "REST / Server Action APIs",
      "Customer Portal & Notifications",
    ],
  },
  {
    id: "Android Application",
    title: "Android Application",
    subtitle: "Native Kotlin & Jetpack Compose apps with offline sync & Play readiness.",
    suggestedFeatures: [
      "Material 3 Compose UI",
      "Offline-First Room Database",
      "Backend API Synchronization",
      "Push Notifications",
      "Secure Auth & Session Storage",
      "Play Store Release Packaging",
    ],
  },
  {
    id: "AI Solution",
    title: "AI Solution",
    subtitle: "Grounded knowledge assistants, RAG pipelines, classification & AI workflows.",
    suggestedFeatures: [
      "Document / Knowledge Retrieval (RAG)",
      "Citation-Backed Responses",
      "Structured Data Extraction",
      "Prompt & Guardrail Tuning",
      "Admin Evaluation & Logs",
      "API & Webhook Integration",
    ],
  },
  {
    id: "Automation Solution",
    title: "Automation Solution",
    subtitle: "Webhook orchestration, CRM routing, notifications & internal ops pipelines.",
    suggestedFeatures: [
      "Form & Webhook Triggers",
      "Automated Email / Alert Routing",
      "Database / Spreadsheet Sync",
      "Scheduled Reporting Jobs",
      "Retry & Error Logging",
      "Human-in-the-Loop Approvals",
    ],
  },
];

export const TECH_PREFERENCES = [
  "Next.js / React",
  "TypeScript",
  "Tailwind CSS",
  "Three.js / WebGL",
  "Supabase / PostgreSQL",
  "Kotlin / Jetpack Compose",
  "Python / AI Pipelines",
  "No Preference (Recommend Best)",
];

export const BUDGET_RANGES = [
  "Under ₹25,000",
  "₹25,000 – ₹75,000",
  "₹75,000 – ₹2,00,000",
  "₹2,00,000+",
  "Let's discuss scope first",
];

export const TIMELINE_OPTIONS = [
  "2 – 4 Weeks",
  "1 – 2 Months",
  "2 – 3 Months+",
  "Flexible / Exploring",
];
