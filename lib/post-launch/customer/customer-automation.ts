/**
 * FEAT-45 — Customer Automation
 * In-memory automation rules built on Insights → OptimizationDashboard.
 */
import { existsCustomer } from "./customer-registry";
import { getCustomerInsights } from "./customer-insights";
import { getRetentionInsights } from "./retention-insights";
import { getExpansionInsights } from "./expansion-insights";
import { getOptimizationDashboard } from "./optimization-dashboard";

export const FEAT_45_ID = "FEAT-45" as const;
export const CUSTOMER_AUTOMATION_CAPABILITY = "CustomerAutomation" as const;

export const CUSTOMER_AUTOMATION_TRIGGERS = [
  "AT_RISK",
  "RENEWAL_DUE",
  "EXPANSION_READY",
] as const;

export type CustomerAutomationTrigger =
  (typeof CUSTOMER_AUTOMATION_TRIGGERS)[number];

export const CUSTOMER_AUTOMATION_ACTIONS = [
  "CREATE_TASK",
  "SEND_NOTIFICATION",
  "START_WORKFLOW",
] as const;

export type CustomerAutomationAction =
  (typeof CUSTOMER_AUTOMATION_ACTIONS)[number];

export type CustomerAutomation = Readonly<{
  automationId: string;
  customerId: string;
  trigger: CustomerAutomationTrigger;
  action: CustomerAutomationAction;
  enabled: boolean;
  updatedAt: string;
}>;

export type CreateCustomerAutomationInput = Readonly<{
  automationId?: string;
  customerId: string;
  trigger: CustomerAutomationTrigger;
  action: CustomerAutomationAction;
  enabled?: boolean;
}>;

export type ListCustomerAutomationFilter = Readonly<{
  customerId?: string;
  trigger?: CustomerAutomationTrigger;
  action?: CustomerAutomationAction;
  enabled?: boolean;
}>;

const automations = new Map<string, CustomerAutomation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAutomation(row: CustomerAutomation): CustomerAutomation {
  return { ...row };
}

function requireTrimmed(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`customerAutomation.${field} is required`);
  return trimmed;
}

function assertTrigger(
  trigger: string,
): asserts trigger is CustomerAutomationTrigger {
  if (!(CUSTOMER_AUTOMATION_TRIGGERS as readonly string[]).includes(trigger)) {
    throw new Error(`invalid automation trigger: ${trigger}`);
  }
}

function assertAction(
  action: string,
): asserts action is CustomerAutomationAction {
  if (!(CUSTOMER_AUTOMATION_ACTIONS as readonly string[]).includes(action)) {
    throw new Error(`invalid automation action: ${action}`);
  }
}

function touchInsightsStack(): void {
  void getCustomerInsights().totalCustomers;
  void getRetentionInsights().retentionRate;
  void getExpansionInsights().expansionRate;
  void getOptimizationDashboard().optimizationScore;
}

function requireCustomerForAutomation(customerId: string): string {
  const id = requireTrimmed(customerId, "customerId");
  if (!existsCustomer(id)) {
    throw new Error(`customer not found in registry: ${id}`);
  }
  touchInsightsStack();
  return id;
}

/**
 * Create a customer automation rule.
 */
export function createCustomerAutomation(
  input: CreateCustomerAutomationInput,
): CustomerAutomation {
  const customerId = requireCustomerForAutomation(input.customerId);
  assertTrigger(input.trigger);
  assertAction(input.action);

  const automationId = input.automationId
    ? requireTrimmed(input.automationId, "automationId")
    : createId("auto");

  if (automations.has(automationId)) {
    throw new Error(`automation already exists: ${automationId}`);
  }

  const row: CustomerAutomation = {
    automationId,
    customerId,
    trigger: input.trigger,
    action: input.action,
    enabled: input.enabled ?? true,
    updatedAt: nowIso(),
  };
  automations.set(automationId, row);
  return cloneAutomation(row);
}

/**
 * Get automation by automationId.
 */
export function getCustomerAutomation(
  automationId: string,
): CustomerAutomation | undefined {
  const id = automationId.trim();
  if (!id) return undefined;
  const row = automations.get(id);
  return row ? cloneAutomation(row) : undefined;
}

/**
 * List automations with optional filters.
 */
export function listCustomerAutomation(
  filter: ListCustomerAutomationFilter = {},
): CustomerAutomation[] {
  let rows = [...automations.values()];
  if (filter.customerId) {
    const customerId = requireTrimmed(filter.customerId, "customerId");
    rows = rows.filter((r) => r.customerId === customerId);
  }
  if (filter.trigger) {
    assertTrigger(filter.trigger);
    rows = rows.filter((r) => r.trigger === filter.trigger);
  }
  if (filter.action) {
    assertAction(filter.action);
    rows = rows.filter((r) => r.action === filter.action);
  }
  if (typeof filter.enabled === "boolean") {
    rows = rows.filter((r) => r.enabled === filter.enabled);
  }
  return rows
    .slice()
    .sort((a, b) => a.automationId.localeCompare(b.automationId))
    .map(cloneAutomation);
}

/**
 * Enable an existing automation.
 */
export function enableCustomerAutomation(
  automationId: string,
): CustomerAutomation {
  const id = requireTrimmed(automationId, "automationId");
  const existing = automations.get(id);
  if (!existing) {
    throw new Error(`automation not found: ${id}`);
  }
  touchInsightsStack();
  const updated: CustomerAutomation = {
    ...existing,
    enabled: true,
    updatedAt: nowIso(),
  };
  automations.set(id, updated);
  return cloneAutomation(updated);
}

/**
 * Disable an existing automation.
 */
export function disableCustomerAutomation(
  automationId: string,
): CustomerAutomation {
  const id = requireTrimmed(automationId, "automationId");
  const existing = automations.get(id);
  if (!existing) {
    throw new Error(`automation not found: ${id}`);
  }
  touchInsightsStack();
  const updated: CustomerAutomation = {
    ...existing,
    enabled: false,
    updatedAt: nowIso(),
  };
  automations.set(id, updated);
  return cloneAutomation(updated);
}

/** Test helper — clears in-memory automations. */
export function clearCustomerAutomations(): void {
  automations.clear();
}
