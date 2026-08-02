/**
 * FEAT-32 — Customer Lifecycle
 * In-memory lifecycle domain built on Customer Registry + Customer Profile.
 */
import { existsCustomer } from "./customer-registry";
import { getCustomerProfile } from "./customer-profile";

export const FEAT_32_ID = "FEAT-32" as const;
export const CUSTOMER_LIFECYCLE_CAPABILITY = "CustomerLifecycle" as const;

export const CUSTOMER_LIFECYCLE_STAGES = [
  "LEAD",
  "ACTIVE",
  "RISK",
  "CHURNED",
  "REACTIVATED",
] as const;

export type CustomerLifecycleStage =
  (typeof CUSTOMER_LIFECYCLE_STAGES)[number];

export const CUSTOMER_LIFECYCLE_STATUSES = ["OPEN", "CLOSED"] as const;

export type CustomerLifecycleStatus =
  (typeof CUSTOMER_LIFECYCLE_STATUSES)[number];

export type CustomerLifecycle = Readonly<{
  customerId: string;
  stage: CustomerLifecycleStage;
  status: CustomerLifecycleStatus;
  startedAt: string;
  endedAt: string | null;
  updatedAt: string;
}>;

export type SetCustomerLifecycleStageInput = Readonly<{
  customerId: string;
  stage: CustomerLifecycleStage;
}>;

export type ListCustomerLifecycleFilter = Readonly<{
  stage?: CustomerLifecycleStage;
  status?: CustomerLifecycleStatus;
}>;

const lifecycles = new Map<string, CustomerLifecycle>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneLifecycle(row: CustomerLifecycle): CustomerLifecycle {
  return { ...row };
}

function requireTrimmed(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`customerLifecycle.${field} is required`);
  return trimmed;
}

function assertStage(
  stage: string,
): asserts stage is CustomerLifecycleStage {
  if (!(CUSTOMER_LIFECYCLE_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid customer lifecycle stage: ${stage}`);
  }
}

function assertStatus(
  status: string,
): asserts status is CustomerLifecycleStatus {
  if (!(CUSTOMER_LIFECYCLE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid customer lifecycle status: ${status}`);
  }
}

function requireRegisteredAndProfiled(customerId: string): string {
  const id = requireTrimmed(customerId, "customerId");
  if (!existsCustomer(id)) {
    throw new Error(`customer not found in registry: ${id}`);
  }
  if (!getCustomerProfile(id)) {
    throw new Error(`customer profile not found: ${id}`);
  }
  return id;
}

function statusForStage(
  stage: CustomerLifecycleStage,
): CustomerLifecycleStatus {
  return stage === "CHURNED" ? "CLOSED" : "OPEN";
}

/**
 * Set lifecycle stage for a registered + profiled customer.
 */
export function setCustomerLifecycleStage(
  input: SetCustomerLifecycleStageInput,
): CustomerLifecycle {
  const customerId = requireRegisteredAndProfiled(input.customerId);
  assertStage(input.stage);

  const now = nowIso();
  const existing = lifecycles.get(customerId);
  const status = statusForStage(input.stage);
  const startedAt = existing?.startedAt ?? now;
  const endedAt = input.stage === "CHURNED" ? now : null;

  const row: CustomerLifecycle = {
    customerId,
    stage: input.stage,
    status,
    startedAt,
    endedAt,
    updatedAt: now,
  };
  lifecycles.set(customerId, row);
  return cloneLifecycle(row);
}

/**
 * Get lifecycle for a customer.
 */
export function getCustomerLifecycle(
  customerId: string,
): CustomerLifecycle | undefined {
  const id = customerId.trim();
  if (!id) return undefined;
  const row = lifecycles.get(id);
  return row ? cloneLifecycle(row) : undefined;
}

/**
 * List lifecycle records with optional stage / status filters.
 */
export function listCustomerLifecycle(
  filter: ListCustomerLifecycleFilter = {},
): CustomerLifecycle[] {
  let rows = [...lifecycles.values()];
  if (filter.stage) {
    assertStage(filter.stage);
    rows = rows.filter((r) => r.stage === filter.stage);
  }
  if (filter.status) {
    assertStatus(filter.status);
    rows = rows.filter((r) => r.status === filter.status);
  }
  return rows
    .slice()
    .sort((a, b) => a.customerId.localeCompare(b.customerId))
    .map(cloneLifecycle);
}

/**
 * Whether the customer is currently at RISK stage.
 */
export function isCustomerAtRisk(customerId: string): boolean {
  const row = getCustomerLifecycle(customerId);
  return row?.stage === "RISK";
}

/** Test helper — clears in-memory lifecycle records. */
export function clearCustomerLifecycles(): void {
  lifecycles.clear();
}
