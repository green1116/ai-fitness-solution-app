/**
 * FEAT-39 — Expansion Queue
 * In-memory expansion queue built on Registry→RenewalQueue stack.
 */
import { existsCustomer } from "./customer-registry";
import { getCustomerProfile } from "./customer-profile";
import { getCustomerLifecycle } from "./customer-lifecycle";
import { getCustomerHealth } from "./customer-health";
import { getCustomerEngagement } from "./customer-engagement";
import { listSupportCase } from "./support-case";
import { getCustomerSuccessDashboard } from "./customer-success-dashboard";
import { getCustomerAnalytics } from "./customer-analytics";
import { listRenewals } from "./renewal-queue";

export const FEAT_39_ID = "FEAT-39" as const;
export const EXPANSION_QUEUE_CAPABILITY = "ExpansionQueue" as const;

export const EXPANSION_STATUSES = [
  "OPEN",
  "CONTACTED",
  "NEGOTIATING",
  "WON",
  "LOST",
] as const;

export type ExpansionStatus = (typeof EXPANSION_STATUSES)[number];

export type ExpansionQueueItem = Readonly<{
  customerId: string;
  expansionStatus: ExpansionStatus;
  expansionDate: string;
  value: number;
  updatedAt: string;
}>;

export type AddExpansionInput = Readonly<{
  customerId: string;
  expansionDate: string;
  value: number;
  expansionStatus?: ExpansionStatus;
}>;

export type UpdateExpansionStatusInput = Readonly<{
  customerId: string;
  expansionStatus: ExpansionStatus;
}>;

export type ListExpansionsFilter = Readonly<{
  expansionStatus?: ExpansionStatus;
}>;

const expansions = new Map<string, ExpansionQueueItem>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneExpansion(row: ExpansionQueueItem): ExpansionQueueItem {
  return { ...row };
}

function requireTrimmed(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`expansionQueue.${field} is required`);
  return trimmed;
}

function assertStatus(status: string): asserts status is ExpansionStatus {
  if (!(EXPANSION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid expansion status: ${status}`);
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
  // Reuse SupportCase / Dashboard / Analytics / RenewalQueue (read-only).
  void listSupportCase({ customerId: id });
  void getCustomerSuccessDashboard();
  void getCustomerAnalytics();
  void listRenewals();
  return id;
}

/**
 * Add an expansion queue item for a fully onboarded customer stack.
 */
export function addExpansion(input: AddExpansionInput): ExpansionQueueItem {
  const customerId = requireCustomerStack(input.customerId);
  const expansionDate = requireTrimmed(input.expansionDate, "expansionDate");
  if (!Number.isFinite(input.value) || input.value < 0) {
    throw new Error(`expansionQueue.value must be >= 0, got ${input.value}`);
  }
  const expansionStatus = input.expansionStatus ?? "OPEN";
  assertStatus(expansionStatus);

  if (expansions.has(customerId)) {
    throw new Error(`expansion already exists for customer: ${customerId}`);
  }

  const row: ExpansionQueueItem = {
    customerId,
    expansionStatus,
    expansionDate,
    value: input.value,
    updatedAt: nowIso(),
  };
  expansions.set(customerId, row);
  return cloneExpansion(row);
}

/**
 * Get expansion queue item by customerId.
 */
export function getExpansion(
  customerId: string,
): ExpansionQueueItem | undefined {
  const id = customerId.trim();
  if (!id) return undefined;
  const row = expansions.get(id);
  return row ? cloneExpansion(row) : undefined;
}

/**
 * List expansions with optional status filter.
 */
export function listExpansions(
  filter: ListExpansionsFilter = {},
): ExpansionQueueItem[] {
  let rows = [...expansions.values()];
  if (filter.expansionStatus) {
    assertStatus(filter.expansionStatus);
    rows = rows.filter((r) => r.expansionStatus === filter.expansionStatus);
  }
  return rows
    .slice()
    .sort((a, b) => a.customerId.localeCompare(b.customerId))
    .map(cloneExpansion);
}

/**
 * Update expansion status for an existing queue item.
 */
export function updateExpansionStatus(
  input: UpdateExpansionStatusInput,
): ExpansionQueueItem {
  const customerId = requireTrimmed(input.customerId, "customerId");
  assertStatus(input.expansionStatus);
  const existing = expansions.get(customerId);
  if (!existing) {
    throw new Error(`expansion not found for customer: ${customerId}`);
  }

  const updated: ExpansionQueueItem = {
    ...existing,
    expansionStatus: input.expansionStatus,
    updatedAt: nowIso(),
  };
  expansions.set(customerId, updated);
  return cloneExpansion(updated);
}

/** Test helper — clears in-memory expansions. */
export function clearExpansions(): void {
  expansions.clear();
}
