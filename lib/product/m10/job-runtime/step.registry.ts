/**
 * Product M10 — AI Job step registry (definition only)
 */

import { AI_JOB_STEP_STATUSES } from "./job.constants";
import { getAiJob } from "./job.registry";
import type {
  AiJobStep,
  AiJobStepStatus,
  RegisterAiJobStepInput,
  UpdateAiJobStepStatusInput,
} from "./job.types";

const steps = new Map<string, AiJobStep>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStep(step: AiJobStep): AiJobStep {
  return { ...step, metadata: { ...step.metadata } };
}

export function registerAiJobStep(
  input: RegisterAiJobStepInput,
): AiJobStep {
  const jobId = input.jobId.trim();
  const stepKey = input.stepKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!jobId) throw new Error("step.jobId is required");
  if (!stepKey) throw new Error("step.stepKey is required");
  if (!summary) throw new Error("step.summary is required");
  if (!Number.isInteger(input.sequence) || input.sequence < 1) {
    throw new Error("step.sequence must be a positive integer");
  }

  const job = getAiJob(jobId);
  if (!job) throw new Error(`job not found: ${jobId}`);
  if (job.status !== "ACTIVE" && job.status !== "DRAFT") {
    throw new Error(`job not editable: ${jobId}`);
  }

  const duplicateKey = [...steps.values()].find(
    (s) => s.jobId === jobId && s.stepKey === stepKey,
  );
  if (duplicateKey) throw new Error(`stepKey already exists: ${stepKey}`);

  const duplicateSeq = [...steps.values()].find(
    (s) => s.jobId === jobId && s.sequence === input.sequence,
  );
  if (duplicateSeq) {
    throw new Error(`step sequence already exists: ${input.sequence}`);
  }

  const id = input.id?.trim() || createId("aijobstep");
  if (steps.has(id)) throw new Error(`step already exists: ${id}`);

  const now = nowIso();
  const step: AiJobStep = {
    id,
    jobId,
    stepKey,
    sequence: input.sequence,
    status: AI_JOB_STEP_STATUSES[0],
    summary,
    detail: `seq=${input.sequence} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  steps.set(id, step);
  return cloneStep(step);
}

export function updateAiJobStepStatus(
  input: UpdateAiJobStepStatusInput,
): AiJobStep {
  const stepId = input.stepId.trim();
  if (!stepId) throw new Error("step.stepId is required");
  if (!(AI_JOB_STEP_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid step status: ${input.status}`);
  }

  const existing = steps.get(stepId);
  if (!existing) throw new Error(`step not found: ${stepId}`);

  const updated: AiJobStep = {
    ...existing,
    status: input.status,
    detail: `seq=${existing.sequence} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  steps.set(stepId, updated);
  return cloneStep(updated);
}

export function getAiJobStep(id: string): AiJobStep | undefined {
  const step = steps.get(id.trim());
  return step ? cloneStep(step) : undefined;
}

export function listAiJobSteps(filter?: {
  jobId?: string;
  status?: AiJobStepStatus;
}): AiJobStep[] {
  let result = [...steps.values()];
  if (filter?.jobId) {
    const jobId = filter.jobId.trim();
    result = result.filter((s) => s.jobId === jobId);
  }
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.sequence - b.sequence || a.stepKey.localeCompare(b.stepKey))
    .map(cloneStep);
}

export function clearAiJobSteps(): void {
  steps.clear();
}
