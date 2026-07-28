/**
 * Product M12 — Agent lifecycle binding registry
 */

import { AGENT_LIFECYCLE_BINDING_STATUSES } from "./lifecycle.constants";
import { getAgentLifecyclePlan } from "./plan.registry";
import { getAgentLifecycleTransition } from "./transition.registry";
import type {
  AgentLifecycleBinding,
  AgentLifecycleBindingStatus,
  BindAgentLifecycleTransitionInput,
} from "./lifecycle.types";

const bindings = new Map<string, AgentLifecycleBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(binding: AgentLifecycleBinding): AgentLifecycleBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindAgentLifecycleTransition(
  input: BindAgentLifecycleTransitionInput,
): AgentLifecycleBinding {
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

  const plan = getAgentLifecyclePlan(planId);
  if (!plan) throw new Error(`plan not found: ${planId}`);
  if (plan.status !== "ACTIVE") {
    throw new Error(`plan not active: ${planId}`);
  }

  const transition = getAgentLifecycleTransition(transitionId);
  if (!transition) throw new Error(`transition not found: ${transitionId}`);
  if (transition.planId !== planId) {
    throw new Error(`transition plan mismatch: ${transitionId}`);
  }
  if (transition.status !== "DECLARED") {
    throw new Error(`transition not declared: ${transitionId}`);
  }

  const duplicate = [...bindings.values()].find(
    (b) => b.planId === planId && b.bindingKey === bindingKey,
  );
  if (duplicate) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("agtlcsbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: AgentLifecycleBinding = {
    id,
    planId,
    transitionId,
    bindingKey,
    reviewKeyRef,
    supportPolicyRef,
    status: AGENT_LIFECYCLE_BINDING_STATUSES[0],
    detail: `review=${reviewKeyRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getAgentLifecycleBinding(
  id: string,
): AgentLifecycleBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listAgentLifecycleBindings(filter?: {
  planId?: string;
  status?: AgentLifecycleBindingStatus;
}): AgentLifecycleBinding[] {
  let result = [...bindings.values()];
  if (filter?.planId) {
    const planId = filter.planId.trim();
    result = result.filter((b) => b.planId === planId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearAgentLifecycleBindings(): void {
  bindings.clear();
}
