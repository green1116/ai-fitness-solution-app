/**
 * Product P7 — Workflow registry
 */

import { WORKFLOW_STEP_KINDS } from "../collaboration/collaboration.constants";
import { getCollaboration } from "../collaboration/collaboration.registry";
import type {
  CompleteWorkflowStepInput,
  CreateWorkflowStepInput,
  WorkflowStep,
  WorkflowStepKind,
} from "./workflow.types";

const steps = new Map<string, WorkflowStep>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStep(step: WorkflowStep): WorkflowStep {
  return { ...step, metadata: { ...step.metadata } };
}

export function createWorkflowStep(
  input: CreateWorkflowStepInput,
): WorkflowStep {
  const collaborationId = input.collaborationId.trim();
  const name = input.name.trim();
  if (!collaborationId) {
    throw new Error("workflow.collaborationId is required");
  }
  if (!name) throw new Error("workflow.name is required");
  if (!(WORKFLOW_STEP_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid workflow step kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.sequence) || input.sequence < 0) {
    throw new Error("workflow.sequence must be a non-negative number");
  }
  if (!getCollaboration(collaborationId)) {
    throw new Error(`collaboration not found: ${collaborationId}`);
  }

  const id = input.id?.trim() || createId("p7wfl");
  if (steps.has(id)) {
    throw new Error(`workflow step already exists: ${id}`);
  }

  const step: WorkflowStep = {
    id,
    collaborationId,
    kind: input.kind,
    name,
    sequence: input.sequence,
    completed: false,
    detail: `kind=${input.kind} sequence=${input.sequence}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  steps.set(id, step);
  return cloneStep(step);
}

export function completeWorkflowStep(
  input: CompleteWorkflowStepInput,
): WorkflowStep {
  const stepId = input.stepId.trim();
  if (!stepId) throw new Error("workflow.stepId is required");
  const existing = steps.get(stepId);
  if (!existing) throw new Error(`workflow step not found: ${stepId}`);
  if (existing.completed) {
    throw new Error(`workflow step already complete: ${stepId}`);
  }

  const updated: WorkflowStep = {
    ...existing,
    completed: true,
    detail: `kind=${existing.kind} completed=true`,
    metadata: { ...existing.metadata },
    completedAt: nowIso(),
  };
  steps.set(stepId, updated);
  return cloneStep(updated);
}

export function getWorkflowStep(id: string): WorkflowStep | undefined {
  const step = steps.get(id.trim());
  return step ? cloneStep(step) : undefined;
}

export function listWorkflowSteps(filter?: {
  collaborationId?: string;
  kind?: WorkflowStepKind;
}): WorkflowStep[] {
  let result = [...steps.values()];
  if (filter?.collaborationId) {
    const cid = filter.collaborationId.trim();
    result = result.filter((s) => s.collaborationId === cid);
  }
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id))
    .map(cloneStep);
}

export function clearWorkflowSteps(): void {
  steps.clear();
}
