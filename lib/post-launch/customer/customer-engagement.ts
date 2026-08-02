/**
 * FEAT-34 — Customer Engagement
 * In-memory engagement domain built on Registry + Profile + Lifecycle + Health.
 */
import { existsCustomer } from "./customer-registry";
import { getCustomerProfile } from "./customer-profile";
import { getCustomerLifecycle } from "./customer-lifecycle";
import { getCustomerHealth } from "./customer-health";

export const FEAT_34_ID = "FEAT-34" as const;
export const CUSTOMER_ENGAGEMENT_CAPABILITY = "CustomerEngagement" as const;

export const CUSTOMER_ENGAGEMENT_TYPES = [
  "EMAIL",
  "CALL",
  "MEETING",
  "MESSAGE",
] as const;

export type CustomerEngagementType =
  (typeof CUSTOMER_ENGAGEMENT_TYPES)[number];

export type CustomerEngagement = Readonly<{
  customerId: string;
  type: CustomerEngagementType;
  occurredAt: string;
  notes: string;
  updatedAt: string;
}>;

export type RecordCustomerEngagementInput = Readonly<{
  customerId: string;
  type: CustomerEngagementType;
  occurredAt?: string;
  notes?: string;
}>;

export type ListCustomerEngagementFilter = Readonly<{
  customerId?: string;
  type?: CustomerEngagementType;
}>;

const engagements: CustomerEngagement[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

function cloneEngagement(row: CustomerEngagement): CustomerEngagement {
  return { ...row };
}

function requireTrimmed(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`customerEngagement.${field} is required`);
  return trimmed;
}

function assertType(type: string): asserts type is CustomerEngagementType {
  if (!(CUSTOMER_ENGAGEMENT_TYPES as readonly string[]).includes(type)) {
    throw new Error(`invalid customer engagement type: ${type}`);
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
  return id;
}

/**
 * Record an engagement for a fully onboarded customer stack.
 */
export function recordCustomerEngagement(
  input: RecordCustomerEngagementInput,
): CustomerEngagement {
  const customerId = requireCustomerStack(input.customerId);
  assertType(input.type);

  const now = nowIso();
  const occurredAt = (input.occurredAt ?? now).trim() || now;
  const row: CustomerEngagement = {
    customerId,
    type: input.type,
    occurredAt,
    notes: (input.notes ?? "").trim(),
    updatedAt: now,
  };
  engagements.push(row);
  return cloneEngagement(row);
}

/**
 * Get the most recent engagement for a customer.
 */
export function getCustomerEngagement(
  customerId: string,
): CustomerEngagement | undefined {
  const id = customerId.trim();
  if (!id) return undefined;
  const rows = engagements
    .filter((e) => e.customerId === id)
    .slice()
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  return rows[0] ? cloneEngagement(rows[0]) : undefined;
}

/**
 * List engagements with optional customerId / type filters.
 */
export function listCustomerEngagement(
  filter: ListCustomerEngagementFilter = {},
): CustomerEngagement[] {
  let rows = [...engagements];
  if (filter.customerId) {
    const id = filter.customerId.trim();
    rows = rows.filter((e) => e.customerId === id);
  }
  if (filter.type) {
    assertType(filter.type);
    rows = rows.filter((e) => e.type === filter.type);
  }
  return rows
    .slice()
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .map(cloneEngagement);
}

/**
 * Whether the customer has an engagement within the recent window (default 7 days).
 */
export function hasRecentEngagement(
  customerId: string,
  withinMs = 7 * 24 * 60 * 60 * 1000,
): boolean {
  const id = customerId.trim();
  if (!id) return false;
  const cutoff = Date.now() - withinMs;
  return engagements.some((e) => {
    if (e.customerId !== id) return false;
    const ts = Date.parse(e.occurredAt);
    return Number.isFinite(ts) && ts >= cutoff;
  });
}

/** Test helper — clears in-memory engagements. */
export function clearCustomerEngagements(): void {
  engagements.length = 0;
}
