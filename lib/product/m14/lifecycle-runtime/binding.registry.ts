/**
 * Product M14 — Intelligence lifecycle binding registry (in-memory)
 */

import { INTELLIGENCE_LIFECYCLE_BINDING_STATUSES } from "./lifecycle.constants";
import { getIntelligenceLifecyclePlan } from "./plan.registry";
import { getIntelligenceLifecycleTransition } from "./transition.registry";
import type {
  BindIntelligenceLifecycleTransitionInput,
  IntelligenceLifecycleBinding,
  IntelligenceLifecycleBindingStatus,
} from "./lifecycle.types";

const bindings = new Map<string, IntelligenceLifecycleBinding>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(
  binding: IntelligenceLifecycleBinding,
): IntelligenceLifecycleBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindIntelligenceLifecycleTransition(
  input: BindIntelligenceLifecycleTransitionInput,
): IntelligenceLifecycleBinding {
  const planId = input.planId.trim();
  const transitionId = input.transitionId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const reviewKeyRef = input.reviewKeyRef.trim().toUpperCase();
  const supportPolicyRef = input.supportPolicyRef.trim().toUpperCase();
  if (!planId) throw new Error("binding.planId is required");
  if (!transitionId) throw new Error("binding.transitionId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!reviewKeyRef) throw new Error("binding.reviewKeyRef is required");
  if (!supportPolicyRef) {
    throw new Error("binding.supportPolicyRef is required");
  }
  if (!getIntelligenceLifecyclePlan(planId)) {
    throw new Error(`plan not found: ${planId}`);
  }
  const transition = getIntelligenceLifecycleTransition(transitionId);
  if (!transition) throw new Error(`transition not found: ${transitionId}`);
  if (transition.planId !== planId) {
    throw new Error(
      `transition ${transitionId} does not belong to plan ${planId}`,
    );
  }
  if (keys.has(bindingKey)) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("intlcb");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: IntelligenceLifecycleBinding = {
    id,
    planId,
    transitionId,
    bindingKey,
    reviewKeyRef,
    supportPolicyRef,
    status: INTELLIGENCE_LIFECYCLE_BINDING_STATUSES[0],
    detail: `review=${reviewKeyRef} support=${supportPolicyRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  keys.set(bindingKey, id);
  return cloneBinding(binding);
}

export function getIntelligenceLifecycleBinding(
  id: string,
): IntelligenceLifecycleBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listIntelligenceLifecycleBindings(filter?: {
  planId?: string;
  transitionId?: string;
  status?: IntelligenceLifecycleBindingStatus;
}): IntelligenceLifecycleBinding[] {
  let result = [...bindings.values()];
  if (filter?.planId) {
    result = result.filter((b) => b.planId === filter.planId);
  }
  if (filter?.transitionId) {
    result = result.filter((b) => b.transitionId === filter.transitionId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearIntelligenceLifecycleBindings(): void {
  bindings.clear();
  keys.clear();
}
