import { PRODUCT_CATEGORIES } from "./categories";
import { PRODUCTS_CATALOGUE } from "./products";
import type {
  MarketplaceFilterParams,
  ProductCategory,
  ProductCategoryWithCount,
  ProductRecord,
  ProductSortOption,
} from "./types";

const categoryBySlugMap = new Map<string, ProductCategory>(
  PRODUCT_CATEGORIES.map((category) => [category.slug, category]),
);

export function getAllCategories(): ProductCategory[] {
  return [...PRODUCT_CATEGORIES].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getCategoryBySlug(slug: string): ProductCategory | null {
  return categoryBySlugMap.get(slug) ?? null;
}

export function getAllCategoriesWithCounts(): ProductCategoryWithCount[] {
  const counts = new Map<string, number>();
  for (const product of PRODUCTS_CATALOGUE) {
    counts.set(product.categorySlug, (counts.get(product.categorySlug) ?? 0) + 1);
  }

  return getAllCategories().map((category) => ({
    ...category,
    productCount: counts.get(category.slug) ?? 0,
  }));
}

export function getAllProducts(): ProductRecord[] {
  return [...PRODUCTS_CATALOGUE];
}

export function getFeaturedProducts(): ProductRecord[] {
  return PRODUCTS_CATALOGUE.filter((product) => product.featured);
}

export function getLatestProducts(limit = 4): ProductRecord[] {
  return sortProducts(PRODUCTS_CATALOGUE, "latest").slice(0, limit);
}

export function getProductBySlug(slug: string): ProductRecord | null {
  return PRODUCTS_CATALOGUE.find((product) => product.slug === slug) ?? null;
}

export function getRelatedProducts(
  product: ProductRecord,
  limit = 3,
): ProductRecord[] {
  const candidates = PRODUCTS_CATALOGUE.filter((item) => item.id !== product.id);
  const techSet = new Set(product.technologies.map((tech) => tech.toLowerCase()));

  const scored = candidates.map((candidate) => {
    let score = 0;
    if (candidate.categorySlug === product.categorySlug) {
      score += 10;
    }
    for (const tech of candidate.technologies) {
      if (techSet.has(tech.toLowerCase())) {
        score += 2;
      }
    }
    if (candidate.status === "Available") {
      score += 1;
    }
    return { candidate, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return Date.parse(b.candidate.createdAt) - Date.parse(a.candidate.createdAt);
  });

  return scored.slice(0, limit).map((entry) => entry.candidate);
}

export function sortProducts(
  products: readonly ProductRecord[],
  sort: ProductSortOption = "latest",
): ProductRecord[] {
  const copy = [...products];
  switch (sort) {
    case "oldest":
      return copy.sort(
        (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
      );
    case "alphabetical":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "latest":
    default:
      return copy.sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );
  }
}

export function queryProducts(params: MarketplaceFilterParams = {}): ProductRecord[] {
  const normalizedQuery = params.query?.trim().toLowerCase() ?? "";
  const categoryFilter =
    params.category && params.category !== "all" ? params.category : null;
  const availabilityFilter =
    params.availability && params.availability !== "all"
      ? params.availability
      : null;
  const featuredOnly = Boolean(params.featuredOnly);
  const sort: ProductSortOption = params.sort ?? "latest";

  const filtered = PRODUCTS_CATALOGUE.filter((product) => {
    if (categoryFilter && product.categorySlug !== categoryFilter) {
      return false;
    }
    if (availabilityFilter && product.status !== availabilityFilter) {
      return false;
    }
    if (featuredOnly && !product.featured) {
      return false;
    }
    if (normalizedQuery) {
      const categoryName =
        categoryBySlugMap.get(product.categorySlug)?.name.toLowerCase() ?? "";
      const haystack = [
        product.name,
        product.shortDescription,
        product.fullDescription,
        product.productType,
        categoryName,
        ...product.technologies,
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });

  return sortProducts(filtered, sort);
}
