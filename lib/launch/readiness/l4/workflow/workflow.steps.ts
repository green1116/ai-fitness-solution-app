/**
 * Launch L4 — Workflow steps
 */

import { WORKFLOW_STEP_STATUSES } from "../scenario/scenario.constants";
import type {
  AdvanceWorkflowStepInput,
  WorkflowStep,
  WorkflowStepStatus,
} from "./workflow.types";

const steps = new Map<string, WorkflowStep>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function stepKey(workflowId: string, index: number): string {
  return `${workflowId}#${index}`;
}

function cloneStep(step: WorkflowStep): WorkflowStep {
  return { ...step };
}

export function initializeWorkflowSteps(
  workflowId: string,
  stepLabels: string[],
): WorkflowStep[] {
  const created: WorkflowStep[] = [];
  stepLabels.forEach((label, index) => {
    const key = stepKey(workflowId, index);
    const step: WorkflowStep = {
      id: createId("l4stp"),
      workflowId,
      index,
      label,
      status: "PENDING",
      detail: `index=${index} status=PENDING`,
      updatedAt: nowIso(),
    };
    steps.set(key, step);
    created.push(cloneStep(step));
  });
  return created;
}

export function advanceWorkflowStep(
  input: AdvanceWorkflowStepInput,
): WorkflowStep {
  const workflowId = input.workflowId.trim();
  if (!workflowId) throw new Error("step.workflowId is required");
  if (!Number.isInteger(input.stepIndex) || input.stepIndex < 0) {
    throw new Error("step.stepIndex must be a non-negative integer");
  }

  const allowed: ReadonlyArray<Exclude<WorkflowStepStatus, "PENDING">> = [
    "RUNNING",
    "COMPLETED",
    "FAILED",
  ];
  if (!allowed.includes(input.status)) {
    throw new Error(`invalid workflow step status: ${input.status}`);
  }
  if (!(WORKFLOW_STEP_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid workflow step status: ${input.status}`);
  }

  const key = stepKey(workflowId, input.stepIndex);
  const current = steps.get(key);
  if (!current) {
    throw new Error(
      `workflow step not found: ${workflowId}#${input.stepIndex}`,
    );
  }

  const updated: WorkflowStep = {
    ...current,
    status: input.status,
    detail: `index=${current.index} status=${input.status}`,
    updatedAt: nowIso(),
  };
  steps.set(key, updated);
  return cloneStep(updated);
}

export function listWorkflowSteps(filter?: {
  workflowId?: string;
  status?: WorkflowStepStatus;
}): WorkflowStep[] {
  let result = [...steps.values()];
  if (filter?.workflowId) {
    const wid = filter.workflowId.trim();
    result = result.filter((s) => s.workflowId === wid);
  }
  if (filter?.status) result = result.filter((s) => s.status === filter.status);
  return result
    .slice()
    .sort((a, b) =>
      a.workflowId === b.workflowId
        ? a.index - b.index
        : a.workflowId.localeCompare(b.workflowId),
    )
    .map(cloneStep);
}

export function clearWorkflowSteps(): void {
  steps.clear();
}
