/**
 * Product M09 — AI Workflow registry (declaration only)
 */

import {
  AI_WORKFLOW_KINDS,
  AI_WORKFLOW_STATUSES,
} from "./workflow.constants";
import type {
  AiWorkflowKind,
  AiWorkflowStatus,
  ProductAiWorkflow,
  RegisterAiWorkflowInput,
  UpdateAiWorkflowStatusInput,
} from "./workflow.types";

const workflows = new Map<string, ProductAiWorkflow>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneWorkflow(workflow: ProductAiWorkflow): ProductAiWorkflow {
  return { ...workflow, metadata: { ...workflow.metadata } };
}

export function registerAiWorkflow(
  input: RegisterAiWorkflowInput,
): ProductAiWorkflow {
  const workflowKey = input.workflowKey.trim().toUpperCase();
  const name = input.name.trim();
  const summary = input.summary.trim();
  if (!workflowKey) throw new Error("workflow.workflowKey is required");
  if (!name) throw new Error("workflow.name is required");
  if (!summary) throw new Error("workflow.summary is required");
  if (!(AI_WORKFLOW_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid workflow kind: ${input.kind}`);
  }
  if (keys.has(workflowKey)) {
    throw new Error(`workflowKey already exists: ${workflowKey}`);
  }

  const id = input.id?.trim() || createId("aiwf");
  if (workflows.has(id)) throw new Error(`workflow already exists: ${id}`);

  const now = nowIso();
  const workflow: ProductAiWorkflow = {
    id,
    workflowKey,
    name,
    kind: input.kind,
    status: AI_WORKFLOW_STATUSES[0],
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  workflows.set(id, workflow);
  keys.set(workflowKey, id);
  return cloneWorkflow(workflow);
}

export function updateAiWorkflowStatus(
  input: UpdateAiWorkflowStatusInput,
): ProductAiWorkflow {
  const workflowId = input.workflowId.trim();
  if (!workflowId) throw new Error("workflow.workflowId is required");
  if (!(AI_WORKFLOW_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid workflow status: ${input.status}`);
  }

  const existing = workflows.get(workflowId);
  if (!existing) throw new Error(`workflow not found: ${workflowId}`);

  const updated: ProductAiWorkflow = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  workflows.set(workflowId, updated);
  return cloneWorkflow(updated);
}

export function getAiWorkflow(id: string): ProductAiWorkflow | undefined {
  const workflow = workflows.get(id.trim());
  return workflow ? cloneWorkflow(workflow) : undefined;
}

export function listAiWorkflows(filter?: {
  kind?: AiWorkflowKind;
  status?: AiWorkflowStatus;
}): ProductAiWorkflow[] {
  let result = [...workflows.values()];
  if (filter?.kind) result = result.filter((w) => w.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((w) => w.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.workflowKey.localeCompare(b.workflowKey))
    .map(cloneWorkflow);
}

export function clearAiWorkflows(): void {
  workflows.clear();
  keys.clear();
}
