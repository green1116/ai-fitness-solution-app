/**
 * Product M15 — Evolution feedback capability in-memory registry
 */

import {
  EVOLUTION_FEEDBACK_CAPABILITY_KINDS,
  EVOLUTION_FEEDBACK_CAPABILITY_STATUSES,
} from "./feedback.constants";
import { getEvolutionFeedback } from "./feedback.registry";
import type {
  EvolutionFeedbackCapability,
  EvolutionFeedbackCapabilityKind,
  EvolutionFeedbackCapabilityStatus,
  RegisterEvolutionFeedbackCapabilityInput,
  UpdateEvolutionFeedbackCapabilityStatusInput,
} from "./feedback.types";

const capabilities = new Map<string, EvolutionFeedbackCapability>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCapability(
  capability: EvolutionFeedbackCapability,
): EvolutionFeedbackCapability {
  return { ...capability, metadata: { ...capability.metadata } };
}

export function registerEvolutionFeedbackCapability(
  input: RegisterEvolutionFeedbackCapabilityInput,
): EvolutionFeedbackCapability {
  const feedbackId = input.feedbackId.trim();
  const capabilityKey = input.capabilityKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!feedbackId) throw new Error("capability.feedbackId is required");
  if (!capabilityKey) throw new Error("capability.capabilityKey is required");
  if (!summary) throw new Error("capability.summary is required");
  if (
    !(EVOLUTION_FEEDBACK_CAPABILITY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid capability kind: ${input.kind}`);
  }
  if (keys.has(capabilityKey)) {
    throw new Error(`capabilityKey already exists: ${capabilityKey}`);
  }

  const feedback = getEvolutionFeedback(feedbackId);
  if (!feedback) throw new Error(`feedback not found: ${feedbackId}`);
  if (feedback.status !== "ACTIVE" && feedback.status !== "DRAFT") {
    throw new Error(`feedback not capable: ${feedback.feedbackKey}`);
  }

  const id = input.id?.trim() || createId("evofbcap");
  if (capabilities.has(id)) {
    throw new Error(`capability already exists: ${id}`);
  }

  const now = nowIso();
  const capability: EvolutionFeedbackCapability = {
    id,
    feedbackId,
    capabilityKey,
    kind: input.kind,
    status: EVOLUTION_FEEDBACK_CAPABILITY_STATUSES[0],
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  capabilities.set(id, capability);
  keys.set(capabilityKey, id);
  return cloneCapability(capability);
}

export function updateEvolutionFeedbackCapabilityStatus(
  input: UpdateEvolutionFeedbackCapabilityStatusInput,
): EvolutionFeedbackCapability {
  const capabilityId = input.capabilityId.trim();
  if (!capabilityId) throw new Error("capability.capabilityId is required");
  if (
    !(EVOLUTION_FEEDBACK_CAPABILITY_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid capability status: ${input.status}`);
  }

  const existing = capabilities.get(capabilityId);
  if (!existing) throw new Error(`capability not found: ${capabilityId}`);

  const updated: EvolutionFeedbackCapability = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  capabilities.set(capabilityId, updated);
  return cloneCapability(updated);
}

export function getEvolutionFeedbackCapability(
  id: string,
): EvolutionFeedbackCapability | undefined {
  const capability = capabilities.get(id.trim());
  return capability ? cloneCapability(capability) : undefined;
}

export function listEvolutionFeedbackCapabilities(filter?: {
  feedbackId?: string;
  kind?: EvolutionFeedbackCapabilityKind;
  status?: EvolutionFeedbackCapabilityStatus;
}): EvolutionFeedbackCapability[] {
  let result = [...capabilities.values()];
  if (filter?.feedbackId) {
    result = result.filter((c) => c.feedbackId === filter.feedbackId);
  }
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.capabilityKey.localeCompare(b.capabilityKey))
    .map(cloneCapability);
}

export function clearEvolutionFeedbackCapabilities(): void {
  capabilities.clear();
  keys.clear();
}
