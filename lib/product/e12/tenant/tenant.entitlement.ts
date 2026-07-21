/**
 * E12-P2 — Feature Entitlement
 * Grants features from edition / package subscription bindings
 */

import { getProductFeature } from "../catalog/product.feature.catalog";
import { getProductEdition } from "../edition/product.edition";
import { getCapabilityPackage } from "../packaging/product.capability.package";
import { getProductTenant } from "./tenant.product";
import { ENTITLEMENT_STATUSES } from "./tenant.constants";
import type {
  FeatureEntitlement,
  GrantEntitlementInput,
  SubscriptionBinding,
} from "./tenant.types";

const entitlements = new Map<string, FeatureEntitlement>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntitlement(ent: FeatureEntitlement): FeatureEntitlement {
  return { ...ent, metadata: { ...ent.metadata } };
}

export function grantEntitlement(
  input: GrantEntitlementInput,
): FeatureEntitlement {
  const productTenantId = input.productTenantId.trim();
  const featureId = input.featureId.trim();
  if (!getProductTenant(productTenantId)) {
    throw new Error(`product tenant not found: ${productTenantId}`);
  }
  if (!getProductFeature(featureId)) {
    throw new Error(`feature not found: ${featureId}`);
  }

  const status = input.status ?? "GRANTED";
  if (!(ENTITLEMENT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid entitlement status: ${status}`);
  }

  const source = input.source ?? "MANUAL";
  const id = input.id?.trim() || createId("ent");
  if (entitlements.has(id)) throw new Error(`entitlement already exists: ${id}`);

  const entitlement: FeatureEntitlement = {
    id,
    productTenantId,
    featureId,
    status,
    source,
    subscriptionId: input.subscriptionId?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    grantedAt: nowIso(),
  };
  entitlements.set(id, entitlement);
  return cloneEntitlement(entitlement);
}

export function getEntitlement(id: string): FeatureEntitlement | undefined {
  const ent = entitlements.get(id.trim());
  return ent ? cloneEntitlement(ent) : undefined;
}

export function listEntitlements(filter?: {
  productTenantId?: string;
  featureId?: string;
  status?: FeatureEntitlement["status"];
}): FeatureEntitlement[] {
  let result = [...entitlements.values()];
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((e) => e.productTenantId === tid);
  }
  if (filter?.featureId) {
    const fid = filter.featureId.trim();
    result = result.filter((e) => e.featureId === fid);
  }
  if (filter?.status) result = result.filter((e) => e.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEntitlement);
}

export function hasFeatureEntitlement(
  productTenantId: string,
  featureId: string,
): boolean {
  return listEntitlements({
    productTenantId,
    featureId,
    status: "GRANTED",
  }).some((e) => e.status === "GRANTED");
}

export function syncEntitlementsFromSubscription(
  binding: SubscriptionBinding,
): FeatureEntitlement[] {
  const edition = getProductEdition(binding.editionId);
  if (!edition) throw new Error(`edition not found: ${binding.editionId}`);

  const featureIds = new Set<string>(edition.featureIds);
  if (binding.packageId) {
    const pkg = getCapabilityPackage(binding.packageId);
    if (pkg) {
      for (const fid of pkg.featureIds) featureIds.add(fid);
    }
  }

  const granted: FeatureEntitlement[] = [];
  for (const featureId of featureIds) {
    const existing = listEntitlements({
      productTenantId: binding.productTenantId,
      featureId,
    });
    if (existing.some((e) => e.status === "GRANTED")) continue;

    granted.push(
      grantEntitlement({
        productTenantId: binding.productTenantId,
        featureId,
        status: "GRANTED",
        source: binding.packageId ? "PACKAGE" : "EDITION",
        subscriptionId: binding.id,
      }),
    );
  }
  return granted;
}

export function clearEntitlements(): void {
  entitlements.clear();
}
