/**
 * Product M13 — OS policy binding registry (soft edgeKeyRef)
 */

import { OS_POLICY_BINDING_STATUSES } from "./policy.constants";
import { getOsPolicy } from "./policy.registry";
import { getOsPolicyRule } from "./rule.registry";
import type {
  BindOsPolicyRuleInput,
  OsPolicyBinding,
  OsPolicyBindingStatus,
} from "./policy.types";

const bindings = new Map<string, OsPolicyBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(binding: OsPolicyBinding): OsPolicyBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindOsPolicyRule(
  input: BindOsPolicyRuleInput,
): OsPolicyBinding {
  const policyId = input.policyId.trim();
  const ruleId = input.ruleId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const edgeKeyRef = input.edgeKeyRef.trim().toUpperCase();
  if (!policyId) throw new Error("binding.policyId is required");
  if (!ruleId) throw new Error("binding.ruleId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!edgeKeyRef) throw new Error("binding.edgeKeyRef is required");

  const policy = getOsPolicy(policyId);
  if (!policy) throw new Error(`policy not found: ${policyId}`);
  if (policy.status !== "ACTIVE") {
    throw new Error(`policy not active: ${policyId}`);
  }

  const rule = getOsPolicyRule(ruleId);
  if (!rule) throw new Error(`rule not found: ${ruleId}`);
  if (rule.policyId !== policyId) {
    throw new Error(`rule policy mismatch: ${ruleId}`);
  }
  if (rule.status !== "DECLARED") {
    throw new Error(`rule not declared: ${ruleId}`);
  }

  const duplicate = [...bindings.values()].find(
    (b) => b.policyId === policyId && b.bindingKey === bindingKey,
  );
  if (duplicate) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("ospolbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: OsPolicyBinding = {
    id,
    policyId,
    ruleId,
    bindingKey,
    edgeKeyRef,
    status: OS_POLICY_BINDING_STATUSES[0],
    detail: `edge=${edgeKeyRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getOsPolicyBinding(id: string): OsPolicyBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listOsPolicyBindings(filter?: {
  policyId?: string;
  status?: OsPolicyBindingStatus;
}): OsPolicyBinding[] {
  let result = [...bindings.values()];
  if (filter?.policyId) {
    const policyId = filter.policyId.trim();
    result = result.filter((b) => b.policyId === policyId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearOsPolicyBindings(): void {
  bindings.clear();
}
