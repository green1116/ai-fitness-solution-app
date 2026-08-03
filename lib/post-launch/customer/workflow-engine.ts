/**
 * FEAT-46 — Workflow Engine
 * In-memory workflows bound to CustomerAutomation rules.
 */
import { getCustomerAutomation } from "./customer-automation";

export const FEAT_46_ID = "FEAT-46" as const;
export const WORKFLOW_ENGINE_CAPABILITY = "WorkflowEngine" as const;

export const WORKFLOW_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "FAILED",
] as const;

export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export type Workflow = Readonly<{
  workflowId: string;
  automationId: string;
  status: WorkflowStatus;
  steps: readonly string[];
  currentStep: number;
  updatedAt: string;
}>;

export type CreateWorkflowInput = Readonly<{
  workflowId?: string;
  automationId: string;
  steps: readonly string[];
  status?: WorkflowStatus;
  currentStep?: number;
}>;

export type ListWorkflowFilter = Readonly<{
  automationId?: string;
  status?: WorkflowStatus;
}>;

const workflows = new Map<string, Workflow>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkflow(row: Workflow): Workflow {
  return {
    ...row,
    steps: [...row.steps],
  };
}

function requireTrimmed(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`workflowEngine.${field} is required`);
  return trimmed;
}

function assertStatus(status: string): asserts status is WorkflowStatus {
  if (!(WORKFLOW_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid workflow status: ${status}`);
  }
}

function normalizeSteps(steps: readonly string[]): string[] {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error("workflowEngine.steps must be a non-empty array");
  }
  return steps.map((step, index) => {
    const trimmed = step.trim();
    if (!trimmed) {
      throw new Error(`workflowEngine.steps[${index}] is required`);
    }
    return trimmed;
  });
}

function requireAutomation(automationId: string): string {
  const id = requireTrimmed(automationId, "automationId");
  if (!getCustomerAutomation(id)) {
    throw new Error(`automation not found: ${id}`);
  }
  return id;
}

/**
 * Create a workflow bound to an existing customer automation.
 */
export function createWorkflow(input: CreateWorkflowInput): Workflow {
  const automationId = requireAutomation(input.automationId);
  const steps = normalizeSteps(input.steps);
  const status = input.status ?? "DRAFT";
  assertStatus(status);

  const currentStep = input.currentStep ?? 0;
  if (
    !Number.isInteger(currentStep) ||
    currentStep < 0 ||
    currentStep >= steps.length
  ) {
    throw new Error(
      `workflowEngine.currentStep out of range: ${currentStep}`,
    );
  }

  const workflowId = input.workflowId
    ? requireTrimmed(input.workflowId, "workflowId")
    : createId("wf");

  if (workflows.has(workflowId)) {
    throw new Error(`workflow already exists: ${workflowId}`);
  }

  const row: Workflow = {
    workflowId,
    automationId,
    status,
    steps,
    currentStep,
    updatedAt: nowIso(),
  };
  workflows.set(workflowId, row);
  return cloneWorkflow(row);
}

/**
 * Get workflow by workflowId.
 */
export function getWorkflow(workflowId: string): Workflow | undefined {
  const id = workflowId.trim();
  if (!id) return undefined;
  const row = workflows.get(id);
  return row ? cloneWorkflow(row) : undefined;
}

/**
 * List workflows with optional filters.
 */
export function listWorkflow(
  filter: ListWorkflowFilter = {},
): Workflow[] {
  let rows = [...workflows.values()];
  if (filter.automationId) {
    const automationId = requireTrimmed(filter.automationId, "automationId");
    rows = rows.filter((r) => r.automationId === automationId);
  }
  if (filter.status) {
    assertStatus(filter.status);
    rows = rows.filter((r) => r.status === filter.status);
  }
  return rows
    .slice()
    .sort((a, b) => a.workflowId.localeCompare(b.workflowId))
    .map(cloneWorkflow);
}

/**
 * Start a DRAFT workflow (→ ACTIVE).
 */
export function startWorkflow(workflowId: string): Workflow {
  const id = requireTrimmed(workflowId, "workflowId");
  const existing = workflows.get(id);
  if (!existing) {
    throw new Error(`workflow not found: ${id}`);
  }
  if (existing.status !== "DRAFT") {
    throw new Error(
      `workflow can only start from DRAFT, got ${existing.status}`,
    );
  }
  // Reuse automation binding.
  requireAutomation(existing.automationId);

  const updated: Workflow = {
    ...existing,
    status: "ACTIVE",
    updatedAt: nowIso(),
  };
  workflows.set(id, updated);
  return cloneWorkflow(updated);
}

/**
 * Pause an ACTIVE workflow (→ PAUSED).
 */
export function pauseWorkflow(workflowId: string): Workflow {
  const id = requireTrimmed(workflowId, "workflowId");
  const existing = workflows.get(id);
  if (!existing) {
    throw new Error(`workflow not found: ${id}`);
  }
  if (existing.status !== "ACTIVE") {
    throw new Error(
      `workflow can only pause from ACTIVE, got ${existing.status}`,
    );
  }
  requireAutomation(existing.automationId);

  const updated: Workflow = {
    ...existing,
    status: "PAUSED",
    updatedAt: nowIso(),
  };
  workflows.set(id, updated);
  return cloneWorkflow(updated);
}

/**
 * Resume a PAUSED workflow (→ ACTIVE).
 */
export function resumeWorkflow(workflowId: string): Workflow {
  const id = requireTrimmed(workflowId, "workflowId");
  const existing = workflows.get(id);
  if (!existing) {
    throw new Error(`workflow not found: ${id}`);
  }
  if (existing.status !== "PAUSED") {
    throw new Error(
      `workflow can only resume from PAUSED, got ${existing.status}`,
    );
  }
  requireAutomation(existing.automationId);

  const updated: Workflow = {
    ...existing,
    status: "ACTIVE",
    updatedAt: nowIso(),
  };
  workflows.set(id, updated);
  return cloneWorkflow(updated);
}

/** Test helper — clears in-memory workflows. */
export function clearWorkflows(): void {
  workflows.clear();
}
