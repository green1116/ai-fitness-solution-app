/**
 * Product Subscription — Entitlement registry
 */

import { getSubscription } from "../subscription/subscription.registry";
import type {
  EntitlementStatus,
  GrantEntitlementInput,
  RevokeEntitlementInput,
  SubscriptionEntitlement,
} from "./entitlement.types";

const entitlements = new Map<string, SubscriptionEntitlement>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntitlement(
  entitlement: SubscriptionEntitlement,
): SubscriptionEntitlement {
  return { ...entitlement, metadata: { ...entitlement.metadata } };
}

export function grantEntitlement(
  input: GrantEntitlementInput,
): SubscriptionEntitlement {
  const subscriptionId = input.subscriptionId.trim();
  const featureKey = input.featureKey.trim();
  if (!subscriptionId) {
    throw new Error("entitlement.subscriptionId is required");
  }
  if (!featureKey) throw new Error("entitlement.featureKey is required");

  const subscription = getSubscription(subscriptionId);
  if (!subscription) {
    throw new Error(`subscription not found: ${subscriptionId}`);
  }
  if (
    subscription.status !== "ACTIVE" &&
    subscription.status !== "TRIAL"
  ) {
    throw new Error(`subscription not entitled: ${subscriptionId}`);
  }

  const duplicate = [...entitlements.values()].find(
    (e) =>
      e.subscriptionId === subscriptionId &&
      e.featureKey === featureKey &&
      e.status === "GRANTED",
  );
  if (duplicate) {
    throw new Error(
      `entitlement already granted: ${subscriptionId}/${featureKey}`,
    );
  }

  const id = input.id?.trim() || createId("subent");
  if (entitlements.has(id)) {
    throw new Error(`entitlement already exists: ${id}`);
  }

  const entitlement: SubscriptionEntitlement = {
    id,
    subscriptionId,
    featureKey,
    status: "GRANTED",
    detail: `feature=${featureKey} status=GRANTED`,
    metadata: { ...(input.metadata ?? {}) },
    grantedAt: nowIso(),
  };
  entitlements.set(id, entitlement);
  return cloneEntitlement(entitlement);
}

export function revokeEntitlement(
  input: RevokeEntitlementInput,
): SubscriptionEntitlement {
  const entitlementId = input.entitlementId.trim();
  if (!entitlementId) {
    throw new Error("entitlement.entitlementId is required");
  }
  const existing = entitlements.get(entitlementId);
  if (!existing) throw new Error(`entitlement not found: ${entitlementId}`);
  if (existing.status === "REVOKED") {
    throw new Error(`entitlement already revoked: ${entitlementId}`);
  }

  const updated: SubscriptionEntitlement = {
    ...existing,
    status: "REVOKED",
    detail: `feature=${existing.featureKey} status=REVOKED`,
    metadata: { ...existing.metadata },
    revokedAt: nowIso(),
  };
  entitlements.set(entitlementId, updated);
  return cloneEntitlement(updated);
}

export function getEntitlement(
  id: string,
): SubscriptionEntitlement | undefined {
  const entitlement = entitlements.get(id.trim());
  return entitlement ? cloneEntitlement(entitlement) : undefined;
}

export function listEntitlements(filter?: {
  subscriptionId?: string;
  status?: EntitlementStatus;
}): SubscriptionEntitlement[] {
  let result = [...entitlements.values()];
  if (filter?.subscriptionId) {
    const subscriptionId = filter.subscriptionId.trim();
    result = result.filter((e) => e.subscriptionId === subscriptionId);
  }
  if (filter?.status) {
    result = result.filter((e) => e.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEntitlement);
}

export function clearEntitlements(): void {
  entitlements.clear();
}
