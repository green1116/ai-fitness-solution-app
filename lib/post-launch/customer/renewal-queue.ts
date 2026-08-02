/**
 * FEAT-38 — Renewal Queue
 * In-memory renewal queue built on Registry→Analytics stack.
 */
import { existsCustomer } from "./customer-registry";
import { getCustomerProfile } from "./customer-profile";
import { getCustomerLifecycle } from "./customer-lifecycle";
import { getCustomerHealth } from "./customer-health";
import { getCustomerEngagement } from "./customer-engagement";
import { listSupportCase } from "./support-case";
import { getCustomerSuccessDashboard } from "./customer-success-dashboard";
import { getCustomerAnalytics } from "./customer-analytics";

export const FEAT_38_ID = "FEAT-38" as const;
export const RENEWAL_QUEUE_CAPABILITY = "RenewalQueue" as const;

export const RENEWAL_STATUSES = [
  "OPEN",
  "CONTACTED",
  "NEGOTIATING",
  "RENEWED",
  "LOST",
] as const;

export type RenewalStatus = (typeof RENEWAL_STATUSES)[number];

export type RenewalQueueItem = Readonly<{
  customerId: string;
  renewalStatus: RenewalStatus;
  renewalDate: string;
  value: number;
  updatedAt: string;
}>;

export type AddRenewalInput = Readonly<{
  customerId: string;
  renewalDate: string;
  value: number;
  renewalStatus?: RenewalStatus;
}>;

export type UpdateRenewalStatusInput = Readonly<{
  customerId: string;
  renewalStatus: RenewalStatus;
}>;

export type ListRenewalsFilter = Readonly<{
  renewalStatus?: RenewalStatus;
}>;

const renewals = new Map<string, RenewalQueueItem>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneRenewal(row: RenewalQueueItem): RenewalQueueItem {
  return { ...row };
}

function requireTrimmed(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`renewalQueue.${field} is required`);
  return trimmed;
}

function assertStatus(status: string): asserts status is RenewalStatus {
  if (!(RENEWAL_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid renewal status: ${status}`);
  }
}

function requireCustomerStack(customerId: string): string {
  const id = requireTrimmed(customerId, "customerId");
  if (!existsCustomer(id)) {
    throw new Error(`customer not found in registry: ${id}`);
  }
  if (!getCustomerProfile(id)) {
    throw new Error(`customer profile not found: ${id}`);
  }
  if (!getCustomerLifecycle(id)) {
    throw new Error(`customer lifecycle not found: ${id}`);
  }
  if (!getCustomerHealth(id)) {
    throw new Error(`customer health not found: ${id}`);
  }
  if (!getCustomerEngagement(id)) {
    throw new Error(`customer engagement not found: ${id}`);
  }
  // Reuse SupportCase / Dashboard / Analytics surfaces (read-only).
  void listSupportCase({ customerId: id });
  void getCustomerSuccessDashboard();
  void getCustomerAnalytics();
  return id;
}

/**
 * Add a renewal queue item for a fully onboarded customer stack.
 */
export function addRenewal(input: AddRenewalInput): RenewalQueueItem {
  const customerId = requireCustomerStack(input.customerId);
  const renewalDate = requireTrimmed(input.renewalDate, "renewalDate");
  if (!Number.isFinite(input.value) || input.value < 0) {
    throw new Error(`renewalQueue.value must be >= 0, got ${input.value}`);
  }
  const renewalStatus = input.renewalStatus ?? "OPEN";
  assertStatus(renewalStatus);

  if (renewals.has(customerId)) {
    throw new Error(`renewal already exists for customer: ${customerId}`);
  }

  const row: RenewalQueueItem = {
    customerId,
    renewalStatus,
    renewalDate,
    value: input.value,
    updatedAt: nowIso(),
  };
  renewals.set(customerId, row);
  return cloneRenewal(row);
}

/**
 * Get renewal queue item by customerId.
 */
export function getRenewal(customerId: string): RenewalQueueItem | undefined {
  const id = customerId.trim();
  if (!id) return undefined;
  const row = renewals.get(id);
  return row ? cloneRenewal(row) : undefined;
}

/**
 * List renewals with optional status filter.
 */
export function listRenewals(
  filter: ListRenewalsFilter = {},
): RenewalQueueItem[] {
  let rows = [...renewals.values()];
  if (filter.renewalStatus) {
    assertStatus(filter.renewalStatus);
    rows = rows.filter((r) => r.renewalStatus === filter.renewalStatus);
  }
  return rows
    .slice()
    .sort((a, b) => a.customerId.localeCompare(b.customerId))
    .map(cloneRenewal);
}

/**
 * Update renewal status for an existing queue item.
 */
export function updateRenewalStatus(
  input: UpdateRenewalStatusInput,
): RenewalQueueItem {
  const customerId = requireTrimmed(input.customerId, "customerId");
  assertStatus(input.renewalStatus);
  const existing = renewals.get(customerId);
  if (!existing) {
    throw new Error(`renewal not found for customer: ${customerId}`);
  }

  const updated: RenewalQueueItem = {
    ...existing,
    renewalStatus: input.renewalStatus,
    updatedAt: nowIso(),
  };
  renewals.set(customerId, updated);
  return cloneRenewal(updated);
}

/** Test helper — clears in-memory renewals. */
export function clearRenewals(): void {
  renewals.clear();
}
