/**
 * Commercialization P2 — Product registry
 */

import { PRODUCT_STATUSES } from "../tier/tier.constants";
import type {
  CommercialProduct,
  ProductStatus,
  RegisterProductInput,
} from "./product.types";

const products = new Map<string, CommercialProduct>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProduct(product: CommercialProduct): CommercialProduct {
  return {
    ...product,
    featureIds: [...product.featureIds],
    metadata: { ...product.metadata },
  };
}

export function registerProduct(
  input: RegisterProductInput,
): CommercialProduct {
  const name = input.name.trim();
  const sku = input.sku.trim().toUpperCase();
  if (!name) throw new Error("product.name is required");
  if (!sku) throw new Error("product.sku is required");

  const status: ProductStatus = input.status ?? "DRAFT";
  if (!(PRODUCT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid product status: ${status}`);
  }

  const id = input.id?.trim() || createId("prod");
  if (products.has(id)) {
    throw new Error(`product already exists: ${id}`);
  }

  const featureIds = (input.featureIds ?? [])
    .map((f) => f.trim())
    .filter(Boolean);

  const now = nowIso();
  const product: CommercialProduct = {
    id,
    name,
    sku,
    status,
    category: (input.category ?? "GENERAL").trim() || "GENERAL",
    featureIds,
    detail: `status=${status} sku=${sku} features=${featureIds.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  products.set(id, product);
  return cloneProduct(product);
}

export function activateProduct(id: string): CommercialProduct {
  const product = products.get(id.trim());
  if (!product) throw new Error(`product not found: ${id}`);
  product.status = "ACTIVE";
  product.updatedAt = nowIso();
  product.detail = `status=ACTIVE sku=${product.sku} features=${product.featureIds.length}`;
  products.set(product.id, product);
  return cloneProduct(product);
}

export function getCommercialProduct(
  id: string,
): CommercialProduct | undefined {
  const product = products.get(id.trim());
  return product ? cloneProduct(product) : undefined;
}

export function listCommercialProducts(filter?: {
  status?: ProductStatus;
  category?: string;
}): CommercialProduct[] {
  let result = [...products.values()];
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  if (filter?.category) {
    const cat = filter.category.trim();
    result = result.filter((p) => p.category === cat);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProduct);
}

export function clearCommercialProducts(): void {
  products.clear();
}
