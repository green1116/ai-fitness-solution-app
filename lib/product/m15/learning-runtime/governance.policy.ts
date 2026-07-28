/**
 * Product M15 — Evolution learning governance policy registry (definition only)
 */

import { EVOLUTION_LEARNING_GOVERNANCE_POLICY_KINDS } from "./learning.constants";
import { getEvolutionLearningByKey } from "./learning.registry";
import type {
  EvolutionLearningGovernancePolicy,
  EvolutionLearningGovernancePolicyKind,
  EvolutionLearningGovernancePolicyStatus,
  RegisterEvolutionLearningGovernancePolicyInput,
} from "./learning.types";

const policies = new Map<string, EvolutionLearningGovernancePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(
  policy: EvolutionLearningGovernancePolicy,
): EvolutionLearningGovernancePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerEvolutionLearningGovernancePolicy(
  input: RegisterEvolutionLearningGovernancePolicyInput,
): EvolutionLearningGovernancePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const learningKeyRef = input.learningKeyRef.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!learningKeyRef) throw new Error("policy.learningKeyRef is required");
  if (!ruleRef) throw new Error("policy.ruleRef is required");
  if (
    !(EVOLUTION_LEARNING_GOVERNANCE_POLICY_KINDS as readonly string[]).includes(
      input.kind,
    )
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const learning = getEvolutionLearningByKey(learningKeyRef);
  if (!learning) throw new Error(`learning not found: ${learningKeyRef}`);
  if (learning.status !== "ACTIVE" && learning.status !== "DRAFT") {
    throw new Error(`learning not governable: ${learningKeyRef}`);
  }

  const id = input.id?.trim() || createId("evolrngov");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: EvolutionLearningGovernancePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: "ACTIVE",
    title,
    learningKeyRef,
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

export function getEvolutionLearningGovernancePolicy(
  id: string,
): EvolutionLearningGovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listEvolutionLearningGovernancePolicies(filter?: {
  kind?: EvolutionLearningGovernancePolicyKind;
  status?: EvolutionLearningGovernancePolicyStatus;
}): EvolutionLearningGovernancePolicy[] {
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

export function clearEvolutionLearningGovernancePolicies(): void {
  policies.clear();
  keys.clear();
}
