/**
 * Product M15 — Evolution optimization governance policy registry (definition only)
 */

import { EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_KINDS } from "./optimization.constants";
import { getEvolutionOptimizationProposalByKey } from "./optimization.registry";
import type {
  EvolutionOptimizationGovernancePolicy,
  EvolutionOptimizationGovernancePolicyKind,
  EvolutionOptimizationGovernancePolicyStatus,
  RegisterEvolutionOptimizationGovernancePolicyInput,
} from "./optimization.types";

const policies = new Map<string, EvolutionOptimizationGovernancePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(
  policy: EvolutionOptimizationGovernancePolicy,
): EvolutionOptimizationGovernancePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerEvolutionOptimizationGovernancePolicy(
  input: RegisterEvolutionOptimizationGovernancePolicyInput,
): EvolutionOptimizationGovernancePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const proposalKeyRef = input.proposalKeyRef.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!proposalKeyRef) throw new Error("policy.proposalKeyRef is required");
  if (!ruleRef) throw new Error("policy.ruleRef is required");
  if (
    !(
      EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_KINDS as readonly string[]
    ).includes(input.kind)
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const proposal = getEvolutionOptimizationProposalByKey(proposalKeyRef);
  if (!proposal) throw new Error(`proposal not found: ${proposalKeyRef}`);
  if (proposal.status !== "ACTIVE" && proposal.status !== "DRAFT") {
    throw new Error(`proposal not governable: ${proposalKeyRef}`);
  }

  const id = input.id?.trim() || createId("evoptgov");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: EvolutionOptimizationGovernancePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: "ACTIVE",
    title,
    proposalKeyRef,
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

export function getEvolutionOptimizationGovernancePolicy(
  id: string,
): EvolutionOptimizationGovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listEvolutionOptimizationGovernancePolicies(filter?: {
  kind?: EvolutionOptimizationGovernancePolicyKind;
  status?: EvolutionOptimizationGovernancePolicyStatus;
}): EvolutionOptimizationGovernancePolicy[] {
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

export function clearEvolutionOptimizationGovernancePolicies(): void {
  policies.clear();
  keys.clear();
}
