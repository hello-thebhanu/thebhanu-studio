export type ProductAvailability =
  | "Available"
  | "Coming Soon"
  | "Under Development"
  | "Unavailable";

export type ProductSortOption = "latest" | "oldest" | "alphabetical";

export type CategoryIconName =
  | "Globe"
  | "LayoutTemplate"
  | "Layers"
  | "Sparkles"
  | "Smartphone"
  | "Component"
  | "BarChart3"
  | "Bot"
  | "Workflow"
  | "Code2";

export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: CategoryIconName;
  accentTag: string;
  displayOrder: number;
}

export interface ProductCategoryWithCount extends ProductCategory {
  productCount: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  storagePath?: string | null;
}

export interface ProductRecord {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  categorySlug: string;
  categoryId?: string;
  productType: string;
  thumbnail: ProductImage | null;
  thumbnailStoragePath?: string | null;
  gallery: ProductImage[];
  technologies: string[];
  features: string[];
  status: ProductAvailability;
  published?: boolean;
  featured: boolean;
  isDemoRecord: boolean;
  previewUrl: string | null;
  liveDemoUrl: string | null;
  documentationUrl: string | null;
  createdAt: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
}

export interface MarketplaceFilterParams {
  query?: string;
  category?: string;
  availability?: ProductAvailability | "all";
  featuredOnly?: boolean;
  sort?: ProductSortOption;
}
