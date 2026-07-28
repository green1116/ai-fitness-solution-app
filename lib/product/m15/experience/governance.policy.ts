/**
 * Product M15 — Evolution experience governance policy registry (definition only)
 */

import { EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_KINDS } from "./experience.constants";
import { getEvolutionExperienceByKey } from "./experience.registry";
import type {
  EvolutionExperienceGovernancePolicy,
  EvolutionExperienceGovernancePolicyKind,
  EvolutionExperienceGovernancePolicyStatus,
  RegisterEvolutionExperienceGovernancePolicyInput,
} from "./experience.types";

const policies = new Map<string, EvolutionExperienceGovernancePolicy>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(
  policy: EvolutionExperienceGovernancePolicy,
): EvolutionExperienceGovernancePolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function registerEvolutionExperienceGovernancePolicy(
  input: RegisterEvolutionExperienceGovernancePolicyInput,
): EvolutionExperienceGovernancePolicy {
  const policyKey = input.policyKey.trim().toUpperCase();
  const title = input.title.trim();
  const experienceKeyRef = input.experienceKeyRef.trim().toUpperCase();
  const ruleRef = input.ruleRef.trim().toUpperCase();
  if (!policyKey) throw new Error("policy.policyKey is required");
  if (!title) throw new Error("policy.title is required");
  if (!experienceKeyRef) {
    throw new Error("policy.experienceKeyRef is required");
  }
  if (!ruleRef) throw new Error("policy.ruleRef is required");
  if (
    !(
      EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_KINDS as readonly string[]
    ).includes(input.kind)
  ) {
    throw new Error(`invalid policy kind: ${input.kind}`);
  }
  if (keys.has(policyKey)) {
    throw new Error(`policyKey already exists: ${policyKey}`);
  }

  const experience = getEvolutionExperienceByKey(experienceKeyRef);
  if (!experience) throw new Error(`experience not found: ${experienceKeyRef}`);
  if (experience.status !== "ACTIVE" && experience.status !== "DRAFT") {
    throw new Error(`experience not governable: ${experienceKeyRef}`);
  }

  const id = input.id?.trim() || createId("evoexgov");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const now = nowIso();
  const policy: EvolutionExperienceGovernancePolicy = {
    id,
    policyKey,
    kind: input.kind,
    status: "ACTIVE",
    title,
    experienceKeyRef,
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

export function getEvolutionExperienceGovernancePolicy(
  id: string,
): EvolutionExperienceGovernancePolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listEvolutionExperienceGovernancePolicies(filter?: {
  kind?: EvolutionExperienceGovernancePolicyKind;
  status?: EvolutionExperienceGovernancePolicyStatus;
}): EvolutionExperienceGovernancePolicy[] {
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

export function clearEvolutionExperienceGovernancePolicies(): void {
  policies.clear();
  keys.clear();
}
