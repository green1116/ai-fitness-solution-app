/**
 * E12-P1 — Product Edition Model
 */

import { PRODUCT_EDITION_KINDS } from "../core/product.constants";
import { getProductIdentity } from "../identity/product.identity";
import { listProductFeatures } from "../catalog/product.feature.catalog";
import type {
  CreateProductEditionInput,
  ProductEdition,
  ProductEditionKind,
} from "../types/product.types";

const editions = new Map<string, ProductEdition>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEdition(edition: ProductEdition): ProductEdition {
  return {
    ...edition,
    featureIds: [...edition.featureIds],
    metadata: { ...edition.metadata },
  };
}

export function createProductEdition(
  input: CreateProductEditionInput,
): ProductEdition {
  const productId = input.productId.trim();
  if (!productId) throw new Error("edition.productId is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const name = input.name.trim();
  if (!name) throw new Error("edition.name is required");

  const kind = input.kind;
  if (!(PRODUCT_EDITION_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid edition kind: ${kind}`);
  }

  const featureIds = [...(input.featureIds ?? [])];
  for (const fid of featureIds) {
    if (!listProductFeatures().some((f) => f.id === fid)) {
      throw new Error(`feature not found: ${fid}`);
    }
  }

  const id = input.id?.trim() || createId("ed");
  if (editions.has(id)) throw new Error(`edition already exists: ${id}`);

  const edition: ProductEdition = {
    id,
    productId,
    kind,
    name,
    featureIds,
    maxTenants: input.maxTenants,
    maxRuntimes: input.maxRuntimes,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  editions.set(id, edition);
  return cloneEdition(edition);
}

export function getProductEdition(id: string): ProductEdition | undefined {
  const edition = editions.get(id.trim());
  return edition ? cloneEdition(edition) : undefined;
}

export function listProductEditions(filter?: {
  productId?: string;
  kind?: ProductEditionKind;
}): ProductEdition[] {
  let result = [...editions.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((e) => e.productId === pid);
  }
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEdition);
}

export function clearProductEditions(): void {
  editions.clear();
}
