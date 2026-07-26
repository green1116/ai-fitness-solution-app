/**
 * Product M09 — AI Orchestration plan registry (declaration only)
 */

import {
  AI_ORCHESTRATION_KINDS,
  AI_ORCHESTRATION_STATUSES,
} from "./orchestration.constants";
import type {
  AiOrchestrationKind,
  AiOrchestrationStatus,
  ProductAiOrchestration,
  RegisterAiOrchestrationInput,
  UpdateAiOrchestrationStatusInput,
} from "./orchestration.types";

const plans = new Map<string, ProductAiOrchestration>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlan(plan: ProductAiOrchestration): ProductAiOrchestration {
  return { ...plan, metadata: { ...plan.metadata } };
}

export function registerAiOrchestration(
  input: RegisterAiOrchestrationInput,
): ProductAiOrchestration {
  const orchestrationKey = input.orchestrationKey.trim().toUpperCase();
  const name = input.name.trim();
  const summary = input.summary.trim();
  if (!orchestrationKey) {
    throw new Error("orchestration.orchestrationKey is required");
  }
  if (!name) throw new Error("orchestration.name is required");
  if (!summary) throw new Error("orchestration.summary is required");
  if (!(AI_ORCHESTRATION_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid orchestration kind: ${input.kind}`);
  }
  if (keys.has(orchestrationKey)) {
    throw new Error(`orchestrationKey already exists: ${orchestrationKey}`);
  }

  const id = input.id?.trim() || createId("aiorch");
  if (plans.has(id)) throw new Error(`orchestration already exists: ${id}`);

  const now = nowIso();
  const plan: ProductAiOrchestration = {
    id,
    orchestrationKey,
    name,
    kind: input.kind,
    status: AI_ORCHESTRATION_STATUSES[0],
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  plans.set(id, plan);
  keys.set(orchestrationKey, id);
  return clonePlan(plan);
}

export function updateAiOrchestrationStatus(
  input: UpdateAiOrchestrationStatusInput,
): ProductAiOrchestration {
  const orchestrationId = input.orchestrationId.trim();
  if (!orchestrationId) {
    throw new Error("orchestration.orchestrationId is required");
  }
  if (
    !(AI_ORCHESTRATION_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid orchestration status: ${input.status}`);
  }

  const existing = plans.get(orchestrationId);
  if (!existing) {
    throw new Error(`orchestration not found: ${orchestrationId}`);
  }

  const updated: ProductAiOrchestration = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  plans.set(orchestrationId, updated);
  return clonePlan(updated);
}

export function getAiOrchestration(
  id: string,
): ProductAiOrchestration | undefined {
  const plan = plans.get(id.trim());
  return plan ? clonePlan(plan) : undefined;
}

export function listAiOrchestrations(filter?: {
  kind?: AiOrchestrationKind;
  status?: AiOrchestrationStatus;
}): ProductAiOrchestration[] {
  let result = [...plans.values()];
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.orchestrationKey.localeCompare(b.orchestrationKey))
    .map(clonePlan);
}

export function clearAiOrchestrations(): void {
  plans.clear();
  keys.clear();
}
