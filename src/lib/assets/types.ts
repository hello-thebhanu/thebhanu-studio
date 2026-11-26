export type AssetAvailability =
  | "Available"
  | "Coming Soon"
  | "Under Development"
  | "Unavailable";

export type AssetType =
  | "UI Component"
  | "UI Kit"
  | "Design Token"
  | "Motion Primitive";

export type AssetPreviewKey =
  | "glass-card"
  | "moss-button"
  | "shimmer-skeleton"
  | "status-badges"
  | "floating-nav"
  | "reveal-frame";

export interface AssetCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  displayOrder: number;
}

export interface AssetCategoryWithCount extends AssetCategory {
  assetCount: number;
}

export interface UiAssetRecord {
  id: string;
  slug: string;
  name: string;
  summary: string;
  usageInstructions: string;
  categorySlug: string;
  categoryId?: string;
  assetType: AssetType;
  previewKey: AssetPreviewKey;
  codeSnippet: string;
  codeLanguage: string;
  resourceUrl: string | null;
  dependencies: string[];
  tags: string[];
  status: AssetAvailability;
  published?: boolean;
  featured: boolean;
  isDemoRecord: boolean;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
}
