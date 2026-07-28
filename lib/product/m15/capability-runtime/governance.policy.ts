/**
 * Product M15 — Evolution capability governance policy registry (definition only)
 */

import { EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_KINDS } from "./capability.constants";
import { getEvolutionCapabilitySpecByKey } from "./capability.registry";
import type {
  EvolutionCapabilityGovernancePolicy,
  EvolutionCapabilityGovernancePolicyKind,
  EvolutionCapabilityGovernancePolicyStatus,
  RegisterEvolutionCapabilityGovernancePolicyInput,
} from "./capability.types";

const policies = new Map<string, EvolutionCapabilityGovernancePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(
  policy: EvolutionCapabilityGovernancePolicy,
): EvolutionCapabilityGovernancePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerEvolutionCapabilityGovernancePolicy(
  input: RegisterEvolutionCapabilityGovernancePolicyInput,
): EvolutionCapabilityGovernancePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const capabilityKeyRef = input.capabilityKeyRef.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!capabilityKeyRef) {
    throw new Error("policy.capabilityKeyRef is required");
  }
  if (!ruleRef) throw new Error("policy.ruleRef is required");
  if (
    !(EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const capability = getEvolutionCapabilitySpecByKey(capabilityKeyRef);
  if (!capability) {
    throw new Error(`capability not found: ${capabilityKeyRef}`);
  }
  if (capability.status !== "ACTIVE" && capability.status !== "DRAFT") {
    throw new Error(`capability not governable: ${capabilityKeyRef}`);
  }

  const id = input.id?.trim() || createId("evocapgov");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: EvolutionCapabilityGovernancePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: "ACTIVE",
    title,
    capabilityKeyRef,
    ruleRef,
    detail: `kind=${input.kind} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  policies.set(id, policy);
  keys.set(policyKey, id);
  return clonePolicy(policy);
}

export function getEvolutionCapabilityGovernancePolicy(
  id: string,
): EvolutionCapabilityGovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listEvolutionCapabilityGovernancePolicies(filter?: {
  kind?: EvolutionCapabilityGovernancePolicyKind;
  status?: EvolutionCapabilityGovernancePolicyStatus;
}): EvolutionCapabilityGovernancePolicy[] {
  let result = [...policies.values()];
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.policyKey.localeCompare(b.policyKey))
    .map(clonePolicy);
}

export function clearEvolutionCapabilityGovernancePolicies(): void {
  policies.clear();
  keys.clear();
}
