/**
 * Product M10 — AI Job capability binding registry (soft-ref only)
 */

import { AI_JOB_BINDING_STATUSES } from "./job.constants";
import { getAiJob } from "./job.registry";
import { getAiJobStep } from "./step.registry";
import type {
  AiJobBindingStatus,
  AiJobCapabilityBinding,
  BindAiJobCapabilityInput,
} from "./job.types";

const bindings = new Map<string, AiJobCapabilityBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(
  binding: AiJobCapabilityBinding,
): AiJobCapabilityBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindAiJobCapability(
  input: BindAiJobCapabilityInput,
): AiJobCapabilityBinding {
  const jobId = input.jobId.trim();
  const stepId = input.stepId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const capabilityKeyRef = input.capabilityKeyRef.trim().toUpperCase();
  if (!jobId) throw new Error("binding.jobId is required");
  if (!stepId) throw new Error("binding.stepId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!capabilityKeyRef) {
    throw new Error("binding.capabilityKeyRef is required");
  }

  const job = getAiJob(jobId);
  if (!job) throw new Error(`job not found: ${jobId}`);
  if (job.status !== "ACTIVE") {
    throw new Error(`job not active: ${jobId}`);
  }

  const step = getAiJobStep(stepId);
  if (!step) throw new Error(`step not found: ${stepId}`);
  if (step.jobId !== jobId) {
    throw new Error(`step job mismatch: ${stepId}`);
  }
  if (step.status !== "DECLARED") {
    throw new Error(`step not declared: ${stepId}`);
  }

  const duplicate = [...bindings.values()].find(
    (b) => b.jobId === jobId && b.bindingKey === bindingKey,
  );
  if (duplicate) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("aijobbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: AiJobCapabilityBinding = {
    id,
    jobId,
    stepId,
    bindingKey,
    capabilityKeyRef,
    status: AI_JOB_BINDING_STATUSES[0],
    detail: `capability=${capabilityKeyRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getAiJobCapabilityBinding(
  id: string,
): AiJobCapabilityBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listAiJobCapabilityBindings(filter?: {
  jobId?: string;
  status?: AiJobBindingStatus;
}): AiJobCapabilityBinding[] {
  let result = [...bindings.values()];
  if (filter?.jobId) {
    const jobId = filter.jobId.trim();
    result = result.filter((b) => b.jobId === jobId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearAiJobCapabilityBindings(): void {
  bindings.clear();
}
