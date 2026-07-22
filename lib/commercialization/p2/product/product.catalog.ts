/**
 * Commercialization P2 — Product catalog
 */

import { getCommercialProduct } from "./product.registry";
import type {
  CatalogProductInput,
  ProductCatalogEntry,
} from "./product.types";

const catalog = new Map<string, ProductCatalogEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(entry: ProductCatalogEntry): ProductCatalogEntry {
  return { ...entry };
}

export function catalogProduct(
  input: CatalogProductInput,
): ProductCatalogEntry {
  const productId = input.productId.trim();
  const product = getCommercialProduct(productId);
  if (!product) throw new Error(`product not found: ${productId}`);
  if (product.status === "DEPRECATED") {
    throw new Error(`cannot catalog deprecated product: ${productId}`);
  }

  const id = input.id?.trim() || createId("pcat");
  if (catalog.has(id)) {
    throw new Error(`catalog entry already exists: ${id}`);
  }

  const entry: ProductCatalogEntry = {
    id,
    productId,
    title: (input.title ?? product.name).trim() || product.name,
    summary:
      (input.summary ?? `${product.category} · ${product.sku}`).trim() ||
      product.sku,
    featured: input.featured ?? product.status === "ACTIVE",
    rank: Math.max(1, input.rank ?? 100),
    detail: `product=${productId} featured=${input.featured ?? product.status === "ACTIVE"}`,
    catalogedAt: nowIso(),
  };
  catalog.set(id, entry);
  return cloneEntry(entry);
}

export function getProductCatalogEntry(
  id: string,
): ProductCatalogEntry | undefined {
  const entry = catalog.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listProductCatalog(filter?: {
  productId?: string;
  featured?: boolean;
}): ProductCatalogEntry[] {
  let result = [...catalog.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((e) => e.productId === pid);
  }
  if (filter?.featured !== undefined) {
    result = result.filter((e) => e.featured === filter.featured);
  }
  return result
    .slice()
    .sort((a, b) => a.rank - b.rank || a.id.localeCompare(b.id))
    .map(cloneEntry);
}

export function clearProductCatalog(): void {
  catalog.clear();
}
