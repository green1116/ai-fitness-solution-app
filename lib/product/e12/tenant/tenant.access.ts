/**
 * E12-P2 — Capability Access Control
 * Evaluates tenant access to platform capabilities via entitlements
 */

import { ENTERPRISE_CAPABILITY_CATALOG } from "../../../platform/v1/capability.index";
import { getProductFeature } from "../catalog/product.feature.catalog";
import { hasFeatureEntitlement, listEntitlements } from "./tenant.entitlement";
import { getProductTenant } from "./tenant.product";
import { listSubscriptions } from "./tenant.subscription";
import type { CapabilityAccessResult } from "./tenant.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function evaluateCapabilityAccess(input: {
  productTenantId: string;
  capabilityRef: string;
}): CapabilityAccessResult {
  const productTenantId = input.productTenantId.trim();
  const capabilityRef = input.capabilityRef.trim();

  const tenant = getProductTenant(productTenantId);
  if (!tenant) {
    return {
      decision: "DENY",
      productTenantId,
      capabilityRef,
      reason: `product tenant not found: ${productTenantId}`,
      evaluatedAt: nowIso(),
    };
  }

  if (tenant.status !== "ACTIVE") {
    return {
      decision: "DENY",
      productTenantId,
      capabilityRef,
      reason: `tenant not ACTIVE: ${tenant.status}`,
      evaluatedAt: nowIso(),
    };
  }

  const activeSub = listSubscriptions({
    productTenantId,
    status: "ACTIVE",
  }).concat(listSubscriptions({ productTenantId, status: "TRIAL" }));
  if (activeSub.length === 0) {
    return {
      decision: "DENY",
      productTenantId,
      capabilityRef,
      reason: "no active subscription",
      evaluatedAt: nowIso(),
    };
  }

  if (!ENTERPRISE_CAPABILITY_CATALOG.some((c) => c.id === capabilityRef)) {
    return {
      decision: "DENY",
      productTenantId,
      capabilityRef,
      reason: `unknown capability: ${capabilityRef}`,
      evaluatedAt: nowIso(),
    };
  }

  const feature = [...listEntitlements({ productTenantId, status: "GRANTED" })]
    .map((e) => getProductFeature(e.featureId))
    .find((f) => f?.capabilityRef === capabilityRef);

  if (!feature) {
    return {
      decision: "DENY",
      productTenantId,
      capabilityRef,
      reason: "no entitled feature for capability",
      evaluatedAt: nowIso(),
    };
  }

  if (!hasFeatureEntitlement(productTenantId, feature.id)) {
    return {
      decision: "DENY",
      productTenantId,
      capabilityRef,
      featureId: feature.id,
      reason: "entitlement not granted",
      evaluatedAt: nowIso(),
    };
  }

  return {
    decision: "ALLOW",
    productTenantId,
    capabilityRef,
    featureId: feature.id,
    reason: "entitlement granted",
    evaluatedAt: nowIso(),
  };
}

export function listAllowedCapabilities(
  productTenantId: string,
): string[] {
  const refs = new Set<string>();
  for (const ent of listEntitlements({
    productTenantId,
    status: "GRANTED",
  })) {
    const feature = getProductFeature(ent.featureId);
    if (feature?.capabilityRef) refs.add(feature.capabilityRef);
  }
  return [...refs].sort();
}
