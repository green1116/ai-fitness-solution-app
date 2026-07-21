/**
 * E12-P1 — Product Identity Model
 */

import {
  E12_PRODUCT_BASE,
  E12_PRODUCT_VERSION,
  PRODUCT_STATUSES,
} from "../core/product.constants";
import type {
  ProductIdentity,
  ProductStatus,
  RegisterProductIdentityInput,
} from "../types/product.types";

const identities = new Map<string, ProductIdentity>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIdentity(identity: ProductIdentity): ProductIdentity {
  return { ...identity, metadata: { ...identity.metadata } };
}

export function registerProductIdentity(
  input: RegisterProductIdentityInput,
): ProductIdentity {
  const name = input.name.trim();
  const sku = input.sku.trim();
  if (!name) throw new Error("product.name is required");
  if (!sku) throw new Error("product.sku is required");

  const status = input.status ?? "ACTIVE";
  if (!(PRODUCT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid product status: ${status}`);
  }

  const id = input.id?.trim() || createId("prod");
  if (identities.has(id)) {
    throw new Error(`product identity already exists: ${id}`);
  }

  for (const existing of identities.values()) {
    if (existing.sku === sku) {
      throw new Error(`product sku already registered: ${sku}`);
    }
  }

  const identity: ProductIdentity = {
    id,
    name,
    sku,
    status,
    version: (input.version ?? E12_PRODUCT_VERSION).trim(),
    platformBaseline: input.platformBaseline?.trim() || E12_PRODUCT_BASE,
    description: input.description?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  identities.set(id, identity);
  return cloneIdentity(identity);
}

export function getProductIdentity(id: string): ProductIdentity | undefined {
  const identity = identities.get(id.trim());
  return identity ? cloneIdentity(identity) : undefined;
}

export function getProductIdentityBySku(
  sku: string,
): ProductIdentity | undefined {
  const key = sku.trim();
  for (const identity of identities.values()) {
    if (identity.sku === key) return cloneIdentity(identity);
  }
  return undefined;
}

export function listProductIdentities(filter?: {
  status?: ProductStatus;
}): ProductIdentity[] {
  let result = [...identities.values()];
  if (filter?.status) {
    result = result.filter((i) => i.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneIdentity);
}

export function setProductIdentityStatus(
  id: string,
  status: ProductStatus,
): ProductIdentity {
  const identity = identities.get(id.trim());
  if (!identity) throw new Error(`product identity not found: ${id}`);
  if (!(PRODUCT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid product status: ${status}`);
  }
  identity.status = status;
  identities.set(identity.id, identity);
  return cloneIdentity(identity);
}

export function clearProductIdentities(): void {
  identities.clear();
}
