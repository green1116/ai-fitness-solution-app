/**
 * FEAT-35 — Support Case
 * In-memory support case domain built on Registry→Engagement stack.
 */
import { existsCustomer } from "./customer-registry";
import { getCustomerProfile } from "./customer-profile";
import { getCustomerLifecycle } from "./customer-lifecycle";
import { getCustomerHealth } from "./customer-health";
import { getCustomerEngagement } from "./customer-engagement";

export const FEAT_35_ID = "FEAT-35" as const;
export const SUPPORT_CASE_CAPABILITY = "SupportCase" as const;

export const SUPPORT_CASE_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

export type SupportCaseStatus = (typeof SUPPORT_CASE_STATUSES)[number];

export const SUPPORT_CASE_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;

export type SupportCasePriority = (typeof SUPPORT_CASE_PRIORITIES)[number];

export type SupportCase = Readonly<{
  caseId: string;
  customerId: string;
  status: SupportCaseStatus;
  priority: SupportCasePriority;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}>;

export type OpenSupportCaseInput = Readonly<{
  caseId?: string;
  customerId: string;
  priority?: SupportCasePriority;
  subject: string;
  description?: string;
}>;

export type UpdateSupportCaseStatusInput = Readonly<{
  caseId: string;
  status: SupportCaseStatus;
}>;

export type ListSupportCaseFilter = Readonly<{
  customerId?: string;
  status?: SupportCaseStatus;
  priority?: SupportCasePriority;
}>;

const cases = new Map<string, SupportCase>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCase(row: SupportCase): SupportCase {
  return { ...row };
}

function requireTrimmed(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`supportCase.${field} is required`);
  return trimmed;
}

function assertStatus(status: string): asserts status is SupportCaseStatus {
  if (!(SUPPORT_CASE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid support case status: ${status}`);
  }
}

function assertPriority(
  priority: string,
): asserts priority is SupportCasePriority {
  if (!(SUPPORT_CASE_PRIORITIES as readonly string[]).includes(priority)) {
    throw new Error(`invalid support case priority: ${priority}`);
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
  return id;
}

/**
 * Open a support case for a fully onboarded customer stack.
 */
export function openSupportCase(input: OpenSupportCaseInput): SupportCase {
  const customerId = requireCustomerStack(input.customerId);
  const subject = requireTrimmed(input.subject, "subject");
  const priority = input.priority ?? "MEDIUM";
  assertPriority(priority);

  const caseId = input.caseId?.trim() || createId("case");
  if (cases.has(caseId)) {
    throw new Error(`support case already exists: ${caseId}`);
  }

  const now = nowIso();
  const row: SupportCase = {
    caseId,
    customerId,
    status: "OPEN",
    priority,
    subject,
    description: (input.description ?? "").trim(),
    createdAt: now,
    updatedAt: now,
    closedAt: null,
  };
  cases.set(caseId, row);
  return cloneCase(row);
}

/**
 * Get a support case by caseId.
 */
export function getSupportCase(caseId: string): SupportCase | undefined {
  const id = caseId.trim();
  if (!id) return undefined;
  const row = cases.get(id);
  return row ? cloneCase(row) : undefined;
}

/**
 * List support cases with optional filters.
 */
export function listSupportCase(
  filter: ListSupportCaseFilter = {},
): SupportCase[] {
  let rows = [...cases.values()];
  if (filter.customerId) {
    const id = filter.customerId.trim();
    rows = rows.filter((c) => c.customerId === id);
  }
  if (filter.status) {
    assertStatus(filter.status);
    rows = rows.filter((c) => c.status === filter.status);
  }
  if (filter.priority) {
    assertPriority(filter.priority);
    rows = rows.filter((c) => c.priority === filter.priority);
  }
  return rows
    .slice()
    .sort((a, b) => a.caseId.localeCompare(b.caseId))
    .map(cloneCase);
}

/**
 * Update support case status (not for terminal CLOSED — use closeSupportCase).
 */
export function updateSupportCaseStatus(
  input: UpdateSupportCaseStatusInput,
): SupportCase {
  const caseId = requireTrimmed(input.caseId, "caseId");
  assertStatus(input.status);
  if (input.status === "CLOSED") {
    throw new Error("use closeSupportCase to close a support case");
  }

  const existing = cases.get(caseId);
  if (!existing) throw new Error(`support case not found: ${caseId}`);
  if (existing.status === "CLOSED") {
    throw new Error(`support case already closed: ${caseId}`);
  }

  const updated: SupportCase = {
    ...existing,
    status: input.status,
    updatedAt: nowIso(),
    closedAt: null,
  };
  cases.set(caseId, updated);
  return cloneCase(updated);
}

/**
 * Close a support case.
 */
export function closeSupportCase(caseId: string): SupportCase {
  const id = requireTrimmed(caseId, "caseId");
  const existing = cases.get(id);
  if (!existing) throw new Error(`support case not found: ${id}`);
  if (existing.status === "CLOSED") {
    throw new Error(`support case already closed: ${id}`);
  }

  const now = nowIso();
  const updated: SupportCase = {
    ...existing,
    status: "CLOSED",
    updatedAt: now,
    closedAt: now,
  };
  cases.set(id, updated);
  return cloneCase(updated);
}

/** Test helper — clears in-memory support cases. */
export function clearSupportCases(): void {
  cases.clear();
}
