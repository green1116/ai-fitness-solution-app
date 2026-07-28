/**
 * Product M15 — Evolution governance control policy registry (definition only)
 */

import { EVOLUTION_GOVERNANCE_CONTROL_POLICY_KINDS } from "./governance.constants";
import { getEvolutionGovernanceByKey } from "./governance.registry";
import type {
  EvolutionGovernanceControlPolicy,
  EvolutionGovernanceControlPolicyKind,
  EvolutionGovernanceControlPolicyStatus,
  RegisterEvolutionGovernanceControlPolicyInput,
} from "./governance.types";

const policies = new Map<string, EvolutionGovernanceControlPolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(
  policy: EvolutionGovernanceControlPolicy,
): EvolutionGovernanceControlPolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerEvolutionGovernanceControlPolicy(
  input: RegisterEvolutionGovernanceControlPolicyInput,
): EvolutionGovernanceControlPolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const governanceKeyRef = input.governanceKeyRef.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!governanceKeyRef) {
    throw new Error("policy.governanceKeyRef is required");
  }
  if (!ruleRef) throw new Error("policy.ruleRef is required");
  if (
    !(EVOLUTION_GOVERNANCE_CONTROL_POLICY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const governance = getEvolutionGovernanceByKey(governanceKeyRef);
  if (!governance) {
    throw new Error(`governance not found: ${governanceKeyRef}`);
  }
  if (governance.status !== "ACTIVE" && governance.status !== "DRAFT") {
    throw new Error(`governance not governable: ${governanceKeyRef}`);
  }

  const id = input.id?.trim() || createId("evogovctl");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: EvolutionGovernanceControlPolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: "ACTIVE",
    title,
    governanceKeyRef,
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

export function getEvolutionGovernanceControlPolicy(
  id: string,
): EvolutionGovernanceControlPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listEvolutionGovernanceControlPolicies(filter?: {
  kind?: EvolutionGovernanceControlPolicyKind;
  status?: EvolutionGovernanceControlPolicyStatus;
}): EvolutionGovernanceControlPolicy[] {
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

export function clearEvolutionGovernanceControlPolicies(): void {
  policies.clear();
  keys.clear();
}
