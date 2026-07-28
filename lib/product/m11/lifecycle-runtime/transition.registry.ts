/**
 * Product M11 — Knowledge lifecycle transition registry (soft standardKeyRef)
 */

import {
  KNOWLEDGE_LIFECYCLE_STATES,
  KNOWLEDGE_LIFECYCLE_TRANSITION_STATUSES,
  KNOWLEDGE_LIFECYCLE_TRIGGERS,
} from "./lifecycle.constants";
import { getKnowledgeLifecyclePlan } from "./plan.registry";
import type {
  KnowledgeLifecycleTransition,
  KnowledgeLifecycleTransitionStatus,
  RegisterKnowledgeLifecycleTransitionInput,
  UpdateKnowledgeLifecycleTransitionStatusInput,
} from "./lifecycle.types";

const transitions = new Map<string, KnowledgeLifecycleTransition>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTransition(
  transition: KnowledgeLifecycleTransition,
): KnowledgeLifecycleTransition {
  return { ...transition, metadata: { ...transition.metadata } };
}

export function registerKnowledgeLifecycleTransition(
  input: RegisterKnowledgeLifecycleTransitionInput,
): KnowledgeLifecycleTransition {
  const planId = input.planId.trim();
  const transitionKey = input.transitionKey.trim().toUpperCase();
  const standardKeyRef = input.standardKeyRef.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!planId) throw new Error("transition.planId is required");
  if (!transitionKey) throw new Error("transition.transitionKey is required");
  if (!standardKeyRef) {
    throw new Error("transition.standardKeyRef is required");
  }
  if (!summary) throw new Error("transition.summary is required");
  if (!Number.isInteger(input.sequence) || input.sequence < 1) {
    throw new Error("transition.sequence must be a positive integer");
  }
  if (
    !(KNOWLEDGE_LIFECYCLE_STATES as readonly string[]).includes(input.fromState)
  ) {
    throw new Error(`invalid fromState: ${input.fromState}`);
  }
  if (
    !(KNOWLEDGE_LIFECYCLE_STATES as readonly string[]).includes(input.toState)
  ) {
    throw new Error(`invalid toState: ${input.toState}`);
  }
  if (input.fromState === input.toState) {
    throw new Error("transition fromState and toState must differ");
  }
  if (
    !(KNOWLEDGE_LIFECYCLE_TRIGGERS as readonly string[]).includes(input.trigger)
  ) {
    throw new Error(`invalid trigger: ${input.trigger}`);
  }
  if (!Number.isInteger(input.retentionDays) || input.retentionDays < 0) {
    throw new Error("transition.retentionDays must be a non-negative integer");
  }

  const plan = getKnowledgeLifecyclePlan(planId);
  if (!plan) throw new Error(`plan not found: ${planId}`);
  if (plan.status !== "ACTIVE" && plan.status !== "DRAFT") {
    throw new Error(`plan not editable: ${planId}`);
  }

  const duplicateKey = [...transitions.values()].find(
    (t) => t.planId === planId && t.transitionKey === transitionKey,
  );
  if (duplicateKey) {
    throw new Error(`transitionKey already exists: ${transitionKey}`);
  }

  const duplicateSeq = [...transitions.values()].find(
    (t) => t.planId === planId && t.sequence === input.sequence,
  );
  if (duplicateSeq) {
    throw new Error(`transition sequence already exists: ${input.sequence}`);
  }

  const id = input.id?.trim() || createId("knwlcstrn");
  if (transitions.has(id)) throw new Error(`transition already exists: ${id}`);

  const now = nowIso();
  const transition: KnowledgeLifecycleTransition = {
    id,
    planId,
    transitionKey,
    sequence: input.sequence,
    status: KNOWLEDGE_LIFECYCLE_TRANSITION_STATUSES[0],
    fromState: input.fromState,
    toState: input.toState,
    trigger: input.trigger,
    standardKeyRef,
    retentionDays: input.retentionDays,
    summary,
    detail: `seq=${input.sequence} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  transitions.set(id, transition);
  return cloneTransition(transition);
}

export function updateKnowledgeLifecycleTransitionStatus(
  input: UpdateKnowledgeLifecycleTransitionStatusInput,
): KnowledgeLifecycleTransition {
  const transitionId = input.transitionId.trim();
  if (!transitionId) throw new Error("transition.transitionId is required");
  if (
    !(KNOWLEDGE_LIFECYCLE_TRANSITION_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid transition status: ${input.status}`);
  }

  const existing = transitions.get(transitionId);
  if (!existing) throw new Error(`transition not found: ${transitionId}`);

  const updated: KnowledgeLifecycleTransition = {
    ...existing,
    status: input.status,
    detail: `seq=${existing.sequence} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  transitions.set(transitionId, updated);
  return cloneTransition(updated);
}

export function getKnowledgeLifecycleTransition(
  id: string,
): KnowledgeLifecycleTransition | undefined {
  const transition = transitions.get(id.trim());
  return transition ? cloneTransition(transition) : undefined;
}

export function listKnowledgeLifecycleTransitions(filter?: {
  planId?: string;
  status?: KnowledgeLifecycleTransitionStatus;
}): KnowledgeLifecycleTransition[] {
  let result = [...transitions.values()];
  if (filter?.planId) {
    const planId = filter.planId.trim();
    result = result.filter((t) => t.planId === planId);
  }
  if (filter?.status) {
    result = result.filter((t) => t.status === filter.status);
  }
  return result
    .slice()
    .sort(
      (a, b) =>
        a.sequence - b.sequence ||
        a.transitionKey.localeCompare(b.transitionKey),
    )
    .map(cloneTransition);
}

export function clearKnowledgeLifecycleTransitions(): void {
  transitions.clear();
}
