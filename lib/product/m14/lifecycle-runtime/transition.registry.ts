/**
 * Product M14 — Intelligence lifecycle transition registry (in-memory)
 */

import {
  INTELLIGENCE_LIFECYCLE_STATES,
  INTELLIGENCE_LIFECYCLE_TRANSITION_STATUSES,
  INTELLIGENCE_LIFECYCLE_TRIGGERS,
} from "./lifecycle.constants";
import { getIntelligenceLifecyclePlan } from "./plan.registry";
import type {
  IntelligenceLifecycleTransition,
  IntelligenceLifecycleTransitionStatus,
  RegisterIntelligenceLifecycleTransitionInput,
  UpdateIntelligenceLifecycleTransitionStatusInput,
} from "./lifecycle.types";

const transitions = new Map<string, IntelligenceLifecycleTransition>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTransition(
  transition: IntelligenceLifecycleTransition,
): IntelligenceLifecycleTransition {
  return { ...transition, metadata: { ...transition.metadata } };
}

export function registerIntelligenceLifecycleTransition(
  input: RegisterIntelligenceLifecycleTransitionInput,
): IntelligenceLifecycleTransition {
  const planId = input.planId.trim();
  const transitionKey = input.transitionKey.trim().toUpperCase();
  const standardKeyRef = input.standardKeyRef.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!planId) throw new Error("transition.planId is required");
  if (!transitionKey) {
    throw new Error("transition.transitionKey is required");
  }
  if (!standardKeyRef) {
    throw new Error("transition.standardKeyRef is required");
  }
  if (!summary) throw new Error("transition.summary is required");
  if (!Number.isInteger(input.sequence) || input.sequence < 1) {
    throw new Error("transition.sequence must be a positive integer");
  }
  if (!Number.isInteger(input.retentionDays) || input.retentionDays < 0) {
    throw new Error("transition.retentionDays must be a non-negative integer");
  }
  if (
    !(INTELLIGENCE_LIFECYCLE_STATES as readonly string[]).includes(
      input.fromState,
    )
  ) {
    throw new Error(`invalid fromState: ${input.fromState}`);
  }
  if (
    !(INTELLIGENCE_LIFECYCLE_STATES as readonly string[]).includes(input.toState)
  ) {
    throw new Error(`invalid toState: ${input.toState}`);
  }
  if (input.fromState === input.toState) {
    throw new Error("transition.fromState and toState must differ");
  }
  if (
    !(INTELLIGENCE_LIFECYCLE_TRIGGERS as readonly string[]).includes(
      input.trigger,
    )
  ) {
    throw new Error(`invalid trigger: ${input.trigger}`);
  }
  if (!getIntelligenceLifecyclePlan(planId)) {
    throw new Error(`plan not found: ${planId}`);
  }
  if (keys.has(transitionKey)) {
    throw new Error(`transitionKey already exists: ${transitionKey}`);
  }

  const id = input.id?.trim() || createId("intlct");
  if (transitions.has(id)) throw new Error(`transition already exists: ${id}`);

  const now = nowIso();
  const transition: IntelligenceLifecycleTransition = {
    id,
    planId,
    transitionKey,
    sequence: input.sequence,
    status: INTELLIGENCE_LIFECYCLE_TRANSITION_STATUSES[0],
    fromState: input.fromState,
    toState: input.toState,
    trigger: input.trigger,
    standardKeyRef,
    retentionDays: input.retentionDays,
    summary,
    detail: `seq=${input.sequence} ${input.fromState}->${input.toState} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  transitions.set(id, transition);
  keys.set(transitionKey, id);
  return cloneTransition(transition);
}

export function updateIntelligenceLifecycleTransitionStatus(
  input: UpdateIntelligenceLifecycleTransitionStatusInput,
): IntelligenceLifecycleTransition {
  const transitionId = input.transitionId.trim();
  if (!transitionId) {
    throw new Error("transition.transitionId is required");
  }
  if (
    !(INTELLIGENCE_LIFECYCLE_TRANSITION_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid transition status: ${input.status}`);
  }

  const existing = transitions.get(transitionId);
  if (!existing) throw new Error(`transition not found: ${transitionId}`);

  const updated: IntelligenceLifecycleTransition = {
    ...existing,
    status: input.status,
    detail: `seq=${existing.sequence} ${existing.fromState}->${existing.toState} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  transitions.set(transitionId, updated);
  return cloneTransition(updated);
}

export function getIntelligenceLifecycleTransition(
  id: string,
): IntelligenceLifecycleTransition | undefined {
  const transition = transitions.get(id.trim());
  return transition ? cloneTransition(transition) : undefined;
}

export function listIntelligenceLifecycleTransitions(filter?: {
  planId?: string;
  status?: IntelligenceLifecycleTransitionStatus;
}): IntelligenceLifecycleTransition[] {
  let result = [...transitions.values()];
  if (filter?.planId) {
    result = result.filter((t) => t.planId === filter.planId);
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

export function clearIntelligenceLifecycleTransitions(): void {
  transitions.clear();
  keys.clear();
}
