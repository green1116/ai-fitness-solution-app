/**
 * Product P9 — Renewal registry
 */

import { RENEWAL_STATUSES } from "../customer-health/health.constants";
import { getCustomerHealth } from "../customer-health/health.registry";
import type {
  CreateRenewalInput,
  RenewalOpportunity,
  UpdateRenewalStatusInput,
} from "./renewal.types";

const renewals = new Map<string, RenewalOpportunity>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRenewal(renewal: RenewalOpportunity): RenewalOpportunity {
  return { ...renewal, metadata: { ...renewal.metadata } };
}

export function createRenewal(input: CreateRenewalInput): RenewalOpportunity {
  const healthId = input.healthId.trim();
  const renewBy = input.renewBy.trim();
  if (!healthId) throw new Error("renewal.healthId is required");
  if (!renewBy) throw new Error("renewal.renewBy is required");
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error("renewal.amount must be a non-negative number");
  }
  if (!getCustomerHealth(healthId)) {
    throw new Error(`customer health not found: ${healthId}`);
  }

  const id = input.id?.trim() || createId("p9rnw");
  if (renewals.has(id)) {
    throw new Error(`renewal already exists: ${id}`);
  }

  const now = nowIso();
  const status = RENEWAL_STATUSES[0];
  const renewal: RenewalOpportunity = {
    id,
    healthId,
    amount: input.amount,
    status,
    renewBy,
    detail: `status=${status} amount=${input.amount}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  renewals.set(id, renewal);
  return cloneRenewal(renewal);
}

export function updateRenewalStatus(
  input: UpdateRenewalStatusInput,
): RenewalOpportunity {
  const renewalId = input.renewalId.trim();
  if (!renewalId) throw new Error("renewal.renewalId is required");
  if (!(RENEWAL_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid renewal status: ${input.status}`);
  }
  const existing = renewals.get(renewalId);
  if (!existing) throw new Error(`renewal not found: ${renewalId}`);

  const updated: RenewalOpportunity = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} amount=${existing.amount}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  renewals.set(renewalId, updated);
  return cloneRenewal(updated);
}

export function getRenewal(id: string): RenewalOpportunity | undefined {
  const renewal = renewals.get(id.trim());
  return renewal ? cloneRenewal(renewal) : undefined;
}

export function listRenewals(filter?: {
  healthId?: string;
}): RenewalOpportunity[] {
  let result = [...renewals.values()];
  if (filter?.healthId) {
    const hid = filter.healthId.trim();
    result = result.filter((r) => r.healthId === hid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRenewal);
}

export function clearRenewals(): void {
  renewals.clear();
}
