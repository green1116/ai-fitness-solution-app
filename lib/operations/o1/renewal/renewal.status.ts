/**
 * Operations O1 — Renewal status
 */

import { getCustomer } from "../customer/customer.registry";
import { RENEWAL_STATUSES } from "../success/success.constants";
import type {
  RegisterRenewalInput,
  RenewalRecord,
  RenewalStatus,
  UpdateRenewalStatusInput,
} from "./renewal.types";

const renewals = new Map<string, RenewalRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRenewal(renewal: RenewalRecord): RenewalRecord {
  return { ...renewal, metadata: { ...renewal.metadata } };
}

export function registerRenewal(
  input: RegisterRenewalInput,
): RenewalRecord {
  const customerId = input.customerId.trim();
  if (!customerId) throw new Error("renewal.customerId is required");
  if (!getCustomer(customerId)) {
    throw new Error(`customer not found: ${customerId}`);
  }
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    throw new Error("renewal.amount must be a non-negative number");
  }

  const status: RenewalStatus = input.status ?? "UPCOMING";
  if (!(RENEWAL_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid renewal status: ${status}`);
  }

  const termMonths =
    input.termMonths === undefined
      ? 12
      : Math.max(1, Math.round(input.termMonths));
  const id = input.id?.trim() || createId("o1rnw");
  if (renewals.has(id)) {
    throw new Error(`renewal already exists: ${id}`);
  }

  const now = nowIso();
  const amount = Math.round(input.amount);
  const renewal: RenewalRecord = {
    id,
    customerId,
    status,
    amount,
    termMonths,
    detail: `status=${status} amount=${amount} term=${termMonths}m`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  renewals.set(id, renewal);
  return cloneRenewal(renewal);
}

export function updateRenewalStatus(
  input: UpdateRenewalStatusInput,
): RenewalRecord {
  const renewalId = input.renewalId.trim();
  if (!renewalId) throw new Error("renewal.renewalId is required");
  if (!(RENEWAL_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid renewal status: ${input.status}`);
  }

  const current = renewals.get(renewalId);
  if (!current) throw new Error(`renewal not found: ${renewalId}`);

  const note = (input.note ?? "").trim();
  const updated: RenewalRecord = {
    ...current,
    status: input.status,
    detail: note
      ? `status=${input.status} note=${note}`
      : `status=${input.status} amount=${current.amount} term=${current.termMonths}m`,
    updatedAt: nowIso(),
  };
  renewals.set(renewalId, updated);
  return cloneRenewal(updated);
}

export function getRenewal(id: string): RenewalRecord | undefined {
  const renewal = renewals.get(id.trim());
  return renewal ? cloneRenewal(renewal) : undefined;
}

export function listRenewals(filter?: {
  customerId?: string;
  status?: RenewalStatus;
}): RenewalRecord[] {
  let result = [...renewals.values()];
  if (filter?.customerId) {
    const cid = filter.customerId.trim();
    result = result.filter((r) => r.customerId === cid);
  }
  if (filter?.status) result = result.filter((r) => r.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRenewal);
}

export function clearRenewals(): void {
  renewals.clear();
}
