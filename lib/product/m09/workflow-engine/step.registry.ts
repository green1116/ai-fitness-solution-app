/**
 * Product M09 — AI Workflow step registry (soft promptKeyRef only)
 */

import { AI_WORKFLOW_STEP_KINDS } from "./workflow.constants";
import { getAiWorkflow } from "./workflow.registry";
import type {
  AiWorkflowStep,
  AiWorkflowStepKind,
  RegisterAiWorkflowStepInput,
} from "./workflow.types";
import { getAiWorkflowVersion } from "./version.registry";

const steps = new Map<string, AiWorkflowStep>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStep(step: AiWorkflowStep): AiWorkflowStep {
  return { ...step, metadata: { ...step.metadata } };
}

export function registerAiWorkflowStep(
  input: RegisterAiWorkflowStepInput,
): AiWorkflowStep {
  const workflowId = input.workflowId.trim();
  const versionId = input.versionId.trim();
  const stepKey = input.stepKey.trim().toUpperCase();
  const promptKeyRef = input.promptKeyRef.trim().toUpperCase();
  if (!workflowId) throw new Error("step.workflowId is required");
  if (!versionId) throw new Error("step.versionId is required");
  if (!stepKey) throw new Error("step.stepKey is required");
  if (!promptKeyRef) throw new Error("step.promptKeyRef is required");
  if (!Number.isFinite(input.order) || input.order < 1) {
    throw new Error("step.order must be >= 1");
  }
  if (!(AI_WORKFLOW_STEP_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid step kind: ${input.kind}`);
  }

  const workflow = getAiWorkflow(workflowId);
  if (!workflow) throw new Error(`workflow not found: ${workflowId}`);
  if (workflow.status !== "ACTIVE") {
    throw new Error(`workflow not active: ${workflowId}`);
  }

  const version = getAiWorkflowVersion(versionId);
  if (!version) throw new Error(`version not found: ${versionId}`);
  if (version.workflowId !== workflowId) {
    throw new Error(`version workflow mismatch: ${versionId}`);
  }
  if (version.status !== "PUBLISHED") {
    throw new Error(`version not published: ${versionId}`);
  }

  const order = Math.floor(input.order);
  const duplicate = [...steps.values()].find(
    (s) =>
      s.versionId === versionId &&
      (s.stepKey === stepKey || s.order === order),
  );
  if (duplicate) {
    throw new Error(`step key/order already exists: ${stepKey}/${order}`);
  }

  const id = input.id?.trim() || createId("aiwfstep");
  if (steps.has(id)) throw new Error(`step already exists: ${id}`);

  const step: AiWorkflowStep = {
    id,
    workflowId,
    versionId,
    stepKey,
    kind: input.kind,
    order,
    promptKeyRef,
    detail: `kind=${input.kind} order=${order} prompt=${promptKeyRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  steps.set(id, step);
  return cloneStep(step);
}

export function getAiWorkflowStep(id: string): AiWorkflowStep | undefined {
  const step = steps.get(id.trim());
  return step ? cloneStep(step) : undefined;
}

export function listAiWorkflowSteps(filter?: {
  workflowId?: string;
  versionId?: string;
  kind?: AiWorkflowStepKind;
}): AiWorkflowStep[] {
  let result = [...steps.values()];
  if (filter?.workflowId) {
    const workflowId = filter.workflowId.trim();
    result = result.filter((s) => s.workflowId === workflowId);
  }
  if (filter?.versionId) {
    const versionId = filter.versionId.trim();
    result = result.filter((s) => s.versionId === versionId);
  }
  if (filter?.kind) {
    result = result.filter((s) => s.kind === filter.kind);
  }
  return result
    .slice()
    .sort((a, b) => a.order - b.order || a.stepKey.localeCompare(b.stepKey))
    .map(cloneStep);
}

export function clearAiWorkflowSteps(): void {
  steps.clear();
}
