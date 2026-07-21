/**
 * E12-P2 — Subscription Binding
 * Binds product tenant to edition and optional capability package
 */

import { getProductEdition } from "../edition/product.edition";
import { getProductIdentity } from "../identity/product.identity";
import { getCapabilityPackage } from "../packaging/product.capability.package";
import { syncEntitlementsFromSubscription } from "./tenant.entitlement";
import { getProductTenant } from "./tenant.product";
import { SUBSCRIPTION_STATUSES } from "./tenant.constants";
import type {
  BindSubscriptionInput,
  SubscriptionBinding,
  SubscriptionStatus,
} from "./tenant.types";

const subscriptions = new Map<string, SubscriptionBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSubscription(sub: SubscriptionBinding): SubscriptionBinding {
  return { ...sub, metadata: { ...sub.metadata } };
}

export function bindSubscription(
  input: BindSubscriptionInput,
): SubscriptionBinding {
  const productTenantId = input.productTenantId.trim();
  const productId = input.productId.trim();
  const editionId = input.editionId.trim();

  const tenant = getProductTenant(productTenantId);
  if (!tenant) throw new Error(`product tenant not found: ${productTenantId}`);
  if (tenant.productId !== productId) {
    throw new Error(
      `tenant product mismatch: tenant=${tenant.productId} request=${productId}`,
    );
  }
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const edition = getProductEdition(editionId);
  if (!edition || edition.productId !== productId) {
    throw new Error(`edition not found for product: ${editionId}`);
  }

  if (input.packageId) {
    const pkg = getCapabilityPackage(input.packageId.trim());
    if (!pkg || pkg.productId !== productId) {
      throw new Error(`package not found for product: ${input.packageId}`);
    }
  }

  const status = input.status ?? "ACTIVE";
  if (!(SUBSCRIPTION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid subscription status: ${status}`);
  }

  const id = input.id?.trim() || createId("sub");
  if (subscriptions.has(id)) {
    throw new Error(`subscription already exists: ${id}`);
  }

  const binding: SubscriptionBinding = {
    id,
    productTenantId,
    productId,
    editionId,
    packageId: input.packageId?.trim() || undefined,
    status,
    startedAt: nowIso(),
    expiresAt: input.expiresAt?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
  };
  subscriptions.set(id, binding);

  if (status === "ACTIVE" || status === "TRIAL") {
    syncEntitlementsFromSubscription(binding);
  }

  return cloneSubscription(binding);
}

export function getSubscription(id: string): SubscriptionBinding | undefined {
  const sub = subscriptions.get(id.trim());
  return sub ? cloneSubscription(sub) : undefined;
}

export function listSubscriptions(filter?: {
  productTenantId?: string;
  productId?: string;
  status?: SubscriptionStatus;
}): SubscriptionBinding[] {
  let result = [...subscriptions.values()];
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((s) => s.productTenantId === tid);
  }
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((s) => s.productId === pid);
  }
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSubscription);
}

export function setSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
): SubscriptionBinding {
  const sub = subscriptions.get(id.trim());
  if (!sub) throw new Error(`subscription not found: ${id}`);
  if (!(SUBSCRIPTION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid subscription status: ${status}`);
  }
  sub.status = status;
  subscriptions.set(sub.id, sub);

  if (status === "ACTIVE" || status === "TRIAL") {
    syncEntitlementsFromSubscription(sub);
  }

  return cloneSubscription(sub);
}

export function clearSubscriptions(): void {
  subscriptions.clear();
}
