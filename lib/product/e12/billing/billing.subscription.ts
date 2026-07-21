/**
 * E12-P4 — Subscription Lifecycle
 * Integrates tenant subscription, entitlement, and pricing plan
 */

import { listEntitlements } from "../tenant/tenant.entitlement";
import {
  getSubscription,
  setSubscriptionStatus,
} from "../tenant/tenant.subscription";
import { getProductTenant } from "../tenant/tenant.product";
import {
  BILLING_LIFECYCLE_EVENTS,
  BILLING_SUBSCRIPTION_STATUSES,
} from "./billing.constants";
import { getPricingPlan } from "./billing.plan";
import type {
  BillingLifecycleEvent,
  BillingLifecycleRecord,
  BillingSubscription,
  BillingSubscriptionStatus,
  CreateBillingSubscriptionInput,
} from "./billing.types";

const billingSubscriptions = new Map<string, BillingSubscription>();
const lifecycleRecords = new Map<string, BillingLifecycleRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSub(sub: BillingSubscription): BillingSubscription {
  return { ...sub, metadata: { ...sub.metadata } };
}

function periodEnd(start: Date, cycle: "MONTHLY" | "ANNUAL"): string {
  const end = new Date(start);
  if (cycle === "ANNUAL") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end.toISOString();
}

function recordLifecycle(input: {
  billingSubscriptionId: string;
  event: BillingLifecycleEvent;
  fromStatus?: BillingSubscriptionStatus;
  toStatus: BillingSubscriptionStatus;
  detail: string;
}): BillingLifecycleRecord {
  const id = createId("blc");
  const record: BillingLifecycleRecord = {
    id,
    billingSubscriptionId: input.billingSubscriptionId,
    event: input.event,
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    detail: input.detail,
    recordedAt: nowIso(),
  };
  lifecycleRecords.set(id, record);
  return { ...record };
}

export function createBillingSubscription(
  input: CreateBillingSubscriptionInput,
): BillingSubscription {
  const productTenantId = input.productTenantId.trim();
  const tenantSubscriptionId = input.tenantSubscriptionId.trim();
  const pricingPlanId = input.pricingPlanId.trim();

  const tenant = getProductTenant(productTenantId);
  if (!tenant) throw new Error(`product tenant not found: ${productTenantId}`);

  const tenantSub = getSubscription(tenantSubscriptionId);
  if (!tenantSub || tenantSub.productTenantId !== productTenantId) {
    throw new Error(
      `tenant subscription not found: ${tenantSubscriptionId}`,
    );
  }

  const plan = getPricingPlan(pricingPlanId);
  if (!plan || plan.productId !== tenant.productId) {
    throw new Error(`pricing plan not found: ${pricingPlanId}`);
  }
  if (plan.editionId !== tenantSub.editionId) {
    throw new Error(
      `plan edition mismatch: plan=${plan.editionId} sub=${tenantSub.editionId}`,
    );
  }

  const id = input.id?.trim() || createId("bsub");
  if (billingSubscriptions.has(id)) {
    throw new Error(`billing subscription already exists: ${id}`);
  }

  const start = new Date();
  const sub: BillingSubscription = {
    id,
    productTenantId,
    tenantSubscriptionId,
    pricingPlanId,
    productId: tenant.productId,
    editionId: tenantSub.editionId,
    status: "DRAFT",
    billingCycle: plan.billingCycle,
    currentPeriodStart: start.toISOString(),
    currentPeriodEnd: periodEnd(start, plan.billingCycle),
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  billingSubscriptions.set(id, sub);

  recordLifecycle({
    billingSubscriptionId: id,
    event: "CREATED",
    toStatus: "DRAFT",
    detail: "billing subscription created",
  });

  return cloneSub(sub);
}

export function activateBillingSubscription(
  id: string,
): BillingSubscription {
  const sub = billingSubscriptions.get(id.trim());
  if (!sub) throw new Error(`billing subscription not found: ${id}`);
  if (sub.status !== "DRAFT") {
    throw new Error(`activate requires DRAFT (current=${sub.status})`);
  }

  const entitlements = listEntitlements({
    productTenantId: sub.productTenantId,
    status: "GRANTED",
  });
  if (entitlements.length === 0) {
    throw new Error("no entitlements granted for tenant");
  }

  const fromStatus = sub.status;
  sub.status = "ACTIVE";
  billingSubscriptions.set(sub.id, sub);
  setSubscriptionStatus(sub.tenantSubscriptionId, "ACTIVE");

  recordLifecycle({
    billingSubscriptionId: sub.id,
    event: "ACTIVATED",
    fromStatus,
    toStatus: "ACTIVE",
    detail: "billing subscription activated",
  });

  return cloneSub(sub);
}

export function renewBillingSubscription(id: string): BillingSubscription {
  const sub = billingSubscriptions.get(id.trim());
  if (!sub) throw new Error(`billing subscription not found: ${id}`);
  if (sub.status !== "ACTIVE" && sub.status !== "PAST_DUE") {
    throw new Error(`renew requires ACTIVE or PAST_DUE (current=${sub.status})`);
  }

  const fromStatus = sub.status;
  const start = new Date(sub.currentPeriodEnd);
  sub.currentPeriodStart = start.toISOString();
  sub.currentPeriodEnd = periodEnd(start, sub.billingCycle);
  sub.status = "ACTIVE";
  billingSubscriptions.set(sub.id, sub);

  recordLifecycle({
    billingSubscriptionId: sub.id,
    event: "RENEWED",
    fromStatus,
    toStatus: "ACTIVE",
    detail: "billing period renewed",
  });

  return cloneSub(sub);
}

export function cancelBillingSubscription(id: string): BillingSubscription {
  const sub = billingSubscriptions.get(id.trim());
  if (!sub) throw new Error(`billing subscription not found: ${id}`);
  if (sub.status === "CANCELLED" || sub.status === "EXPIRED") {
    throw new Error(`already terminal: ${sub.status}`);
  }

  const fromStatus = sub.status;
  sub.status = "CANCELLED";
  billingSubscriptions.set(sub.id, sub);
  setSubscriptionStatus(sub.tenantSubscriptionId, "CANCELLED");

  recordLifecycle({
    billingSubscriptionId: sub.id,
    event: "CANCELLED",
    fromStatus,
    toStatus: "CANCELLED",
    detail: "billing subscription cancelled",
  });

  return cloneSub(sub);
}

export function getBillingSubscription(
  id: string,
): BillingSubscription | undefined {
  const sub = billingSubscriptions.get(id.trim());
  return sub ? cloneSub(sub) : undefined;
}

export function listBillingSubscriptions(filter?: {
  productTenantId?: string;
  productId?: string;
  status?: BillingSubscriptionStatus;
}): BillingSubscription[] {
  let result = [...billingSubscriptions.values()];
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((s) => s.productTenantId === tid);
  }
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((s) => s.productId === pid);
  }
  if (filter?.status) result = result.filter((s) => s.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSub);
}

export function listBillingLifecycleRecords(filter?: {
  billingSubscriptionId?: string;
  event?: BillingLifecycleEvent;
}): BillingLifecycleRecord[] {
  let result = [...lifecycleRecords.values()];
  if (filter?.billingSubscriptionId) {
    const sid = filter.billingSubscriptionId.trim();
    result = result.filter((r) => r.billingSubscriptionId === sid);
  }
  if (filter?.event) result = result.filter((r) => r.event === filter.event);
  return result
    .slice()
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
}

export function clearBillingSubscriptions(): void {
  billingSubscriptions.clear();
  lifecycleRecords.clear();
}
