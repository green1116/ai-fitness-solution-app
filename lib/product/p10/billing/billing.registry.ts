/**
 * Product P10 — Billing registry
 */

import { BILLING_STATUSES } from "../subscription/subscription.constants";
import { getPricing } from "../pricing/pricing.registry";
import { getSubscription } from "../subscription/subscription.registry";
import type {
  BillingCycleRecord,
  OpenBillingInput,
  UpdateBillingStatusInput,
} from "./billing.types";

const billingRecords = new Map<string, BillingCycleRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBilling(billing: BillingCycleRecord): BillingCycleRecord {
  return { ...billing, metadata: { ...billing.metadata } };
}

export function openBilling(input: OpenBillingInput): BillingCycleRecord {
  const subscriptionId = input.subscriptionId.trim();
  const pricingId = input.pricingId.trim();
  const periodStart = input.periodStart.trim();
  const periodEnd = input.periodEnd.trim();
  if (!subscriptionId) throw new Error("billing.subscriptionId is required");
  if (!pricingId) throw new Error("billing.pricingId is required");
  if (!periodStart) throw new Error("billing.periodStart is required");
  if (!periodEnd) throw new Error("billing.periodEnd is required");
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error("billing.amount must be a non-negative number");
  }
  if (!getSubscription(subscriptionId)) {
    throw new Error(`subscription not found: ${subscriptionId}`);
  }
  if (!getPricing(pricingId)) {
    throw new Error(`pricing not found: ${pricingId}`);
  }

  const id = input.id?.trim() || createId("p10bil");
  if (billingRecords.has(id)) {
    throw new Error(`billing already exists: ${id}`);
  }

  const status = BILLING_STATUSES[1];
  const billing: BillingCycleRecord = {
    id,
    subscriptionId,
    pricingId,
    periodStart,
    periodEnd,
    amount: input.amount,
    status,
    detail: `status=${status} amount=${input.amount}`,
    metadata: { ...(input.metadata ?? {}) },
    openedAt: nowIso(),
  };
  billingRecords.set(id, billing);
  return cloneBilling(billing);
}

export function updateBillingStatus(
  input: UpdateBillingStatusInput,
): BillingCycleRecord {
  const billingId = input.billingId.trim();
  if (!billingId) throw new Error("billing.billingId is required");
  if (!(BILLING_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid billing status: ${input.status}`);
  }
  const existing = billingRecords.get(billingId);
  if (!existing) throw new Error(`billing not found: ${billingId}`);

  const updated: BillingCycleRecord = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} amount=${existing.amount}`,
    metadata: { ...existing.metadata },
    settledAt:
      input.status === "SETTLED" ? nowIso() : existing.settledAt,
  };
  billingRecords.set(billingId, updated);
  return cloneBilling(updated);
}

export function getBilling(id: string): BillingCycleRecord | undefined {
  const billing = billingRecords.get(id.trim());
  return billing ? cloneBilling(billing) : undefined;
}

export function listBilling(filter?: {
  subscriptionId?: string;
}): BillingCycleRecord[] {
  let result = [...billingRecords.values()];
  if (filter?.subscriptionId) {
    const sid = filter.subscriptionId.trim();
    result = result.filter((b) => b.subscriptionId === sid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneBilling);
}

export function clearBilling(): void {
  billingRecords.clear();
}
