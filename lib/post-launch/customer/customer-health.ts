/**
 * FEAT-33 — Customer Health
 * In-memory health domain built on Registry + Profile + Lifecycle.
 */
import { existsCustomer } from "./customer-registry";
import { getCustomerProfile } from "./customer-profile";
import { getCustomerLifecycle } from "./customer-lifecycle";

export const FEAT_33_ID = "FEAT-33" as const;
export const CUSTOMER_HEALTH_CAPABILITY = "CustomerHealth" as const;

export const CUSTOMER_HEALTH_LEVELS = [
  "GOOD",
  "WARNING",
  "CRITICAL",
] as const;

export type CustomerHealthLevel = (typeof CUSTOMER_HEALTH_LEVELS)[number];

export type CustomerHealth = Readonly<{
  customerId: string;
  score: number;
  level: CustomerHealthLevel;
  updatedAt: string;
}>;

export type SetCustomerHealthInput = Readonly<{
  customerId: string;
  score: number;
  level: CustomerHealthLevel;
}>;

export type ListCustomerHealthFilter = Readonly<{
  level?: CustomerHealthLevel;
}>;

const healthRecords = new Map<string, CustomerHealth>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneHealth(row: CustomerHealth): CustomerHealth {
  return { ...row };
}

function requireTrimmed(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`customerHealth.${field} is required`);
  return trimmed;
}

function assertLevel(level: string): asserts level is CustomerHealthLevel {
  if (!(CUSTOMER_HEALTH_LEVELS as readonly string[]).includes(level)) {
    throw new Error(`invalid customer health level: ${level}`);
  }
}

function requireRegisteredProfiledLifecycle(customerId: string): string {
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
  return id;
}

function assertScore(score: number): void {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error(`customerHealth.score must be 0..100, got ${score}`);
  }
}

/**
 * Set health for a registered + profiled customer with lifecycle.
 */
export function setCustomerHealth(
  input: SetCustomerHealthInput,
): CustomerHealth {
  const customerId = requireRegisteredProfiledLifecycle(input.customerId);
  assertScore(input.score);
  assertLevel(input.level);

  const row: CustomerHealth = {
    customerId,
    score: input.score,
    level: input.level,
    updatedAt: nowIso(),
  };
  healthRecords.set(customerId, row);
  return cloneHealth(row);
}

/**
 * Get health for a customer.
 */
export function getCustomerHealth(
  customerId: string,
): CustomerHealth | undefined {
  const id = customerId.trim();
  if (!id) return undefined;
  const row = healthRecords.get(id);
  return row ? cloneHealth(row) : undefined;
}

/**
 * List health records with optional level filter.
 */
export function listCustomerHealth(
  filter: ListCustomerHealthFilter = {},
): CustomerHealth[] {
  let rows = [...healthRecords.values()];
  if (filter.level) {
    assertLevel(filter.level);
    rows = rows.filter((r) => r.level === filter.level);
  }
  return rows
    .slice()
    .sort((a, b) => a.customerId.localeCompare(b.customerId))
    .map(cloneHealth);
}

/**
 * Whether the customer health level is GOOD.
 */
export function isHealthy(customerId: string): boolean {
  const row = getCustomerHealth(customerId);
  return row?.level === "GOOD";
}

/** Test helper — clears in-memory health records. */
export function clearCustomerHealth(): void {
  healthRecords.clear();
}
