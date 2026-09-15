import { Product, ProductCategory } from './types';
import { PRODUCTS, CATEGORIES } from '@/data/products';

export { CATEGORIES };

export interface FilterOptions {
  category?: ProductCategory | 'all';
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  voltage?: string;
  inStockOnly?: boolean;
  minRating?: number;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}

export function getAllProducts(sourceProducts?: Product[]): Product[] {
  return sourceProducts && sourceProducts.length > 0 ? sourceProducts : PRODUCTS;
}

export function getProductBySlug(slug: string, sourceProducts?: Product[]): Product | undefined {
  const list = sourceProducts && sourceProducts.length > 0 ? sourceProducts : PRODUCTS;
  return list.find((p) => p.slug === slug || p.id === slug);
}

export function getProductById(id: string, sourceProducts?: Product[]): Product | undefined {
  const list = sourceProducts && sourceProducts.length > 0 ? sourceProducts : PRODUCTS;
  return list.find((p) => p.id === id);
}

export function getFeaturedProducts(limit = 8, sourceProducts?: Product[]): Product[] {
  const list = sourceProducts && sourceProducts.length > 0 ? sourceProducts : PRODUCTS;
  return list.filter((p) => p.isFeatured).slice(0, limit);
}

export function getBestSellers(limit = 8, sourceProducts?: Product[]): Product[] {
  const list = sourceProducts && sourceProducts.length > 0 ? sourceProducts : PRODUCTS;
  return list.filter((p) => p.isBestSeller).slice(0, limit);
}

export function getNewArrivals(limit = 8, sourceProducts?: Product[]): Product[] {
  const list = sourceProducts && sourceProducts.length > 0 ? sourceProducts : PRODUCTS;
  return list.filter((p) => p.isNewArrival).slice(0, limit);
}

export function getProductsByCategory(category: ProductCategory, limit?: number, sourceProducts?: Product[]): Product[] {
  const list = sourceProducts && sourceProducts.length > 0 ? sourceProducts : PRODUCTS;
  const filtered = list.filter((p) => p.category === category);
  return limit ? filtered.slice(0, limit) : filtered;
}

export function getRelatedProducts(currentId: string, category: ProductCategory, limit = 4, sourceProducts?: Product[]): Product[] {
  const list = sourceProducts && sourceProducts.length > 0 ? sourceProducts : PRODUCTS;
  return list
    .filter((p) => p.id !== currentId && p.category === category)
    .slice(0, limit);
}

export function getFrequentlyBoughtTogether(currentId: string, sourceProducts?: Product[]): Product[] {
  const list = sourceProducts && sourceProducts.length > 0 ? sourceProducts : PRODUCTS;
  const current = getProductById(currentId, list);
  if (!current) return list.slice(0, 2);

  return list.filter((p) => p.id !== currentId).slice(0, 2);
}

export function searchProducts(query: string, sourceProducts?: Product[]): Product[] {
  if (!query.trim()) return [];
  const list = sourceProducts && sourceProducts.length > 0 ? sourceProducts : PRODUCTS;
  const q = query.toLowerCase().trim();
  return list.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
      (p.specs && Object.values(p.specs).some((val) => typeof val === 'string' && val.toLowerCase().includes(q)))
  );
}

export function filterProducts(options: FilterOptions, sourceProducts?: Product[]): Product[] {
  let result = sourceProducts && sourceProducts.length > 0 ? [...sourceProducts] : [...PRODUCTS];

  // Category filter
  if (options.category && options.category !== 'all') {
    result = result.filter((p) => p.category === options.category);
  }

  // Search filter
  if (options.searchQuery && options.searchQuery.trim()) {
    const q = options.searchQuery.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Price range
  if (typeof options.minPrice === 'number') {
    result = result.filter((p) => p.price >= options.minPrice!);
  }
  if (typeof options.maxPrice === 'number') {
    result = result.filter((p) => p.price <= options.maxPrice!);
  }

  // Voltage
  if (options.voltage && options.voltage !== 'all') {
    result = result.filter((p) => p.voltageLogic === options.voltage || p.voltageLogic === 'Multi-Voltage');
  }

  // In Stock Only
  if (options.inStockOnly) {
    result = result.filter((p) => p.inStock && (p.stockCount ?? p.stock ?? 0) > 0);
  }

  // Minimum Rating
  if (options.minRating && options.minRating > 0) {
    result = result.filter((p) => p.rating >= options.minRating!);
  }

  // Sort
  if (options.sortBy) {
    switch (options.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }
  }

  return result;
}
